import { dates } from '../dates/dates'
import { config } from '../config'
const {
  np: { numbers },
} = config

const createDateString = (year: number, month: number, day: number) =>
  `${year}-${('0' + month).slice(-2)}-${('0' + day).slice(-2)}`
const startEnglishDate = '1921-04-13'

/** data sanitizer */
const isDayValid = (day: number) => day > 32 || day < 1 || !day
const isMonthValid = (month: number) => month > 12 || month < 1 || !month
const isYearValid = (year: number) => !year || year.toString().length < 4

const dateSanitizer = (date: string) => {
  const splittedDate = date.split('-')
  if (splittedDate.length !== 3) throw new Error('Date format is invalid')

  const [year, month, day] = date.split('-').map((item) => parseInt(item))

  if (isDayValid(day)) throw new Error('Day is invalid.')

  if (isMonthValid(month)) throw new Error('Month is invalid.')

  if (isYearValid(year)) throw new Error('Year is invalid.')

  return { year, month, day }
}
/** data sanitizer end */

/** BS date sanitizer */
const isBsYearValid = (year: number) => year < 1978 || year > 2099
const isBsDayValid = (day: number, year: number, month: number) => day > dates[year][month]

const sanitizeBsDate = (date: string) => {
  const { year, month, day } = dateSanitizer(date)
  if (isBsYearValid(year)) throw new Error('BS Date out of range')

  if (isBsDayValid(day, year, month)) throw new Error(`No ${day} day exits in this month.`)

  return createDateString(year, month, day)
}
/** BS date sanitizer end */

/** AD date sanitizer */
const isAdYearValid = (year: number) => year > 2040
const isAdMonthValid = (month: number) => month > 31

const sanitizeAdDate = (date: string) => {
  const { year, month, day } = dateSanitizer(date)

  if (isAdYearValid(year)) throw new Error('AD Date out of range')

  if (isAdMonthValid(month)) throw new Error('Month is invalid.')

  return createDateString(year, month, day)
}

const evaluateNepaliDate = (daysElpased: number) => {
  let currentYear = 0
  let currentMonth = 0
  let currentDay = 0
  let totalD = 0
  let flag = false

  for (let i = 1978; i < 2100; i++) {
    if (flag) {
      break
    }
    for (let j = 1; j <= 12; j++) {
      totalD += dates[i][j]
      if (daysElpased - totalD < 0) {
        currentDay = daysElpased - totalD + dates[i][j] + 1
        flag = true
        currentYear = i
        currentMonth = j
        break
      }
    }
  }
  return createDateString(currentYear, currentMonth, currentDay)
}

const evaluateEnglishDate = (date: string, days: number) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  const year = result.getFullYear()
  const month = result.getMonth() + 1
  const day = result.getDate()
  return `${year}-${month > 9 ? month : '0' + month}-${day > 9 ? day : '0' + day}`
}

const adToBs = (adDate: string) => {
  const startDate = new Date(startEnglishDate)
  const today = new Date(sanitizeAdDate(adDate))
  const daysDifference = Math.floor((today.getTime() - startDate.getTime()) / 86400000)
  if (daysDifference < 0) {
    throw new Error('AD Date out of range')
  }
  return evaluateNepaliDate(daysDifference)
}

const bsToAd = (bsDate: string) => {
  const [year, month, day] = sanitizeBsDate(bsDate)
    .split('-')
    .map((item) => parseInt(item))
  let daysDiff = 0
  for (let i = 1978; i <= year; i++) {
    if (i === year) {
      for (let j = 1; j < month; j++) {
        daysDiff += dates[i][j]
      }
      daysDiff += day - 1
    } else {
      for (let j = 1; j <= 12; j++) {
        daysDiff += dates[i][j]
      }
    }
  }
  return evaluateEnglishDate(startEnglishDate, daysDiff)
}

const en2NpNumber = (value: string) =>
  value
    .split('')
    .map((item) => numbers[item])
    .join('')

const remove1stZero = (value: string) => value.replace(/^0+/, '')

export { bsToAd, adToBs, en2NpNumber, remove1stZero }
