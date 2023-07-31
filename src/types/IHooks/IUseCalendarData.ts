export namespace IUseCalendarData {
  export type IReturn = [
    adDates: IDates[],
    dateObj: {
      bsDate: string;
      adDate: string;
      headerMonths: {
        month: string;
        oMonth: string;
        oYear: string;
        year: string;
      };
    },
    nextMonth: () => void,
    prevMonth: () => void,
  ];

  export interface ICurrDate {
    month: number;
    year: number;
    date: number;
  }
  export interface IDates {
    dayOfMonth: number | string;
    year?: number;
    month?: number;
    type: string;
    adDate: string;
    extraDate?: any;
  }
}
