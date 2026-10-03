import { useEffect, useState } from 'react';
import {
  datePartsIn,
  formatNumber,
  monthName,
  monthRange,
  monthSpan,
  monthTitle,
  overlaps,
  yearSpan,
} from '../../utils';
import type { PickerView } from '../components/CalendarPicker';
import type { UsePickerViewOptions } from '../CalendarType';
import { YEARS_PER_PAGE } from '../utils';

const usePickerView = ({
  calendar,
  display,
  text,
  firstAdDate,
  lastAdDate,
  minAdDate,
  maxAdDate,
  prevMonth,
  nextMonth,
  canPrevMonth,
  canNextMonth,
  goToMonth,
}: UsePickerViewOptions) => {
  const [view, setView] = useState<PickerView>('days');
  const [pickerYear, setPickerYear] = useState(0);

  useEffect(() => setView('days'), [calendar]);

  const [viewYear, viewMonth] = datePartsIn(firstAdDate, calendar);
  const num = (value: number) => formatNumber(value, calendar, display);
  const yearAvailable = (year: number) => overlaps(yearSpan(calendar, year), minAdDate, maxAdDate);
  const pageStart = pickerYear - (pickerYear % YEARS_PER_PAGE);
  const pageYears = Array.from({ length: YEARS_PER_PAGE }, (_, i) => pageStart + i);
  const pageAvailable = (start: number) =>
    Array.from({ length: YEARS_PER_PAGE }, (_, i) => start + i).some(yearAvailable);
  const pickerYearSpan = yearSpan(calendar, pickerYear);
  const pageFirst = yearSpan(calendar, pageStart);
  const pageLast = yearSpan(calendar, pageStart + YEARS_PER_PAGE - 1);
  const pageSpan = pageFirst && pageLast ? [pageFirst[0], pageLast[1]] : null;

  const header =
    view === 'days'
      ? {
          title: monthTitle(firstAdDate, calendar, display),
          subtitle: monthRange(firstAdDate, lastAdDate, calendar, display),
          onTitleClick: () => {
            setPickerYear(viewYear);
            setView('months');
          },
          titleActionLabel: text.chooseMonth,
          prev: prevMonth,
          next: nextMonth,
          canPrev: canPrevMonth,
          canNext: canNextMonth,
          prevLabel: text.previousMonth,
          nextLabel: text.nextMonth,
        }
      : view === 'months'
        ? {
            title: num(pickerYear),
            subtitle: pickerYearSpan
              ? monthRange(pickerYearSpan[0], pickerYearSpan[1], calendar, display)
              : '',
            onTitleClick: () => setView('years'),
            titleActionLabel: text.chooseYear,
            prev: () => setPickerYear(pickerYear - 1),
            next: () => setPickerYear(pickerYear + 1),
            canPrev: yearAvailable(pickerYear - 1),
            canNext: yearAvailable(pickerYear + 1),
            prevLabel: text.previousYear,
            nextLabel: text.nextYear,
          }
        : {
            title: `${num(pageStart)} – ${num(pageStart + YEARS_PER_PAGE - 1)}`,
            subtitle: pageSpan ? monthRange(pageSpan[0], pageSpan[1], calendar, display) : '',
            onTitleClick: undefined,
            titleActionLabel: undefined,
            prev: () => setPickerYear(pageStart - YEARS_PER_PAGE),
            next: () => setPickerYear(pageStart + YEARS_PER_PAGE),
            canPrev: pageAvailable(pageStart - YEARS_PER_PAGE),
            canNext: pageAvailable(pageStart + YEARS_PER_PAGE),
            prevLabel: text.previousYears,
            nextLabel: text.nextYears,
          };

  const pickerItems =
    view === 'months'
      ? Array.from({ length: 12 }, (_, i) => ({
          value: i + 1,
          label: monthName(calendar, i + 1, display),
          disabled: !overlaps(monthSpan(calendar, pickerYear, i + 1), minAdDate, maxAdDate),
          current: pickerYear === viewYear && i + 1 === viewMonth,
        }))
      : pageYears.map((year) => ({
          value: year,
          label: num(year),
          disabled: !yearAvailable(year),
          current: year === viewYear,
        }));

  const onPick = (value: number) => {
    if (view === 'months') {
      goToMonth(pickerYear, value);
      setView('days');
    } else {
      setPickerYear(value);
      setView('months');
    }
  };

  return { view, setView, header, pickerItems, onPick };
};

export { usePickerView };
