import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { addDays, datePartsIn, weekday } from '../../utils';
import { cellId } from '../components/CalendarGrid';
import type { UseGridFocusOptions } from '../CalendarType';
import { activeDay, DAY_STEPS, shiftMonths } from '../utils';

const useGridFocus = ({
  calendar,
  months,
  selectedAdDate,
  todayAdDate,
  isDayDisabled,
  minAdDate,
  maxAdDate,
  goToMonth,
  weekStartsOn,
  autoFocus,
  idPrefix,
  onSelect,
}: UseGridFocusOptions) => {
  const [focusedAdDate, setFocusedAdDate] = useState<string>();
  const [showFocusRing, setShowFocusRing] = useState(false);
  const pointerDown = useRef(false);
  const gridRefs = useRef<(HTMLDivElement | null)[]>([]);
  const visibleStart = months[0].first;
  const visibleEnd = months[months.length - 1].last;

  const { adDate: activeAdDate, index: activeMonth } = activeDay(
    months,
    [focusedAdDate, selectedAdDate, todayAdDate],
    isDayDisabled,
  );

  // preventScroll: a popover may not be positioned yet on its first frame.
  useEffect(() => {
    if (autoFocus) gridRefs.current[activeMonth]?.focus({ preventScroll: true });
    // Only on mount / when autoFocus turns on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus]);

  // Keyboard focus moving into another visible month moves DOM focus to that month's grid.
  useEffect(() => {
    const grids = gridRefs.current;
    const focusedGrid = grids.find((grid) => grid && grid === document.activeElement);
    if (focusedGrid && focusedGrid !== grids[activeMonth]) {
      grids[activeMonth]?.focus({ preventScroll: true });
    }
  }, [activeMonth]);

  // Scroll only when the day is outside the visible months: onto the first, or the last.
  const moveFocus = (adDate: string | null) => {
    setShowFocusRing(true);
    if (!adDate || adDate < minAdDate || adDate > maxAdDate) return;
    const [year, month] = datePartsIn(adDate, calendar);
    if (adDate < visibleStart) goToMonth(year, month);
    else if (adDate > visibleEnd) {
      const index = year * 12 + month - 1 - (months.length - 1);
      goToMonth(Math.floor(index / 12), (index % 12) + 1);
    }
    setFocusedAdDate(adDate);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = DAY_STEPS[event.key];
    if (step !== undefined) {
      event.preventDefault();
      let next = addDays(activeAdDate, step);
      while (next >= minAdDate && next <= maxAdDate && isDayDisabled(next)) {
        next = addDays(next, step);
      }
      moveFocus(next);
    } else if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault();
      const shift = (event.key === 'PageUp' ? -1 : 1) * (event.shiftKey ? 12 : 1);
      const next = shiftMonths(activeAdDate, shift, calendar);
      moveFocus(next && (next < minAdDate ? minAdDate : next > maxAdDate ? maxAdDate : next));
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const column = (weekday(activeAdDate) - weekStartsOn + 7) % 7;
      const back = event.key === 'Home' ? -1 : 1;
      let next = addDays(activeAdDate, back < 0 ? -column : 6 - column);
      // Nearest enabled day of the week, towards the focused one.
      while (next !== activeAdDate && isDayDisabled(next)) next = addDays(next, -back);
      moveFocus(next);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!isDayDisabled(activeAdDate)) onSelect(activeAdDate);
    }
  };

  // One Tab stop across all months: the grid holding the active day.
  const gridProps = (index: number) => ({
    ref: (node: HTMLDivElement | null) => {
      gridRefs.current[index] = node;
    },
    tabIndex: index === activeMonth ? 0 : -1,
    'aria-activedescendant': index === activeMonth ? cellId(idPrefix, activeAdDate) : undefined,
    onKeyDown,
    onMouseDown: () => {
      pointerDown.current = true;
    },
    // Ring only for keyboard focus, like :focus-visible.
    onFocus: () => setShowFocusRing(!pointerDown.current),
    onBlur: () => {
      pointerDown.current = false;
      setShowFocusRing(false);
    },
  });

  return { activeAdDate, setFocusedAdDate, showFocusRing, gridProps };
};

export { useGridFocus };
