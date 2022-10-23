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

export { getBsMonthName }
