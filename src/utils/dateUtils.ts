import { currentYear, currentMonth, weeksDaysCount, config } from 'config'
import { IDateUtils } from 'types/IUtils/IDateUtils'
import { adToBs, createDateString, en2NpNumber, zeroPad } from 'utils'
const {
  en: { months },
} = config

const getDates = (month = currentMonth, year = currentYear) => new Date(year, month, 0).getDate()

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
    adDate: createDateString(year, month, i + 1),
    bsDate: en2NpNumber(adToBs(createDateString(year, month, i + 1)).split('-')[2]),
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
      adDate: createDateString(year, month - 1, i + 1),
      bsDate: en2NpNumber(adToBs(createDateString(year, +prevMonth, i + 1)).split('-')[2]),
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
    adDate: createDateString(year, month + 1, i + 1),
    bsDate: en2NpNumber(adToBs(createDateString(year, month, i + 1)).split('-')[2]),
    type: '_patro_dates_date _patro_dates_current_month_date _patro_dates_date_offset _patro_dates_next_month_date_offset',
  })).slice(0, weeksDaysCount - length)
}

export {
  zeroPad,
  createDateString,
  getDates,
  getMonthFirstDay,
  getMonth,
  createDateArrayOfLength,
  getPrevMonthDatesOffset,
  getNextMonthDatesOffset,
}
