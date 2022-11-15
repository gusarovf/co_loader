import { from as copyFrom } from "pg-copy-streams"
import { Pool, PoolClient } from "pg"
import { Readable } from "stream"
import { db } from "../config"

export interface TransactReady {
  tableName: string
  tableColumns: string[]
  values: any[][]
}

const pool = new Pool(db)

export const poolQuery = async <T>(
  query: string,
  values?: Array<T>
): Promise<any> => {
  const client = await pool.connect()

  try {
    return (await client.query(query, values?.length ? values : []))?.rows
  } catch (err: any) {
    console.log(`Query: \n ${query}`)
    console.log(
      `Error while executing query at poolQuery (${err}). See query above.`
    )

    throw new Error(`Pool query error: ${err?.message}`)
  } finally {
    client.release()
  }
}

const sqlRecordVars = (parts: Array<string>, l: number, offset: number) => {
  parts.push("(")
  for (let i = 0; i < l; i++) {
    parts.push("$", (offset + i).toString(), ", ")
  }
  parts.push("$", (offset + l).toString(), ")")
}

export const sqlRecordSetVars = (
  records: number,
  fields: number,
  offset: number = 1
) => {
  const parts: Array<string> = []
  const lastRecord = records - 1
  const lastField = fields - 1
  let n = offset

  for (let i = 0; i < lastRecord; i++) {
    sqlRecordVars(parts, lastField, n)
    parts.push(", ")
    n += fields
  }

  sqlRecordVars(parts, lastField, n)

  return parts.join("")
}

const pgCopy = (
  client: PoolClient,
  tableName: string,
  tableColumns: string[],
  values: any[][]
): Promise<boolean> =>
  new Promise((resolve, reject) => {
    if (!values.length) resolve(true)
    if (tableColumns.length !== values[0].length) {
      console.log(tableColumns)
      console.log(values[0])
      throw new Error(
        `Table columns length are not equals values length. ${tableName}(${tableColumns.length} / ${values[0].length}).`
      )
    }

    const nullValueReplacer = "NULL_VALUE"
    const stream = client.query(
      copyFrom(
        `COPY ${tableName} (${tableColumns.join(",")})
        FROM STDIN WITH NULL AS '${nullValueReplacer}';`
      )
    )

    const rs = new Readable()
    let currentIndex = 0
    rs._read = function () {
      if (currentIndex === values.length) {
        rs.push(null)
      } else {
        let row = values[currentIndex]

        rs.push(
          row
            .map((val: any) => {
              // pg_copy doesnt accept null values
              if (typeof val === "number") return val
              if (!val?.length) return nullValueReplacer

              return val.replace(/[\n\r\t\\\/]/g, "") // PG errors because of carriage return symbol, tabulation symbol at the end of the string
            })
            .join("\t") + "\n"
        )

        currentIndex = currentIndex + 1
      }
    }

    stream.on("error", (error: Error) => {
      console.log(error)
      reject(error)
    })
    stream.on("finish", () => resolve((stream as any)._writableState.ended))
    rs.pipe(stream)
  })

export const transact = async (
  values: Array<TransactReady | undefined>
): Promise<boolean> => {
  const pTransact = async (): Promise<boolean> => {
    const client = await pool.connect()
    const statuses: boolean[] = []

    try {
      await client.query("BEGIN")

      const transactReadyVals = values.filter((v) => !!v) as TransactReady[]
      for (const transactReady of transactReadyVals) {
        statuses.push(
          await pgCopy(
            client,
            transactReady.tableName,
            transactReady.tableColumns,
            transactReady.values
          )
        )
      }

      await client.query("COMMIT")
    } catch (e) {
      await client.query("ROLLBACK")
      console.log(e)
      throw e
    } finally {
      client.release()
      return statuses.length >= 1 && !statuses.includes(false)
    }
  }

  try {
    return await pTransact()
  } catch (err) {
    console.log(`Error executing transaction (${err}). See query above.`)
    throw new Error("Pool transaction error.")
  }
}
