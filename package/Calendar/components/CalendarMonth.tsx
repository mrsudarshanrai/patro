import { useCallback, useState } from 'react';
import type { CalendarMonthProps } from '../CalendarType';
import { CalendarGrid } from './CalendarGrid';
import CalendarHeader from './CalendarHeader';
import CalendarDays from './CalendarDays';
import { CalendarPicker } from './CalendarPicker';

const CalendarMonth = ({
  header,
  title,
  subtitle,
  isFirst,
  isLast,
  view,
  pickerItems,
  onPick,
  grid,
  weekdays,
  days,
  onMouseLeave,
}: CalendarMonthProps) => {
  const [pageFocus, setPageFocus] = useState<number>();
  const clearPageFocus = useCallback(() => setPageFocus(undefined), []);
  const changePage = (step: -1 | 1, focusIndex: number) => {
    setPageFocus(focusIndex);
    if (step < 0) header.prev();
    else header.next();
  };

  return (
    <div className='_patro_month'>
      <CalendarHeader
        nextMonth={header.next}
        prevMonth={header.prev}
        canNextMonth={header.canNext}
        canPrevMonth={header.canPrev}
        // Arrows on the outer months only; the first month's title opens the pickers.
        showPrev={isFirst}
        showNext={view === 'days' ? isLast : isFirst}
        title={title}
        subtitle={subtitle}
        onTitleClick={isFirst ? header.onTitleClick : undefined}
        titleActionLabel={isFirst ? header.titleActionLabel : undefined}
        prevLabel={header.prevLabel}
        nextLabel={header.nextLabel}
      />
      {isFirst && view !== 'days' ? (
        <CalendarPicker
          key={header.title}
          items={pickerItems}
          label={header.title}
          onPick={onPick}
          canPage={(step) => (step < 0 ? header.canPrev : header.canNext)}
          onPage={changePage}
          focusOnMount={pageFocus}
          onMountFocused={clearPageFocus}
        />
      ) : (
        <div
          {...grid}
          className='_patro_grid'
          role='grid'
          aria-label={title}
          onMouseLeave={onMouseLeave}
        >
          <CalendarDays {...weekdays} />
          <CalendarGrid {...days} />
        </div>
      )}
    </div>
  );
};

export { CalendarMonth };
