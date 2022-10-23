import { IUseCalendarData } from './IHooks/IUseCalendarData'

export namespace ICalendar {
  export interface IProps {
    onChange: (date: IUseCalendarData.IDates) => void
  }
}
