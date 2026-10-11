import { EMPTY_RANGE, supportedAdDate, supportedAdRange } from '../../utils';
import { useControllableValue } from '../../hooks/useControllableValue';
import type {
  DateInput,
  DateRangeInput,
  PatroDate,
  PatroDateRange,
  RangeSelection,
  SingleSelection,
} from '../../types/public';
import type { UseDatepickerValueOptions } from '../DatepickerType';

const useDatepickerValue = ({
  isRange,
  value,
  defaultValue,
  onChange,
}: UseDatepickerValueOptions) => {
  const [currentValue, setValue] = useControllableValue<DateInput | DateRangeInput | null>(
    value,
    () => (defaultValue !== undefined ? defaultValue : isRange ? EMPTY_RANGE : null),
  );
  const selectedRange = isRange ? ((currentValue as DateRangeInput | null) ?? EMPTY_RANGE) : null;
  const selectedDate = selectedRange ? null : (currentValue as DateInput | null);
  const shownAdDate = supportedAdDate(selectedDate);
  const shownRange = selectedRange && supportedAdRange(selectedRange);

  const commit = (next: PatroDate | null) => {
    setValue(next?.date ?? null);
    (onChange as SingleSelection['onChange'])?.(next);
  };

  const commitRange = (next: PatroDateRange) => {
    setValue({ start: next.start?.date ?? null, end: next.end?.date ?? null });
    (onChange as RangeSelection['onChange'])?.(next);
  };

  const hasValue = shownRange ? !!shownRange.start : !!shownAdDate;

  return { selectedRange, selectedDate, shownAdDate, shownRange, hasValue, commit, commitRange };
};

export { useDatepickerValue };
