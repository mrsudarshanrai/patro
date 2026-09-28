import { icons } from '../../Datepicker/icons';
import { ICalendar } from '../types';

const CalendarHeader = (props: ICalendar.CalendarHeaderProps) => {
  const { month, year, oMonth, oYear, nextMonth, prevMonth, canNextMonth, canPrevMonth } = props;
  return (
    <header className='_patro_header'>
      <button
        className='_patro_header_actionBtn'
        aria-label='Previous month'
        disabled={!canPrevMonth}
        onClick={() => prevMonth()}
      >
        {icons['prevIcon']}
      </button>
      <h3 className='_patro_header_info'>
        <p className='_patro_header_title'>
          {month} {year}
        </p>
        <p className='_patro_header_subtitle'>
          {oMonth} {oYear}
        </p>
      </h3>
      <button
        className='_patro_header_actionBtn'
        aria-label='Next month'
        disabled={!canNextMonth}
        onClick={() => nextMonth()}
      >
        {icons['nextIcon']}
      </button>
    </header>
  );
};

export default CalendarHeader;
