import { remove1stZero } from 'utils'
import { config } from '../config'
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
    const index = arr[a].findIndex((item: any) => item.bsDate === '१')
    if (index > -1) {
      return index
    }
  }
}

export { getBsMonthName, getBsMonthStartingDay }
