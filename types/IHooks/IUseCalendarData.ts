export namespace IUseCalendarData {
  export type IReturn = [
    dates: IDates[][],
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
    year: number;
    month: number;
    adDate: string;
    extraDate: string;
    isToday: boolean;
    isSelected: boolean;
    offset?: 'prev' | 'next';
  }
}
