import { downTables, upHelpTables, upMainTables } from "./database"
import { CreditOrganisation, CbrCoWorkSheet } from "./source/types"
import { loadCbr, prepareCo, validateCoRecord } from "./source/cbr"
import { insertUpdateRecord } from "./database/actions/inserts"
import { getLatestUpdate } from "./database/actions/selects"
import { transact } from "./database/utils"
import { hoursToMs, msToTimeString } from "./utils"
import { startKubeServer } from "./server"
import { cfg } from "./config"
import {
  buildMainTablesIndexes,
  buildNonPfxTblsIndexes,
} from "./database/actions/indexes"
import {
  updateUpdateRecord,
  updateUpdateTablesExist,
} from "./database/actions/updates"
import fs from "fs"

const loadLocal = () => {
  const workSheets: CbrCoWorkSheet = JSON.parse(
    fs.readFileSync("./data.json").toString()
  )

  const headers: string[] = workSheets[0].data[0]

  return workSheets[0].data.slice(1).map((co: string[]) =>
    headers.reduce((accumulator, value, index) => {
      return { ...accumulator, [value]: co[index] }
    }, {})
  ) as CreditOrganisation[]
}

const insertUpdate = async (postfix: string) => {
  const data = await loadCbr()
  const totalRecords = data.length
  console.log("Found " + totalRecords + " new records.")

  validateCoRecord(data[0])

  const newUpdate = await insertUpdateRecord(postfix, totalRecords)

  await downTables(postfix)
  await updateUpdateTablesExist(postfix, false)
  await upMainTables(postfix)

  const preparedBics = prepareCo(data, postfix, newUpdate!.id)
  const result = await transact([preparedBics])

  if (result) {
    await updateUpdateRecord(newUpdate!.id, true, true)
    await buildMainTablesIndexes(postfix)
    console.log("Loading ended. \n")
  }
}

const loadUpdate = async (): Promise<void> => {
  process.on("uncaughtException", (e) => {
    console.log("Uncaught error:")
    throw e
  })

  console.log("Update initiated.")

  await upHelpTables()
  await buildNonPfxTblsIndexes()

  let latestUpdatePostfix = (await getLatestUpdate())?.tablesPostfix

  if (!latestUpdatePostfix) {
    const postfix = cfg.postfixes.primary
    await insertUpdate(postfix)

    return
  }

  const postfix =
    latestUpdatePostfix === cfg.postfixes.primary
      ? cfg.postfixes.secondary
      : cfg.postfixes.primary

  await insertUpdate(postfix)
}

const loopUpdate = (): void => {
  loadUpdate().then(nextLoop).catch(handleErr)
}

const nextLoop = (): void => {
  const repeatTime = hoursToMs(cfg.updateDelay)
  if (!repeatTime)
    throw new Error(`Cannot set repeat time. Repeat time val: ${repeatTime}`)

  setTimeout(loopUpdate, repeatTime)
}

const handleErr = (err: Error): void => {
  console.log(
    `Error caught. Try to repeat action in ${msToTimeString(
      +cfg.errRetryDelay
    )}.`
  )

  console.log(err)
  setTimeout(loopUpdate, +cfg.errRetryDelay)
}

startKubeServer()
loopUpdate()
