import { useEffect, useState, KeyboardEvent } from 'react';
import { Calendar } from '../Calendar';
import { createPopper } from '@popperjs/core';
import { Datepicker as DatepickerType } from './types';
import { IUseCalendarData } from '../types/IHooks/IUseCalendarData';
import { ICalendar } from '../Calendar/types';
import { formatDisplayDate } from '../utils';

const Datepicker = (props: DatepickerType.Props) => {
  const { calendarType = ICalendar.CalendarTypeEnum.AD, onChange, defaultDate, ...rest } = props;
  const [isPopperVisible, setIsPopperVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(defaultDate ?? new Date());
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const [popperRef, setPopperRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (defaultDate) setSelectedDate(defaultDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultDate?.getTime()]);

  const togglePopper = () => setIsPopperVisible((visible) => !visible);
  const closePopper = () => setIsPopperVisible(false);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      inputRef &&
      popperRef &&
      !popperRef.contains(event.target as Node) &&
      !inputRef.contains(event.target as Node)
    ) {
      closePopper();
    }
  };

  useEffect(() => {
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
    setSelectedDate(new Date(date.adDate));
    closePopper();
    onChange && onChange(date);
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') closePopper();
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      togglePopper();
    }
  };

  return (
    <div className='_patro_datepicker'>
      <input
        ref={setInputRef}
        className='_patro_datepicker_input'
        role='combobox'
        aria-haspopup='dialog'
        aria-expanded={isPopperVisible}
        readOnly
        value={formatDisplayDate(selectedDate, calendarType)}
        onClick={togglePopper}
        onKeyDown={onInputKeyDown}
      />
      {isPopperVisible && (
        <div ref={setPopperRef} role='dialog' className='_patro_datepicker_popper'>
          <Calendar
            showExtra
            {...rest}
            calendarType={calendarType}
            defaultDate={selectedDate}
            onChange={onSelect}
          />
        </div>
      )}
    </div>
  );
};

export { Datepicker };
