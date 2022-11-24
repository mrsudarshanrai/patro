export namespace IUseCalendarData {
  export type IReturn = [
    adDates: IDates[],
    dateObj: {
      year: number
      month: number
      monthName: string
      bsDate: string
      adDate: string
      bsMonthName: string
      bsYear: string
    },
    nextMonth: () => void,
    prevMonth: () => void,
  ]

  export interface ICurrDate {
    month: number
    year: number
    date: number
  }
  export interface IDates {
    date: number | string
    year?: number
    month?: number
    type: string
    adDate: string
    extraDate?: any
  }
}
