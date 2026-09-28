import { IUseCalendarData } from '../types/IHooks/IUseCalendarData';

export namespace ICalendar {
  export interface IProps {
    onChange?: (date: IUseCalendarData.IDates) => void; // onChange
    calendarType?: calendarType; // change calendar type
    showExtra?: boolean; // show/hide extra date
    defaultDate?: Date | null; // initial/synced selection; null = nothing selected, omitted = today
    theme?: 'light' | 'dark'; // sets data-theme on the root; light (the default tokens) needs no prop
  }

  export enum CalendarTypeEnum {
    AD = 'AD',
    BS = 'BS',
  }
  export type calendarType = keyof typeof CalendarTypeEnum;

  export type CalendarGridProps = {
    showExtra?: boolean;
    dates: IUseCalendarData.IDates[][];
    onSelect: (date: Onselect) => void;
    idPrefix: string;
    focusedAdDate?: string;
  };

  export type Onselect = {
    adDate: string;
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
