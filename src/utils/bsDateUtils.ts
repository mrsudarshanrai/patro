import { bsToAd, createDateString, en2NpNumber, remove1stZero } from 'utils'
import { config, weeksDaysCount } from '../config'
const {
  np: { months },
} = config

const getBsMonthName = (month: string) => {
  const parsedMonth = +remove1stZero(month)
  const npMonthArr = Object.keys(months)
  const beforeMonthIndex = parsedMonth - 2
  return `${npMonthArr[beforeMonthIndex < 0 ? 11 : beforeMonthIndex]}/${
    npMonthArr[parsedMonth - 1]
  }`
}

const getBsMonthStartingDay = (arr: any) => {
  for (let a = 0; a < arr.length; a++) {
    const index = arr[a].findIndex((item: any) => item.bsDate === '०१')
    if (index > -1) {
      return index
    }
  }
}

const getBsPrevMonthDatesOffset = (...args: any) => {
  const [monthCount, length, year, month] = args
  // const prevMonth = month - 1 <= 0 ? '01' : month - 1
  if (length != 0)
    return Array.from({ length: monthCount }, (_, i) => ({
      date: en2NpNumber(String(i + 1)),
      year,
      month: month - 1,
      adDate: createDateString(year, month - 1, i + 1),
      type: '_patro_dates_date _patro_dates_current_month_date _patro_dates_date_offset _patro_dates_prev_month_date_offset',
    })).slice(-length)
  return []
}

const createBsMonths = (...args: any) => {
  const [length, year, month] = args
  return Array.from({ length }, (_, i) => ({
    date: en2NpNumber(String(i + 1)),
    year,
    month,
    adDate: createDateString(year, month, i + 1),
    type: '_patro_dates_date _patro_dates_current_month_date',
  }))
}

const getBsNextMonthDatesOffset = (...args: any) => {
  const [monthCount, length, year, month] = args
  return Array.from({ length: monthCount }, (_, i) => ({
    date: en2NpNumber(String(i + 1)),
    year,
    month: month + 1,
    adDate: createDateString(year, month + 1, i + 1),
    type: '_patro_dates_date _patro_dates_current_month_date _patro_dates_date_offset _patro_dates_next_month_date_offset',
  })).slice(0, weeksDaysCount - length)
}

export {
  getBsMonthName,
  getBsMonthStartingDay,
  createBsMonths,
  getBsPrevMonthDatesOffset,
  getBsNextMonthDatesOffset,
}
