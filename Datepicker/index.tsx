import {
  forwardRef,
  KeyboardEvent,
  ReactElement,
  RefAttributes,
  useCallback,
  useEffect,
  useId,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { createPopper } from '@popperjs/core';
import { Calendar } from '../Calendar';
import { ICalendar } from '../Calendar/types';
import {
  CalendarProps,
  DatepickerProps,
  DatepickerRangeProps,
  DatepickerSingleProps,
  DateRange,
  PatroDate,
  PatroDateRange,
  RangeSelection,
  SingleSelection,
} from '../types/public';
import {
  ad2Bs,
  formatDate,
  isSupportedAdDate,
  languageOf,
  otherSystem,
  datePartsIn,
  toAdDateString,
  toPatroDate,
} from '../utils';
import { icons } from './icons';

const DEFAULT_PLACEHOLDER = {
  single: { en: 'Select a date', ne: 'मिति छान्नुहोस्' },
  range: { en: 'Select dates', ne: 'मितिहरू छान्नुहोस्' },
};
const EMPTY_RANGE: DateRange = { start: null, end: null };

const supportedAd = (date: Date | null | undefined) =>
  date && isSupportedAdDate(toAdDateString(date)) ? toAdDateString(date) : null;

const DatepickerComponent = forwardRef<HTMLDivElement, DatepickerProps>(
  function Datepicker(props, ref) {
    const {
      mode,
      value,
      defaultValue,
      onChange,
      calendar = ICalendar.CalendarTypeEnum.AD,
      label,
      placeholder,
      theme,
      locale,
      numerals,
      formatValue,
      disabled = false,
      readOnly = false,
      invalid = false,
      closeOnSelect = true,
      open,
      defaultOpen = false,
      onOpenChange,
      clearable = false,
      name,
      valueFormat = 'ad',
      required = false,
      id,
      autoFocus = false,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      onFocus,
      onBlur,
      placement = 'bottom-start',
      portal = false,
      className,
      style,
      ...calendarProps
    } = props;
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const labelId = `${inputId}-label`;

    const isRange = mode === 'range';
    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState<Date | DateRange | null>(() =>
      defaultValue !== undefined ? defaultValue : isRange ? EMPTY_RANGE : new Date(),
    );
    const currentValue = isControlled ? value : uncontrolledValue;
    const selectedRange = isRange ? ((currentValue as DateRange | null) ?? EMPTY_RANGE) : null;
    const selectedDate = selectedRange ? null : (currentValue as Date | null);

    const isOpenControlled = open !== undefined;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const isOpen = !disabled && !readOnly && (isOpenControlled ? open : uncontrolledOpen);

    const [inputRef, setInputRef] = useState<HTMLDivElement | null>(null);
    const [popperRef, setPopperRef] = useState<HTMLDivElement | null>(null);

    const shownAdDate = supportedAd(selectedDate);
    const shownRange = selectedRange && {
      start: supportedAd(selectedRange.start),
      end: supportedAd(selectedRange.end),
    };
    const display = { locale, numerals };

    const setInputNode = useCallback(
      (node: HTMLDivElement | null) => {
        setInputRef(node);
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const setOpen = useCallback(
      (next: boolean) => {
        if (next === isOpen || (next && (disabled || readOnly))) return;
        if (!isOpenControlled) setUncontrolledOpen(next);
        onOpenChange?.(next);
      },
      [isOpen, disabled, readOnly, isOpenControlled, onOpenChange],
    );

    useEffect(() => {
      if (autoFocus) inputRef?.focus();
    }, [autoFocus, inputRef]);

    useEffect(() => {
      if (!isOpen) return;
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (popperRef?.contains(target) || inputRef?.contains(target)) return;
        setOpen(false);
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, inputRef, popperRef, setOpen]);

    useEffect(() => {
      if (!inputRef || !popperRef || !isOpen) return;
      const popper = createPopper(inputRef, popperRef, {
        placement,
        modifiers: [{ name: 'offset', options: { offset: [0, 6] } }],
      });
      return () => popper.destroy();
    }, [isOpen, inputRef, popperRef, placement]);

    const commit = (next: PatroDate | null) => {
      if (!isControlled) setUncontrolledValue(next?.date ?? null);
      (onChange as SingleSelection['onChange'])?.(next);
    };

    const commitRange = (next: PatroDateRange) => {
      if (!isControlled) {
        setUncontrolledValue({ start: next.start?.date ?? null, end: next.end?.date ?? null });
      }
      (onChange as RangeSelection['onChange'])?.(next);
    };

    const close = () => {
      if (!closeOnSelect) return;
      setOpen(false);
      inputRef?.focus();
    };

    const onSelect = (selected: PatroDate | null) => {
      commit(selected);
      close();
    };

    const onSelectRange = (selected: PatroDateRange) => {
      commitRange(selected);
      if (selected.end) close();
    };

    const onClear = () => {
      if (isRange) commitRange({ start: null, end: null });
      else commit(null);
      inputRef?.focus();
    };

    const onInputKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setOpen(!isOpen);
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setOpen(true);
      }
    };

    const onPopperKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      inputRef?.focus();
    };

    const hasValue = shownRange ? !!shownRange.start : !!shownAdDate;
    const showClear = clearable && hasValue && !disabled && !readOnly;
    const submitted = (adDate: string | null) =>
      adDate ? (valueFormat === 'bs' ? ad2Bs(adDate) : adDate) : '';
    const formFields = shownRange
      ? [
          { name: name && `${name}[start]`, value: submitted(shownRange.start) },
          { name: name && `${name}[end]`, value: submitted(shownRange.end) },
        ]
      : [{ name, value: submitted(shownAdDate) }];

    const rangeText = (range: { start: string | null; end: string | null }) => {
      if (!range.start) return null;
      if (!range.end) return `${formatDate(range.start, calendar, display)} – …`;
      const [startYear] = datePartsIn(range.start, calendar);
      const [endYear] = datePartsIn(range.end, calendar);
      const start = formatDate(range.start, calendar, display, {
        short: true,
        withYear: startYear !== endYear,
      });
      return `${start} – ${formatDate(range.end, calendar, display, { short: true })}`;
    };

    const calendarSelection = (
      shownRange
        ? { mode: 'range', value: selectedRange, onChange: onSelectRange }
        : { value: selectedDate, onChange: onSelect }
    ) as Pick<CalendarProps, 'mode' | 'value' | 'onChange'>;

    const popover = isOpen && (
      <div
        ref={setPopperRef}
        role='dialog'
        aria-label='Choose a date'
        className='_patro_datepicker_popper'
        onKeyDown={onPopperKeyDown}
      >
        <Calendar
          {...calendarProps}
          {...(calendarSelection as CalendarProps)}
          calendar={calendar}
          locale={locale}
          numerals={numerals}
          theme={theme}
        />
      </div>
    );

    return (
      <div
        className={['_patro_datepicker _patro', className].filter(Boolean).join(' ')}
        style={style}
        data-calendar-type={calendar}
        data-theme={theme}
      >
        {label && (
          <div id={labelId} className='_patro_datepicker_label'>
            {label}
          </div>
        )}
        <div className='_patro_datepicker_control'>
          <div
            ref={setInputNode}
            id={inputId}
            className={[
              '_patro_datepicker_input',
              invalid && '_patro_datepicker_input_invalid',
              showClear && '_patro_datepicker_input_clearable',
            ]
              .filter(Boolean)
              .join(' ')}
            role='button'
            tabIndex={disabled ? -1 : 0}
            aria-haspopup='dialog'
            aria-expanded={isOpen}
            aria-disabled={disabled || undefined}
            aria-readonly={readOnly || undefined}
            aria-invalid={invalid || undefined}
            aria-required={required || undefined}
            aria-label={ariaLabel}
            aria-labelledby={!ariaLabel && label ? `${labelId} ${inputId}` : undefined}
            aria-describedby={ariaDescribedBy}
            onClick={() => setOpen(!isOpen)}
            onKeyDown={onInputKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
          >
            {shownRange && shownRange.start ? (
              <span className='_patro_datepicker_input_primary _patro_datepicker_input_custom'>
                {formatValue
                  ? (formatValue as (value: PatroDateRange) => string)({
                      start: toPatroDate(shownRange.start),
                      end: shownRange.end ? toPatroDate(shownRange.end) : null,
                    })
                  : rangeText(shownRange)}
              </span>
            ) : shownAdDate && formatValue ? (
              <span className='_patro_datepicker_input_primary _patro_datepicker_input_custom'>
                {(formatValue as (value: PatroDate) => string)(toPatroDate(shownAdDate))}
              </span>
            ) : shownAdDate ? (
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
            ) : (
              <span className='_patro_datepicker_input_placeholder'>
                {placeholder ??
                  DEFAULT_PLACEHOLDER[isRange ? 'range' : 'single'][languageOf(calendar, display)]}
              </span>
            )}
            <span className='_patro_datepicker_input_icon'>{icons.calendarIcon}</span>
          </div>
          {showClear && (
            <button
              type='button'
              className='_patro_datepicker_clear'
              aria-label='Clear date'
              onClick={onClear}
            >
              {icons.clearIcon}
            </button>
          )}
          {(name || required) &&
            formFields.map((field, index) => (
              // Real input so native forms submit and validate the date; focus goes back to the picker.
              <input
                key={index}
                className='_patro_datepicker_native'
                name={field.name}
                value={field.value}
                required={required}
                disabled={disabled}
                tabIndex={-1}
                aria-hidden
                onChange={() => undefined}
                onFocus={() => inputRef?.focus()}
              />
            ))}
        </div>
        {popover && (portal ? createPortal(popover, document.body) : popover)}
      </div>
    );
  },
);

// Overloads so `onChange` etc. are typed from `mode` even without strictNullChecks.
type DatepickerOverloads = {
  (props: DatepickerRangeProps & RefAttributes<HTMLDivElement>): ReactElement;
  (props: DatepickerSingleProps & RefAttributes<HTMLDivElement>): ReactElement;
  (props: DatepickerProps & RefAttributes<HTMLDivElement>): ReactElement;
};

const Datepicker = DatepickerComponent as unknown as DatepickerOverloads;

export { Datepicker };
