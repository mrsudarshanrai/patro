import { forwardRef, KeyboardEvent, useCallback, useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { createPopper } from '@popperjs/core';
import { Calendar } from '../Calendar';
import { ICalendar } from '../Calendar/types';
import { DatepickerProps, PatroDate } from '../types/public';
import {
  ad2Bs,
  formatDate,
  isSupportedAdDate,
  languageOf,
  otherSystem,
  toAdDateString,
  toPatroDate,
} from '../utils';
import { icons } from './icons';

const DEFAULT_PLACEHOLDER = { en: 'Select a date', ne: 'मिति छान्नुहोस्' };

const Datepicker = forwardRef<HTMLDivElement, DatepickerProps>(function Datepicker(props, ref) {
  const {
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
    ...calendarProps
  } = props;
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const labelId = `${inputId}-label`;

  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<Date | null>(
    defaultValue === undefined ? new Date() : defaultValue,
  );
  const selectedDate = isControlled ? value : uncontrolledValue;

  const isOpenControlled = open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = !disabled && !readOnly && (isOpenControlled ? open : uncontrolledOpen);

  const [inputRef, setInputRef] = useState<HTMLDivElement | null>(null);
  const [popperRef, setPopperRef] = useState<HTMLDivElement | null>(null);

  const shownAdDate =
    selectedDate && isSupportedAdDate(toAdDateString(selectedDate))
      ? toAdDateString(selectedDate)
      : null;
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
    onChange?.(next);
  };

  const onSelect = (selected: PatroDate | null) => {
    commit(selected);
    if (closeOnSelect) {
      setOpen(false);
      inputRef?.focus();
    }
  };

  const onClear = () => {
    commit(null);
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

  const showClear = clearable && !!shownAdDate && !disabled && !readOnly;
  const submittedValue = shownAdDate
    ? valueFormat === 'bs'
      ? ad2Bs(shownAdDate)
      : shownAdDate
    : '';

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
        calendar={calendar}
        locale={locale}
        numerals={numerals}
        value={selectedDate}
        theme={theme}
        onChange={onSelect}
      />
    </div>
  );

  return (
    <div className='_patro_datepicker _patro' data-calendar-type={calendar} data-theme={theme}>
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
          {shownAdDate && formatValue ? (
            <span className='_patro_datepicker_input_primary _patro_datepicker_input_custom'>
              {formatValue(toPatroDate(shownAdDate))}
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
              {placeholder ?? DEFAULT_PLACEHOLDER[languageOf(calendar, display)]}
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
        {(name || required) && (
          // Real input so native forms submit and validate the date; focus goes back to the picker.
          <input
            className='_patro_datepicker_native'
            name={name}
            value={submittedValue}
            required={required}
            disabled={disabled}
            tabIndex={-1}
            aria-hidden
            onChange={() => undefined}
            onFocus={() => inputRef?.focus()}
          />
        )}
      </div>
      {popover && (portal ? createPortal(popover, document.body) : popover)}
    </div>
  );
});

export { Datepicker };
