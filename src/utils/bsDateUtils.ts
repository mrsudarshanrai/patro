import { adToBs, bsToAd, createDateString, en2NpNumber, remove1stZero } from 'utils'
import { config, weeksDaysCount } from '../config'
import { switchYear } from './dateUtils'
const {
  np: { months },
} = config

const getBsMonthName = (month: string) => {
  const parsedMonth = +remove1stZero(month)
  const npMonthArr = Object.keys(months)
  return npMonthArr[parsedMonth - 1]
  // const beforeMonthIndex = parsedMonth - 2
  // return `${npMonthArr[beforeMonthIndex < 0 ? 11 : beforeMonthIndex]}/${
  //   npMonthArr[parsedMonth - 1]
  // }`
}

const getBsMonthStartingDay = (arr: any) => {
  for (let a = 0; a < arr.length; a++) {
    const index = arr[a].findIndex((item: any) => item.extraDate === '०१')
    if (index > -1) {
      return index
    }
  }
}

type IGetPrevMonthDatesOffset = [monthCount: number, length: number, year: number, month: number]

const getBsPrevMonthDatesOffset = (...args: IGetPrevMonthDatesOffset) => {
  const [monthCount, length, year, month] = args
  const { year: YEAR, month: MONTH } = switchYear(year, +month - 1)
  console.log(monthCount)
  if (length != 0)
    return Array.from({ length: monthCount }, (_, i) => ({
      date: en2NpNumber(String(i + 1)),
      year,
      month: MONTH,
      adDate: bsToAd(createDateString(YEAR, MONTH, i + 1)),
      bsDate: createDateString(YEAR, MONTH, i + 1),
      type: '_patro_dates_date _patro_dates_current_month_date _patro_dates_date_offset _patro_dates_prev_month_date_offset',
    })).slice(-length)
  return []
}

type ICreateBsMonths = [length: number, year: number, month: number]
const createBsMonths = (...args: ICreateBsMonths) => {
  const [length, year, month] = args
  return Array.from({ length }, (_, i) => ({
    date: en2NpNumber(String(i + 1)),
    year,
    month,
    adDate: '1',
    // adDate: bsToAd(createDateString(year, month, i + 1)),
    bsDate: createDateString(year, month, i + 1),
    type: '_patro_dates_date _patro_dates_current_month_date',
  }))
}

type IGetNextMonthDatesOffset = [monthCount: number, length: number, year: number, month: number]

const getBsNextMonthDatesOffset = (...args: IGetNextMonthDatesOffset) => {
  // console.log('bsDate', adToBs('2023-01-16'))
  const [monthCount, length, year, month] = args
  const { year: YEAR, month: MONTH } = switchYear(year, month )
  return Array.from({ length: monthCount }, (_, i) => {
    return {
      date: en2NpNumber(String(i + 1)),
      year: YEAR,
      month: MONTH + 1,
      adDate: '1',
      // adDate: bsToAd(createDateString(YEAR, MONTH + 1, i + 1)),
      bsDate: createDateString(YEAR, MONTH, i + 1),
      type: '_patro_dates_date _patro_dates_current_month_date _patro_dates_date_offset _patro_dates_next_month_date_offset',
    }
  }).slice(0, weeksDaysCount - length)
}

export {
  getBsMonthName,
  getBsMonthStartingDay,
  createBsMonths,
  getBsPrevMonthDatesOffset,
  getBsNextMonthDatesOffset,
}
