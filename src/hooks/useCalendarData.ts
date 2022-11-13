import { useState, useEffect } from 'react'
import { getMonth } from '../utils/dateUtils'

import { currentDate, currentMonth, currentYear } from '../config'
import { IUseCalendarData } from 'types/IHooks/IUseCalendarData'
import { adToBs, createDateString } from 'utils'
import { getBsMonthName } from 'utils/bsDateUtils'
import { getBsRawDates, getRawDate } from 'utils/date'
import { ICalendar } from 'types/ICalendar'

const useCalendarData = (
  calendarType: ICalendar.calendarType,
  defaultDate?: Date,
): IUseCalendarData.IReturn => {
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

  const dates = getRawDate(year, month, date, currDate)
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
  /** BS date */
  const bsDates = getBsRawDates(bsDate, dates, year, month, date, currDate)

  if (calendarType === 'BS') return [bsDates, dateObj, nextMonth, prevMonth]
  return [dates, dateObj, nextMonth, prevMonth]
}

export { useCalendarData }
