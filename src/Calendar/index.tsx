import { useState } from 'react'
import { useCalendarData } from '../hooks/useCalendarData'
import { config } from '../config'
import '../scss/style.scss'
import { IUseCalendarData } from 'types/IHooks/IUseCalendarData'
import { ICalendar } from 'types/ICalendar'

const { en, np } = config

const IconNext = () => (
  <svg width='26' height='26' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path
      d='M12.9499 9.40832L8.23328 4.69999C8.15581 4.62188 8.06364 4.55989 7.96209 4.51758C7.86054 4.47527 7.75162 4.45349 7.64161 4.45349C7.5316 4.45349 7.42268 4.47527 7.32113 4.51758C7.21958 4.55989 7.12741 4.62188 7.04994 4.69999C6.89474 4.85613 6.80762 5.06734 6.80762 5.28749C6.80762 5.50764 6.89474 5.71885 7.04994 5.87499L11.1749 10.0417L7.04994 14.1667C6.89474 14.3228 6.80762 14.534 6.80762 14.7542C6.80762 14.9743 6.89474 15.1855 7.04994 15.3417C7.12712 15.4204 7.21916 15.483 7.32072 15.526C7.42229 15.5689 7.53135 15.5912 7.64161 15.5917C7.75187 15.5912 7.86094 15.5689 7.9625 15.526C8.06406 15.483 8.1561 15.4204 8.23328 15.3417L12.9499 10.6333C13.0345 10.5553 13.102 10.4606 13.1482 10.3552C13.1944 10.2497 13.2182 10.1359 13.2182 10.0208C13.2182 9.90574 13.1944 9.7919 13.1482 9.68648C13.102 9.58107 13.0345 9.48636 12.9499 9.40832Z'
      fill='#121212'
    />
  </svg>
)

const IconPrev = () => (
  <svg width='26' height='26' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path
      d='M7.08325 10.6666L11.8333 15.3333C12.1666 15.6666 12.6666 15.6666 12.9999 15.3333C13.3333 15 13.3333 14.5 12.9999 14.1666L8.91659 9.99996L12.9999 5.83329C13.3333 5.49996 13.3333 4.99996 12.9999 4.66663C12.8333 4.49996 12.6666 4.41663 12.4166 4.41663C12.1666 4.41663 11.9999 4.49996 11.8333 4.66663L7.08325 9.33329C6.74992 9.74996 6.74992 10.25 7.08325 10.6666C7.08325 10.5833 7.08325 10.5833 7.08325 10.6666Z'
      fill='#121212'
    />
  </svg>
)

const Calendar = (props: ICalendar.IProps) => {
  const { onChange, calendarType = 'AD', showExtra } = props
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dates, dateObj, nextMonth, prevMonth] = useCalendarData(calendarType, selectedDate)
  const {
    headerMonths: { month, oMonth, oYear, year },
  } = dateObj || {}

  const onSelect = (date: IUseCalendarData.IDates) => {
    setSelectedDate(() => new Date(date.adDate))
    onChange && onChange(date)
  }

  return (
    <div className='App'>
      <div className='_patro_container _patro'>
        <header className='_patro_header'>
          <button className='_patro_header_actionBtn' onClick={() => prevMonth()}>
            <IconPrev />
          </button>
          <h3 className='_patro_header_info'>
            <p className='_patro_header_info_month_year'>
              {month} {year}
            </p>
            <p className='_patro_header_info_month_year'>
              {oMonth} {oYear}
            </p>
          </h3>
          <button className='_patro_header_actionBtn' onClick={() => nextMonth()}>
            <IconNext />
          </button>
        </header>
        <div className='_patro_days'>
          {Object.values(calendarType === 'AD' ? en.days : np.days).map(
            (day: string, i: number) => (
              <div className='_patro_days_day' key={i + day}>
                {day}
              </div>
            ),
          )}
        </div>
        {dates.map((date: any, i: number) => {
          return (
            <div key={i} className='_patro_dates'>
              {date.map((item: IUseCalendarData.IDates, index: number) => {
                return (
                  <p
                    title={item.adDate}
                    onClick={() => onSelect(item)}
                    key={i + index}
                    className={item.type}
                  >
                    {item.date}
                    {showExtra && <sub>{item.extraDate}</sub>}
                  </p>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Calendar
