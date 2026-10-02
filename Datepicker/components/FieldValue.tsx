import { formatDate, otherSystem, toPatroDate } from '../../utils';
import type { PatroDate, PatroDateRange } from '../../types/public';
import type { FieldValueProps } from '../DatepickerType';
import { defaultPlaceholder, rangeText } from '../utils';

const FieldValue = ({
  calendar,
  display,
  isRange,
  shownAdDate,
  shownRange,
  formatValue,
  placeholder,
}: FieldValueProps) => {
  if (shownRange && shownRange.start) {
    return (
      <span className='_patro_datepicker_input_primary _patro_datepicker_input_custom'>
        {formatValue
          ? (formatValue as (value: PatroDateRange) => string)({
              start: toPatroDate(shownRange.start),
              end: shownRange.end ? toPatroDate(shownRange.end) : null,
            })
          : rangeText(shownRange, calendar, display)}
      </span>
    );
  }
  if (shownAdDate && formatValue) {
    return (
      <span className='_patro_datepicker_input_primary _patro_datepicker_input_custom'>
        {(formatValue as (value: PatroDate) => string)(toPatroDate(shownAdDate))}
      </span>
    );
  }
  if (shownAdDate) {
    return (
      <>
        <span className='_patro_datepicker_input_primary'>
          {formatDate(shownAdDate, calendar, display)}
        </span>
        <span className='_patro_datepicker_input_secondary'>
          {calendar === 'AD'
            ? formatDate(shownAdDate, 'BS', display, { withYear: false })
            : formatDate(shownAdDate, otherSystem(calendar), display, { short: true })}
        </span>
      </>
    );
  }
  return (
    <span className='_patro_datepicker_input_placeholder'>
      {placeholder ?? defaultPlaceholder(isRange, calendar, display)}
    </span>
  );
};

export { FieldValue };
