import { IUseCalendarData } from '../types/IHooks/IUseCalendarData';
import { CalendarSystem, PatroDate } from '../types/public';
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
    dayClassName?: (date: PatroDate) => string | undefined;
    range?: { start: string | null; end: string | null; preview?: string };
    onHoverDay?: (adDate?: string) => void;
  };

  export type CalendarHeaderProps = {
    title: string;
    subtitle: string;
    onTitleClick?: () => void;
    titleActionLabel?: string;
    prevLabel?: string;
    nextLabel?: string;
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
