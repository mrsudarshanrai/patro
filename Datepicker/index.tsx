import { useEffect, useState, KeyboardEvent } from 'react';
import { Calendar } from '../Calendar';
import { createPopper } from '@popperjs/core';
import { ICalendar } from '../Calendar/types';
import { DatepickerProps, PatroDate } from '../types/public';
import {
  formatDate,
  isSupportedAdDate,
  languageOf,
  otherSystem,
  toAdDateString,
  toPatroDate,
} from '../utils';
import { icons } from './icons';

const DEFAULT_PLACEHOLDER = { en: 'Select a date', ne: 'मिति छान्नुहोस्' };

const Datepicker = (props: DatepickerProps) => {
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
    ...calendarProps
  } = props;
  const [isPopperVisible, setIsPopperVisible] = useState(false);
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<Date | null>(
    defaultValue === undefined ? new Date() : defaultValue,
  );
  const selectedDate = isControlled ? value : uncontrolledValue;
  const [inputRef, setInputRef] = useState<HTMLDivElement | null>(null);
  const [popperRef, setPopperRef] = useState<HTMLDivElement | null>(null);

  const shownAdDate =
    selectedDate && isSupportedAdDate(toAdDateString(selectedDate))
      ? toAdDateString(selectedDate)
      : null;
  const display = { locale, numerals };

  const togglePopper = () => setIsPopperVisible((visible) => !visible);
  const closePopper = () => setIsPopperVisible(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef &&
        popperRef &&
        !popperRef.contains(event.target as Node) &&
        !inputRef.contains(event.target as Node)
      ) {
        setIsPopperVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popperRef, inputRef]);

  useEffect(() => {
    if (inputRef && popperRef && isPopperVisible) {
      const popper = createPopper(inputRef, popperRef);
      return () => popper.destroy();
    }
  }, [isPopperVisible, inputRef, popperRef]);

  const onSelect = (selected: PatroDate | null) => {
    if (!isControlled) setUncontrolledValue(selected?.date ?? null);
    closePopper();
    inputRef?.focus();
    onChange?.(selected);
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') closePopper();
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      togglePopper();
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsPopperVisible(true);
    }
  };

  const onPopperKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape') return;
    closePopper();
    inputRef?.focus();
  };

  return (
    <div className='_patro_datepicker _patro' data-calendar-type={calendar} data-theme={theme}>
      {label && <div className='_patro_datepicker_label'>{label}</div>}
      <div
        ref={setInputRef}
        className='_patro_datepicker_input'
        role='button'
        tabIndex={0}
        aria-haspopup='dialog'
        aria-expanded={isPopperVisible}
        onClick={togglePopper}
        onKeyDown={onInputKeyDown}
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
      {isPopperVisible && (
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
      )}
    </div>
  );
};

export { Datepicker };
