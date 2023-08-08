import { IUseCalendarData } from './IHooks/IUseCalendarData';

export namespace ICalendar {
  export interface IProps {
    onChange?: (date: IUseCalendarData.IDates) => void; // onChange
    calendarType?: calendarType; // change calendar type
    showExtra?: boolean; // show/hide extra date
  }
  export type calendarType = 'AD' | 'BS';
}
