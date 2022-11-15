export type CbrCoWorkSheet = [{ name: string; data: string[][] }]

export interface CreditOrganisation {
  ccode: number // id центробанка
  oldctbank: string // Вид
  newctbank: string | null // Вид
  csname: string // Сокращённое фирменное наименование
  cnamer: string // Полное фирменное наименование
  oldcopf: string // Организационно-правовая форма
  newcopf: string // Организационно-правовая форма (новое значение)

  // Регистрационный номер
  cregnum: number
  oldcregnr: string
  newcregnr: string | null

  cdreg: string // Дата регистрации ЦБ
  lic: string | null // Статус лицензии
  strcuraddr: string // Местонахождение
  ogrn: string // ОГРН
}
