import { nonPfxTbls } from "../schema"
import { UpdateRecord } from "../types"
import { poolQuery } from "../utils"

export const updateUpdateTablesExist = async (
  postfix: string,
  are_tables_exist: boolean
): Promise<boolean> => {
  if (!postfix?.length)
    throw new Error(`Error while updating update record.
   Postfix is empty. (${postfix})`)

  const response = await poolQuery(
    `UPDATE 
       ${nonPfxTbls.updateTbl}
     SET
       are_tables_exist = ${+are_tables_exist}
     WHERE tables_postfix='${postfix}'`
  )

  return response?.length ? true : false
}

export const updateUpdateRecord = async (
  updateRecordId: number,
  isLoaded: boolean,
  areTablesExist: boolean
): Promise<UpdateRecord> => {
  if (!updateRecordId) throw new Error("Error while updating update record.")

  const response = await poolQuery(
    `UPDATE
        ${nonPfxTbls.updateTbl} 
     SET 
        is_loaded=${+isLoaded},
        are_tables_exist=${+areTablesExist}
     WHERE id = ${updateRecordId} 
     RETURNING *;`
  )

  return response?.length ? response[0] : false
}
