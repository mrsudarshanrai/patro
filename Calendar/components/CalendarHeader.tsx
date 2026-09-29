import { icons } from '../../Datepicker/icons';
import { ICalendar } from '../types';

const CalendarHeader = (props: ICalendar.CalendarHeaderProps) => {
  const {
    title,
    subtitle,
    onTitleClick,
    titleActionLabel,
    prevLabel,
    nextLabel,
    nextMonth,
    prevMonth,
    canNextMonth,
    canPrevMonth,
  } = props;
  return (
    <header className='_patro_header'>
      <button
        type='button'
        className='_patro_header_actionBtn'
        aria-label={prevLabel}
        disabled={!canPrevMonth}
        onClick={() => prevMonth()}
      >
        {icons['prevIcon']}
      </button>
      {/* Not a heading: a component can't know the host page's heading levels. */}
      <div className='_patro_header_info'>
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
      </div>
      <button
        type='button'
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
