import { adToBs, bsToAd } from '../src/utils'

const adDate = '2022-10-24'
const bsDate = '2079-07-07'

test('convert AD date to BS', () => {
  expect(adToBs(adDate)).toBe(bsDate)
})

test('convert BS date to AD', () => {
  expect(bsToAd(bsDate)).toBe(adDate)
})
