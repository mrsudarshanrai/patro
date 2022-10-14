import { useState, useEffect } from 'react'
import {
  getDates,
  getMonth,
  getMonthFirstDay,
  createDateArrayOfLength,
  getPrevMonthDatesOffset,
  getNextMonthDatesOffset,
  buildDate,
  zeroPad,
} from '../utils/dateUtils'

import { currentMonth, currentYear, weeksDaysCount } from '../config'

type Imonth = [
  dates: Array<any>,
  dateObj: {
    year: number
    month: number
    monthName: string
    dateString: Date
  },
  nextMonth: () => void,
  prevMonth: () => void,
]

const useCalendarData = (date?: Date, isAd?: boolean): Imonth => {
  let cells: any = []
  const dates: any = []
  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(currentMonth)

  /** preserve current date */
  const [currDate, setCurrDate] = useState({
    month: currentMonth,
    year: currentYear,
    date: +zeroPad(0),
  })

  const [nextMonthDates, setNextMonthDates] = useState<Array<React.ReactNode>>([])

  useEffect(() => {
    if (date && 'getMonth' in date) {
      setMonth(date.getMonth() + 1)
      setYear(date.getFullYear())
      setCurrDate({
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        date: date.getDate(),
      })
    }
  }, [])

  const previousMonthDatesCount = getDates(month - 1, year)
  const currentMonthDatesCount = getDates(month, year)
  const nextMonthDatesCount = getDates(month + 1, year)

  const getMonthStartDayIndex = getMonthFirstDay(month, year)
  const nextMonthStartDay = getMonthFirstDay(month + 1, year)

  const previousMonthDates = getPrevMonthDatesOffset(previousMonthDatesCount, getMonthStartDayIndex)

  useEffect(() => {
    const nextMonthDates = getNextMonthDatesOffset(nextMonthDatesCount, nextMonthStartDay)
    setNextMonthDates(() => nextMonthDates)
  }, [month])

  const currentMonthDates = createDateArrayOfLength(currentMonthDatesCount, month, currDate)

  ;[...previousMonthDates, ...currentMonthDates, ...nextMonthDates].forEach((row, i) => {
    if (i % weeksDaysCount !== 0) {
      cells.push(row)
    } else {
      dates.push(cells)
      cells = []
      cells.push(row)
    }
    if (i === [...previousMonthDates, ...currentMonthDates, ...nextMonthDates].length - 1) {
      dates.push(cells)
    }
  })

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

  const dateObj = {
    year,
    month,
    monthName: getMonth(month),
    dateString: buildDate(year, month),
  }
  return [dates, dateObj, nextMonth, prevMonth]
}

export { useCalendarData }
