import { IUseCalendarData } from '../types/IHooks/IUseCalendarData';
import { CalendarSystem } from '../types/public';
import { DisplayOptions } from '../utils/formatUtils';

export namespace ICalendar {
  export enum CalendarTypeEnum {
    AD = 'AD',
    BS = 'BS',
  }
  export type calendarType = CalendarSystem;

  export type CalendarGridProps = {
    calendar: CalendarSystem;
    display: DisplayOptions;
    showSecondaryDate: boolean;
    dates: IUseCalendarData.IDates[][];
    onSelect: (adDate: string) => void;
    idPrefix: string;
    focusedAdDate?: string;
  };

  export type CalendarHeaderProps = {
    title: string;
    subtitle: string;
    nextMonth: () => void;
    prevMonth: () => void;
    canNextMonth: boolean;
    canPrevMonth: boolean;
  };

  export type CalendarDaysProps = {
    calendar: CalendarSystem;
    display: DisplayOptions;
    weekStartsOn: number;
    weekendDays?: number[];
  };
}
