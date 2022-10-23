import { IUseCalendarData } from 'types/IHooks/IUseCalendarData'

export namespace IDateUtils {
  export type ICreateDateArray_Params = [
    length: number,
    month: number,
    year: number,
    date: number,
    currDate: IUseCalendarData.ICurrDate,
  ]

  export type IGetMonthOffset_Params = [
    monthCount: number,
    length: number,
    month: number,
    year: number,
  ]
}
