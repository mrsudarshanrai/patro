import { adToBs, bsToAd, dateString2Obj, validateBsDate } from '../src/utils'

const adDate = '2022-10-24'
const bsDate = '2079-07-07'

test('Date string to Obj', () => {
  expect(dateString2Obj(adDate)).toEqual({
    year: 2022,
    month: 10,
    day: 24,
  })
})

test('Validate BS date', () => {
  expect(validateBsDate(bsDate)).toBe(bsDate)
})

test('Validate AD date', () => {
  expect(validateBsDate(adDate)).toBe(adDate)
})

test('Convert AD date to BS', () => {
  expect(adToBs(adDate)).toBe(bsDate)
})

test('Convert BS date to AD', () => {
  expect(bsToAd(bsDate)).toBe(adDate)
})
