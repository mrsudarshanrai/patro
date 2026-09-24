import { IUseCalendarData } from '../types/IHooks/IUseCalendarData';

export namespace ICalendar {
  export interface IProps {
    onChange?: (date: IUseCalendarData.IDates) => void; // onChange
    calendarType?: calendarType; // change calendar type
    showExtra?: boolean; // show/hide extra date
    defaultDate?: Date; // date the calendar opens on / stays in sync with
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
  };

  export type CalendarDaysProps = {
    calendarType: calendarType;
  };
}
