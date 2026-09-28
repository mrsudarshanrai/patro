export namespace IUseCalendarData {
  export interface IReturn {
    dates: IDates[][];
    adDate: string | null;
    bsDate: string | null;
    header: {
      month: string;
      oMonth: string;
      oYear: string;
      year: string;
    };
    nextMonth: () => void;
    prevMonth: () => void;
  }

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
