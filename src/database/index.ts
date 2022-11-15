import { poolQuery } from "./utils"
import * as schema from "./schema"

export const upHelpTables = async (): Promise<void> => {
  await poolQuery([schema.updates()].join(" "))
}
export const upMainTables = async (postfix: string): Promise<void> => {
  await poolQuery([schema.co(postfix)].join(" "))
}

export const downTables = async (postfix: string = "") => {
  const mainTables = Object.values(schema.mainPfxTbls).map(
    (val: string) => `${val}${postfix}`
  )
  const query = `DROP TABLE IF EXISTS ${mainTables};`

  try {
    await poolQuery(`DROP TABLE IF EXISTS ${mainTables};`)
  } catch (err) {
    console.log(`Query: \n ${query}`)
    console.log(`Error while dropping tables (${err}). See query above.`)
  }
}
