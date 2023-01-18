import { weeksDaysCount } from 'config'
import { IUseCalendarData } from 'types/IHooks/IUseCalendarData'
import {
  getDates,
  getMonthFirstDay,
  getPrevMonthDatesOffset,
  getNextMonthDatesOffset,
  createDateArrayOfLength,
  switchYear,
} from './dateUtils'
import { dates as bsDates } from '../config'
import {
  getBsMonthStartingDay,
  createBsMonths,
  getBsPrevMonthDatesOffset,
  getBsNextMonthDatesOffset,
} from './bsDateUtils'
import { remove1stZero } from 'utils'

const getRawDate = (...args: any) => {
  let cells: IUseCalendarData.IDates[] = []
  const dates: any[] = []
  const [YEAR, MONTH, date, currDate] = args
  const { year, month } = switchYear(YEAR, MONTH)

  /** prev, curr & next month AD dates  */
  const previousMonthDatesCount = getDates(month - 1, year)
  const currentMonthDatesCount = getDates(month, year)
  const nextMonthDatesCount = getDates(month + 1, year)

  const getMonthStartDayIndex = getMonthFirstDay(month, year)
  const nextMonthStartDay = getMonthFirstDay(month + 1, year)

  /** get AD date offsets */
  const previousMonthDates = getPrevMonthDatesOffset(
    previousMonthDatesCount,
    getMonthStartDayIndex,
    month,
    year,
  )
  const nextMonthDates = getNextMonthDatesOffset(
    nextMonthDatesCount,
    nextMonthStartDay,
    month,
    year,
  )
  const currentMonthDates = createDateArrayOfLength(
    currentMonthDatesCount,
    month,
    year,
    date,
    currDate,
  )

  const rawDate = [...previousMonthDates, ...currentMonthDates, ...nextMonthDates]
  rawDate.forEach((row: IUseCalendarData.IDates, i) => {
    if (i % weeksDaysCount !== 0) {
      cells.push(row)
    } else {
      dates.push(cells)
      cells = []
      cells.push(row)
    }
    if (i === rawDate.length - 1) {
      dates.push(cells)
    }
  })
  return dates
}

const getBsRawDates = (...args: any) => {
  const [bsDate, adDates, YEAR, MONTH, date, currDate] = args
  const { year, month } = switchYear(YEAR, MONTH)
  let cells: IUseCalendarData.IDates[] = []
  const dates: any[] = []
  const [bsYear, bsMonth, _] = bsDate.split('-')
  const currentBsYear = bsDates[bsYear]

  const bsMonthStartDayIndex = getBsMonthStartingDay(getRawDate(year, month, date, currDate))
  const nextBsMonthStartDayIndex = getBsMonthStartingDay(
    getRawDate(year, month + 1, date, currDate),
  )
  const previousBsMonthDatesCount = currentBsYear[+remove1stZero(bsMonth)]
  const currentBsMonthDatesCount = currentBsYear[remove1stZero(bsMonth)]
  const nextBsMonthDatesCount = currentBsYear[+remove1stZero(bsMonth) + 1]

  const previousMonthBsDates = getBsPrevMonthDatesOffset(
    previousBsMonthDatesCount,
    bsMonthStartDayIndex,
    bsYear,
    +remove1stZero(bsMonth),
  )
  const currentBsMonthDates = createBsMonths(
    currentBsMonthDatesCount,
    bsYear,
    +remove1stZero(bsMonth),
  )
  const nextMonthBsDates = getBsNextMonthDatesOffset(
    nextBsMonthDatesCount,
    nextBsMonthStartDayIndex,
    bsYear,
    +remove1stZero(bsMonth),
  )

  const rawDate = [...previousMonthBsDates, ...currentBsMonthDates, ...nextMonthBsDates]
  rawDate.forEach((row: IUseCalendarData.IDates, i) => {
    if (i % weeksDaysCount !== 0) {
      cells.push(row)
    } else {
      dates.push(cells)
      cells = []
      cells.push(row)
    }
    if (i === rawDate.length - 1) {
      dates.push(cells)
    }
  })
  return dates
}
export { getRawDate, getBsRawDates }
