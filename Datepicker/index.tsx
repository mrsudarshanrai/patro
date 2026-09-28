import { useEffect, useState, KeyboardEvent } from 'react';
import { Calendar } from '../Calendar';
import { createPopper } from '@popperjs/core';
import { ICalendar } from '../Calendar/types';
import { DatepickerProps, PatroDate } from '../types/public';
import {
  createDateString,
  formatDisplayDate,
  formatSecondaryDate,
  isSupportedAdDate,
} from '../utils';
import { icons } from './icons';

const DEFAULT_PLACEHOLDER: Record<ICalendar.calendarType, string> = {
  AD: 'Select a date',
  BS: 'मिति छान्नुहोस्',
};

const Datepicker = (props: DatepickerProps) => {
  const {
    value,
    defaultValue,
    onChange,
    calendar = ICalendar.CalendarTypeEnum.AD,
    label,
    placeholder,
    theme,
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

  const shownDate =
    selectedDate &&
    isSupportedAdDate(
      createDateString(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
        selectedDate.getDate(),
      ),
    )
      ? selectedDate
      : null;

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
        {shownDate ? (
          <>
            <span className='_patro_datepicker_input_primary'>
              {formatDisplayDate(shownDate, calendar)}
            </span>
            <span className='_patro_datepicker_input_secondary'>
              {formatSecondaryDate(shownDate, calendar)}
            </span>
          </>
        ) : (
          <span className='_patro_datepicker_input_placeholder'>
            {placeholder ?? DEFAULT_PLACEHOLDER[calendar]}
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
