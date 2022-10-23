export namespace IUseCalendarData {
  export type IReturn = [
    dates: IDates[],
    dateObj: {
      year: number
      month: number
      monthName: string
      bsDate: string
      adDate: string
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
    date: number
    year?: number
    month?: number
    type: string
    adDate?: string
    bsDate?: number
  }
}
