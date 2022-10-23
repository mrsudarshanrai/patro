import { currentYear, currentMonth, weeksDaysCount, config } from 'config'
import { IDateUtils } from 'types/IUtils/IDateUtils'
import { adToBs, en2NpNumber } from 'utils'
const {
  en: { months },
} = config

const zeroPad = (value: number | undefined) => ('0' + value).slice(-2)
const buildDate = (year: number, month: number, date?: number) =>
  `${year}-${zeroPad(month)}-${date || '01'}`

const getDates = (month = currentMonth, year = currentYear) => {
  const months30 = [4, 6, 9, 11]
  const leapYear = year % 4 === 0
  return month === 2 ? (leapYear ? 29 : 28) : months30.includes(month) ? 30 : 31
}

const getMonth = (month: number) => Object.keys(months)[month - 1]

const getMonthFirstDay = (month = currentMonth, year = currentYear) => {
  return +new Date(`${year}-${zeroPad(month)}-01`).getDay()
}

const createDateArrayOfLength = (...args: IDateUtils.ICreateDateArray_Params) => {
  const [length, month, year, date, currDate] = args
  const { month: currMonth } = currDate
  return Array.from({ length }, (_, i) => ({
    date: i + 1,
    year,
    month,
    adDate: buildDate(year, month, i + 1),
    bsDate: en2NpNumber(adToBs(buildDate(year, month, i + 1)).split('-')[2]),
    type: `_patro_dates_date _patro_dates_current_month_date ${
      month === currMonth && date === i + 1 ? '_patro_dates_current_date' : ''
    }`,
  }))
}

const getPrevMonthDatesOffset = (...args: IDateUtils.IGetMonthOffset_Params) => {
  const [monthCount, length, month, year] = args
  const prevMonth = month - 1 <= 0 ? '01' : month - 1
  if (length != 0)
    return Array.from({ length: monthCount }, (_, i) => ({
      date: i + 1,
      year,
      month: month - 1,
      bsDate: en2NpNumber(adToBs(buildDate(year, +prevMonth, i + 1)).split('-')[2]),
      type: '_patro_dates_date _patro_dates_current_month_date _patro_dates_date_offset _patro_dates_prev_month_date_offset',
    })).slice(-length)
  return []
}

const getNextMonthDatesOffset = (...args: IDateUtils.IGetMonthOffset_Params) => {
  const [monthCount, length, month, year] = args
  return Array.from({ length: monthCount }, (_, i) => ({
    date: i + 1,
    year,
    month: month + 1,
    bsDate: en2NpNumber(adToBs(buildDate(year, month, i + 1)).split('-')[2]),
    type: '_patro_dates_date _patro_dates_current_month_date _patro_dates_date_offset _patro_dates_next_month_date_offset',
  })).slice(0, weeksDaysCount - length)
}

export {
  zeroPad,
  buildDate,
  getDates,
  getMonthFirstDay,
  getMonth,
  createDateArrayOfLength,
  getPrevMonthDatesOffset,
  getNextMonthDatesOffset,
}
