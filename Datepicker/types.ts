import { ICalendar } from '../Calendar/types';

export namespace Datepicker {
  export type Props = ICalendar.IProps & {
    label?: string;
    placeholder?: string;
  };
}
