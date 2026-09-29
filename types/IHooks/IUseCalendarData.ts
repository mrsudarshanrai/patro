export namespace IUseCalendarData {
  export interface IReturn {
    dates: IDates[][];
    adDate: string | null;
    bsDate: string | null;
    firstAdDate: string;
    lastAdDate: string;
    nextMonth: () => void;
    prevMonth: () => void;
    goToMonth: (year: number, month: number) => void;
    canNextMonth: boolean;
    canPrevMonth: boolean;
    minAdDate: string;
    maxAdDate: string;
    isDayDisabled: (adDate: string) => boolean;
  }

  export interface ICurrDate {
    month: number;
    year: number;
    date: number;
  }
  export interface IDates {
    /** Day in the displayed calendar; null for days outside the BS table. */
    day: number | null;
    /** Same day in the other calendar; null for days outside the BS table. */
    secondaryDay: number | null;
    year: number;
    month: number;
    adDate: string;
    isToday: boolean;
    isSelected: boolean;
    isDisabled?: boolean;
    isWeekend?: boolean;
    offset?: 'prev' | 'next';
  }
}
