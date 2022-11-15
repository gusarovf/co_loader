export const cfg = {
  coSource: "https://cbr.ru/banking_sector/credit/FullCoList/",
  postfixes: {
    primary: "_prim",
    secondary: "_secon",
  },
  updateDelay: process.env.UPDATE_DELAY_HOURS
    ? +process.env.UPDATE_DELAY_HOURS
    : 24, // Hours
  errRetryDelay: process.env.ERR_RETRY_DELAY_MSECS
    ? +process.env.ERR_RETRY_DELAY_MSECS
    : 180000, // MSecs
}

export const db = {
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/postgres",
}
