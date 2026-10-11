import { icons } from '../../shared/icons';
import type { CalendarHeaderProps } from '../CalendarType';

const CalendarHeader = (props: CalendarHeaderProps) => {
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
    showPrev = true,
    showNext = true,
  } = props;
  return (
    <div className='_patro_header'>
      {showPrev ? (
        <button
          type='button'
          className='_patro_header_actionBtn'
          aria-label={prevLabel}
          disabled={!canPrevMonth}
          onClick={() => prevMonth()}
        >
          {icons['prevIcon']}
        </button>
      ) : (
        <span className='_patro_header_spacer' />
      )}
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
          <div className='_patro_header_title'>{title}</div>
        )}
        <div className='_patro_header_subtitle'>{subtitle}</div>
      </div>
      {showNext ? (
        <button
          type='button'
          className='_patro_header_actionBtn'
          aria-label={nextLabel}
          disabled={!canNextMonth}
          onClick={() => nextMonth()}
        >
          {icons['nextIcon']}
        </button>
      ) : (
        <span className='_patro_header_spacer' />
      )}
    </div>
  );
};

export default CalendarHeader;
