import { currentYear, currentMonth, months, weeksDaysCount } from 'config'

const zeroPad = (value: number | undefined) => ('0' + value).slice(-2)
const buildDate = (year: number, month: number, date?: number) =>
  new Date(`${year}-${zeroPad(month)}-${date || '01'}`)

const getDates = (month = currentMonth, year = currentYear) => {
  const months30 = [4, 6, 9, 11]
  const leapYear = year % 4 === 0
  return month === 2 ? (leapYear ? 29 : 28) : months30.includes(month) ? 30 : 31
}

const getMonth = (month: number) => Object.keys(months)[month - 1]

const getMonthFirstDay = (month = currentMonth, year = currentYear) => {
  return +new Date(`${year}-${zeroPad(month)}-01`).getDay()
}

const createDateArrayOfLength = (length: number, month: number, currDate: any) => {
  const { month: currMonth, date, year } = currDate
  return Array.from({ length }, (_, i) => ({
    date: i + 1,
    year,
    month,
    dateStrig: buildDate(year, month, i + 1),
    type: `_patro_dates_date _patro_dates_currentMonth_date ${
      month === currMonth && date === i + 1 ? '_patro_dates_current_date' : ''
    }`,
  }))
}

const getPrevMonthDatesOffset = (monthCount: number, length: number) => {
  if (length != 0)
    return Array.from({ length: monthCount }, (_, i) => ({
      date: i + 1,
      type: '_patro_dates_date _patro_dates_currentMonth_date _patro_dates_date_offset _patro_dates_prev_month_date_offset',
    })).slice(-length)
  return []
}

const getNextMonthDatesOffset = (monthCount: number, length: number) =>
  Array.from({ length: monthCount }, (_, i) => ({
    date: i + 1,
    type: '_patro_dates_date _patro_dates_currentMonth_date _patro_dates_date_offset _patro_dates_next_month_date_offset',
  })).slice(0, weeksDaysCount - length)

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
