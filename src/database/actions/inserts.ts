import { nonPfxTbls } from "../schema"
import { UpdateRecord } from "../types"
import { poolQuery } from "../utils"

export const insertUpdateRecord = async (
  postfix: string = "",
  totalRecords: number
): Promise<UpdateRecord | null> => {
  const res = await poolQuery(
    `INSERT INTO ${nonPfxTbls.updateTbl}
       (
         tables_postfix,
         total_records
       )
     VALUES ($1,$2)
     RETURNING           
        id,
        tables_postfix AS "tablesPostfix",
        is_loaded AS "isLoaded", 
        are_tables_exist AS "areTablesExist",
        loaded_at AS "loadedAt";`,
    [postfix, totalRecords]
  )

  return res?.length ? res[0] : null
}
