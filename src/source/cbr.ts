import { TransactReady } from "../database/utils"
import { CbrCoWorkSheet, CreditOrganisation } from "./types"
import { mainPfxTbls } from "../database/schema"
import { cfg } from "../config"
import { fetchUrl, isFullUrl } from "../utils"
import cheerio from "cheerio"
import xlsx from "node-xlsx"

const findLinkXlsLink = async (url: string) => {
  const page = await fetchUrl(url)
  const $ = cheerio.load(page)
  let exportButtonHref = $(".b-export_button").attr("href")
  if (!exportButtonHref) throw new Error("No link to file.")

  return exportButtonHref
}

const fixUrl = (url: string, exampleUrl: string) => {
  if (!isFullUrl(url)) {
    const correctUrl = new URL(exampleUrl)
    if (!url.startsWith("/")) url = "/" + url
    url = correctUrl.protocol + "//" + correctUrl.hostname + url
  }

  return url
}

const transformData = (workSheetData: string[][]): CreditOrganisation[] => {
  const headers: string[] = workSheetData[0]

  return workSheetData.slice(1).map((co: string[]) =>
    headers.reduce((accumulator, value, index) => {
      return { ...accumulator, [value]: co[index] }
    }, {})
  ) as CreditOrganisation[]
}

export const loadCbr = async () => {
  const sourceUrl = cfg.coSource

  return findLinkXlsLink(sourceUrl)
    .then((xlsLink) => fixUrl(xlsLink, sourceUrl))
    .then((url) => fetchUrl(url))
    .then((fileBuffer) => xlsx.parse(fileBuffer) as CbrCoWorkSheet)
    .then((workSheet) => transformData(workSheet[0].data))
}
export const validateCoRecord = (record: CreditOrganisation): void => {
  if (!record) throw new Error("No record")

  //   const regNum = record?.RegNum[0]
  //   const bic = record?.Bic[0]
  //   const shortName = record?.ShortName[0]

  //   if (typeof shortName !== "string")
  //     throw new Error("Record shortName is of string type")

  //   if (!shortName.length) throw new Error("Record shortName is empty")

  //   if (typeof +regNum?._ !== "number")
  //     throw new Error("Record RegNum is not of number type")

  //   if (regNum?._?.length !== 13)
  //     throw new Error("Record RegNum is not 9 digits length")

  //   if (bic?.length !== 9) throw new Error("Record Bic is not 9 digits length")

  //   if (
  //     !new RegExp(
  //       /^(0?[1-9]|[12][0-9]|3[01])[\/\-\.](0?[1-9]|1[012])[\/\-\.]\d{4}$/
  //     ).test(regNum?.$?.date || "")
  //   )
  //     throw new Error("Record date has wrong format")
}

export const prepareCo = (
  co: CreditOrganisation[],
  postfix: string,
  updateId: number
): TransactReady => {
  // Prepare credit organisations for PG copy transaction
  const cols = [
    "update_id",
    "ccode",
    "oldctbank",
    "newctbank",
    "csname",
    "cnamer",
    "oldcopf",
    "newcopf",
    "cregnum",
    "oldcregnr",
    "newcregnr",
    "cdreg",
    "lic",
    "strcuraddr",
    "ogrn",
  ]

  return {
    tableName: mainPfxTbls.co + postfix,
    tableColumns: cols,
    values: co.map((record) => {
      return [updateId, ...Object.values(record)]
    }),
  }
}
