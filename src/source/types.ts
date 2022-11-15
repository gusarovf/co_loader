export type CbrCoWorkSheet = [{ name: string; data: string[][] }]

export interface CreditOrganisation {
  ccode: number
  oldctbank: string
  newctbank: string | null
  csname: string
  cnamer: string
  oldcopf: string
  newcopf: string
  cregnum: number
  oldcregnr: string
  newcregnr: string | null
  cdreg: string
  lic: string | null
  strcuraddr: string
  ogrn: string
}

