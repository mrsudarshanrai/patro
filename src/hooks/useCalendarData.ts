import { useState, useEffect } from 'react'
import {
  getDates,
  getMonth,
  getMonthFirstDay,
  createDateArrayOfLength,
  getPrevMonthDatesOffset,
  getNextMonthDatesOffset,
} from '../utils/dateUtils'

import { currentDate, currentMonth, currentYear, weeksDaysCount } from '../config'
import { IUseCalendarData } from 'types/IHooks/IUseCalendarData'
import { adToBs, createDateString } from 'utils'
import { getBsMonthName, getBsMonthStartingDay } from 'utils/bsDateUtils'

const useCalendarData = (defaultDate?: Date): IUseCalendarData.IReturn => {
  let cells: IUseCalendarData.IDates[] = []
  const dates: any[] = []

  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(currentMonth)
  const [date, setDate] = useState(currentDate)
  /** preserve current date */
  const [currDate, setCurrDate] = useState<IUseCalendarData.ICurrDate>({
    month: currentMonth,
    year: currentYear,
    date: currentDate,
  })

  useEffect(() => {
    if (defaultDate && 'getMonth' in defaultDate) {
      setMonth(() => defaultDate.getMonth() + 1)
      setYear(() => defaultDate.getFullYear())
      setDate(() => defaultDate.getDate())
      setCurrDate({
        month: defaultDate.getMonth() + 1,
        year: defaultDate.getFullYear(),
        date: defaultDate.getDate(),
      })
    }
  }, [])

  const nextMonth = () => {
    if (month === 12) {
      setYear((prevYear) => prevYear + 1)
      setMonth(() => 1)
    } else setMonth((prev) => prev + 1)
  }

  const prevMonth = () => {
    if (month <= 1) {
      setYear((prevYear) => prevYear - 1)
      setMonth(() => 12)
    } else setMonth((prev) => prev - 1)
  }

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

  /**
   * merge dates & create 3d array
   */
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

  const bsDate = adToBs(createDateString(year, month, date))

  const dateObj = {
    year,
    month,
    monthName: getMonth(month),
    adDate: createDateString(year, month, date),
    bsDate,
    bsMonthName: getBsMonthName(bsDate.split('-')[1]),
    bsYear: bsDate.split('-')[0],
  }
  console.log(dates)
  /** BS date */
  const getBsMonthStartDayIndex = getBsMonthStartingDay(dates)

  return [dates, dateObj, nextMonth, prevMonth]
}

export { useCalendarData }
