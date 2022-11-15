import { mainPfxTbls, nonPfxTbls } from "../schema"
import { poolQuery } from "../utils"

const nonPfxTblsIndexesQueryArr = (): string[] => [
  `CREATE INDEX IF NOT EXISTS update_tables_postfix ON ${nonPfxTbls.updateTbl} (tables_postfix);`,
  `CREATE INDEX IF NOT EXISTS update_id ON ${nonPfxTbls.updateTbl} (id);`,
]

const mainTablesIndexesQueryArr = (postfix: string = ""): string[] => [
  `CREATE INDEX IF NOT EXISTS ogrn${postfix} ON ${mainPfxTbls.co}${postfix} (cregnum);`,
]

export const buildNonPfxTblsIndexes = async (
): Promise<void> => {
  const query = nonPfxTblsIndexesQueryArr().join(" ")
  try {
    await poolQuery(query)
  } catch (error: any) {
    console.log(
      `Error while adding indexes to help tables (${error.message}). \n Query: \n ${query}`
    )
  }
}

export const buildMainTablesIndexes = async (
  postfix: string = ""
): Promise<void> => {
  const query = mainTablesIndexesQueryArr(postfix).join(" ")
  try {
    await poolQuery(query)
    console.log("Main tables indexes built.")
  } catch (error: any) {
    console.log(
      `Error while adding indexes to help tables (${error.message}). \n Query: \n ${query}`
    )
  }
}
