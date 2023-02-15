import { adToBs, bsToAd, createDateString, en2NpNumber, remove1stZero } from 'utils'
import { config, dates as bsDates, weeksDaysCount } from '../config'
import { switchYear } from './dateUtils'
const {
  np: { months },
} = config

const getBsMonthStartingDay = (arr: any) => {
  for (let a = 0; a < arr.length; a++) {
    const index = arr[a].findIndex((item: any) => item.extraDate === '०१')
    if (index > -1) {
      return index
    }
  }
}

const getBSMonthYear = (month: number, currentBsYear: number) => {
  if (month > 12) {
    const newBsYear = currentBsYear + 1
    return {
      bsYearDates: bsDates[newBsYear],
      bsMonthCount: bsDates[newBsYear][1],
    }
  } else if (month < 1) {
    const newBsYear = currentBsYear - 1
    return {
      bsYearDates: bsDates[newBsYear],
      bsMonthCount: bsDates[newBsYear][12],
    }
  } else
    return {
      bsYearDates: bsDates[currentBsYear],
      bsMonthCount: bsDates[currentBsYear][month],
    }
}

type IGetPrevMonthDatesOffset = [monthCount: number, length: number, year: number, month: number]

const getBsPrevMonthDatesOffset = (...args: IGetPrevMonthDatesOffset) => {
  const [monthCount, length, year, month] = args
  const { year: YEAR, month: MONTH } = switchYear(year, month)
  // const prevDates = {
  //   length: monthCount,
  //   MONTH,
  //   YEAR,
  // }

  if (length != 0)
    return Array.from({ length: monthCount }, (_, i) => ({
      date: en2NpNumber(String(i + 1)),
      year,
      month: MONTH,
      adDate: bsToAd(createDateString(YEAR, MONTH, i + 1)),
      bsDate: createDateString(YEAR, MONTH, i + 1),
      extraDate: bsToAd(createDateString(YEAR, MONTH, i + 1)).split('-')[2],
      type: '_patro_dates_date _patro_dates_current_month_date _patro_dates_date_offset _patro_dates_prev_month_date_offset',
    })).slice(-length)
  return []
}

type ICreateBsMonths = [length: number, year: number, month: number]
const createBsMonths = (...args: ICreateBsMonths) => {
  const [length, year, month] = args
  // const currentDates = {
  //   length,
  //   month,
  //   year,
  // }

  return Array.from({ length }, (_, i) => ({
    date: en2NpNumber(String(i + 1)),
    year,
    month,
    adDate: bsToAd(createDateString(year, month, i + 1)),
    bsDate: createDateString(year, month, i + 1),
    extraDate: bsToAd(createDateString(year, month, i + 1)).split('-')[2],
    type: '_patro_dates_date _patro_dates_current_month_date',
  }))
}

type IGetNextMonthDatesOffset = [monthCount: number, length: number, year: number, month: number]

const getBsNextMonthDatesOffset = (...args: IGetNextMonthDatesOffset) => {
  const [monthCount, length, year, month] = args
  const { year: YEAR, month: MONTH } = switchYear(year, month)
  // const nextDates = {
  //   length: monthCount,
  //   MONTH,
  //   YEAR,
  // }

  return Array.from({ length: monthCount }, (_, i) => {
    return {
      date: en2NpNumber(String(i + 1)),
      year: YEAR,
      month: MONTH + 1,
      adDate: bsToAd(createDateString(YEAR, MONTH, i + 1)),
      bsDate: createDateString(YEAR, MONTH, i + 1),
      extraDate: bsToAd(createDateString(YEAR, MONTH, i + 1)).split('-')[2],
      type: '_patro_dates_date _patro_dates_current_month_date _patro_dates_date_offset _patro_dates_next_month_date_offset',
    }
  }).slice(0, weeksDaysCount - length)
}

export {
  getBsMonthStartingDay,
  createBsMonths,
  getBsPrevMonthDatesOffset,
  getBsNextMonthDatesOffset,
  getBSMonthYear,
}
