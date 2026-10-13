import { useControllableValue } from '../../hooks/useControllableValue';
import {
  adDateToLocalDate,
  EMPTY_RANGE,
  supportedAdDate,
  supportedAdRange,
  toInputDate,
  toPatroDate,
} from '../../utils';
import type {
  DateInput,
  DateRangeInput,
  RangeSelection,
  SingleSelection,
} from '../../types/public';
import type { UseCalendarValueOptions } from '../CalendarType';

const useCalendarValue = ({ isRange, value, defaultValue, onChange }: UseCalendarValueOptions) => {
  const [currentValue, setValue] = useControllableValue<DateInput | DateRangeInput | null>(
    value,
    () => (defaultValue !== undefined ? defaultValue : isRange ? EMPTY_RANGE : null),
  );
  const currentRange = isRange ? ((currentValue as DateRangeInput | null) ?? EMPTY_RANGE) : null;
  const range = currentRange && supportedAdRange(currentRange);
  // In range mode the start anchors the view, like a single selection would.
  const singleValue = range ? null : (currentValue as DateInput | null);
  // Warns about an out-of-range value like Datepicker; the view still opens on the nearest month.
  supportedAdDate(singleValue);
  const selectedDate = range
    ? range.start && adDateToLocalDate(range.start)
    : toInputDate(singleValue);

  const commitRange = (start: string, end: string | null) => {
    setValue({ start: adDateToLocalDate(start), end: end ? adDateToLocalDate(end) : null });
    (onChange as RangeSelection['onChange'])?.({
      start: toPatroDate(start),
      end: end ? toPatroDate(end) : null,
    });
  };

  const commitDay = (adDate: string) => {
    const selected = toPatroDate(adDate);
    setValue(selected.date);
    (onChange as SingleSelection['onChange'])?.(selected);
  };

  return { range, selectedDate, commitDay, commitRange };
};

export { useCalendarValue };
