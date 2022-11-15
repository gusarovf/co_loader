import { nonPfxTbls } from "../schema"
import { UpdateRecord } from "../types"
import { poolQuery } from "../utils"


export const getLatestUpdate = async (): Promise<UpdateRecord> => {
  const res = await poolQuery(`
        SELECT 
          id,
          tables_postfix AS "tablesPostfix",
          is_loaded AS "isLoaded", 
          are_tables_exist AS "areTablesExist",
          loaded_at AS "loadedAt"
        FROM
          ${nonPfxTbls.updateTbl} 
        WHERE
            are_tables_exist = 1
        ORDER BY 
          id DESC
        LIMIT 1
      `)

  return res?.length ? res[0] : null
}
