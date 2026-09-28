import { IUseCalendarData } from '../types/IHooks/IUseCalendarData';
import { CalendarSystem } from '../types/public';

export namespace ICalendar {
  export enum CalendarTypeEnum {
    AD = 'AD',
    BS = 'BS',
  }
  export type calendarType = CalendarSystem;

  export type CalendarGridProps = {
    showSecondaryDate: boolean;
    dates: IUseCalendarData.IDates[][];
    onSelect: (adDate: string) => void;
    idPrefix: string;
    focusedAdDate?: string;
  };

  export type CalendarHeaderProps = {
    month: string;
    year: string;
    oMonth: string;
    oYear: string;
    nextMonth: () => void;
    prevMonth: () => void;
    canNextMonth: boolean;
    canPrevMonth: boolean;
  };

  export type CalendarDaysProps = {
    calendarType: calendarType;
  };
}
