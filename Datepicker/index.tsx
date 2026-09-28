import { useEffect, useState, KeyboardEvent } from 'react';
import { Calendar } from '../Calendar';
import { createPopper } from '@popperjs/core';
import { Datepicker as DatepickerType } from './types';
import { IUseCalendarData } from '../types/IHooks/IUseCalendarData';
import { ICalendar } from '../Calendar/types';
import { adDateToLocalDate, formatDisplayDate, formatSecondaryDate } from '../utils';
import { icons } from './icons';

const Datepicker = (props: DatepickerType.Props) => {
  const {
    calendarType = ICalendar.CalendarTypeEnum.AD,
    onChange,
    defaultDate,
    label,
    theme,
    ...rest
  } = props;
  const [isPopperVisible, setIsPopperVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(defaultDate ?? new Date());
  const [inputRef, setInputRef] = useState<HTMLDivElement | null>(null);
  const [popperRef, setPopperRef] = useState<HTMLDivElement | null>(null);

  const defaultTime = defaultDate?.getTime();
  useEffect(() => {
    if (defaultTime !== undefined) setSelectedDate(new Date(defaultTime));
  }, [defaultTime]);

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

  const onSelect = (date: IUseCalendarData.IDates) => {
    setSelectedDate(adDateToLocalDate(date.adDate));
    closePopper();
    inputRef?.focus();
    onChange?.(date);
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
    <div className='_patro_datepicker _patro' data-calendar-type={calendarType} data-theme={theme}>
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
        <span className='_patro_datepicker_input_primary'>
          {formatDisplayDate(selectedDate, calendarType)}
        </span>
        <span className='_patro_datepicker_input_secondary'>
          {formatSecondaryDate(selectedDate, calendarType)}
        </span>
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
            showExtra
            {...rest}
            calendarType={calendarType}
            defaultDate={selectedDate}
            theme={theme}
            onChange={onSelect}
          />
        </div>
      )}
    </div>
  );
};

export { Datepicker };
