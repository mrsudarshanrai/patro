import { icons } from '../../Datepicker/icons';
import { ICalendar } from '../types';

const CalendarHeader = (props: ICalendar.CalendarHeaderProps) => {
  const {
    title,
    subtitle,
    onTitleClick,
    titleActionLabel,
    prevLabel = 'Previous month',
    nextLabel = 'Next month',
    nextMonth,
    prevMonth,
    canNextMonth,
    canPrevMonth,
  } = props;
  return (
    <header className='_patro_header'>
      <button
        className='_patro_header_actionBtn'
        aria-label={prevLabel}
        disabled={!canPrevMonth}
        onClick={() => prevMonth()}
      >
        {icons['prevIcon']}
      </button>
      <h3 className='_patro_header_info'>
        {onTitleClick ? (
          <button
            type='button'
            className='_patro_header_title _patro_header_titleBtn'
            aria-label={titleActionLabel ? `${title}, ${titleActionLabel}` : title}
            onClick={onTitleClick}
          >
            {title}
          </button>
        ) : (
          <p className='_patro_header_title'>{title}</p>
        )}
        <p className='_patro_header_subtitle'>{subtitle}</p>
      </h3>
      <button
        className='_patro_header_actionBtn'
        aria-label={nextLabel}
        disabled={!canNextMonth}
        onClick={() => nextMonth()}
      >
        {icons['nextIcon']}
      </button>
    </header>
  );
};

export default CalendarHeader;
