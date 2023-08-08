import { icons } from '../../Datepicker/icons';
import { ICalendar } from '../types';

const CalendarHeader = (props: ICalendar.CalendarHeaderProps) => {
  const { month, year, oMonth, oYear, nextMonth, prevMonth } = props;
  return (
    <header className='_patro_header'>
      <button className='_patro_header_actionBtn' onClick={() => prevMonth()}>
        {icons['prevIcon']}
      </button>
      <h3 className='_patro_header_info'>
        <p className='_patro_header_info_month_year'>
          {month} {year}
        </p>
        <p className='_patro_header_info_month_year'>
          {oMonth} {oYear}
        </p>
      </h3>
      <button className='_patro_header_actionBtn' onClick={() => nextMonth()}>
        {icons['nextIcon']}
      </button>
    </header>
  );
};

export default CalendarHeader;
