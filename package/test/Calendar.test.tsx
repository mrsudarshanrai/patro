/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar } from '../Calendar';
import { Datepicker } from '../Datepicker';
import type { CalendarBaseProps } from '../Calendar/CalendarType';
import type { PatroDate, SingleSelection } from '../types/public';
import { bs2Ad } from '../utils';

const TODAY = new Date(2026, 9, 29);

beforeEach(() => {
  jest.useFakeTimers({ now: TODAY, advanceTimers: true });
});

afterEach(() => {
  jest.useRealTimers();
});

const title = (container: HTMLElement) =>
  container.querySelector('._patro_header_title')?.textContent;
const cell = (container: HTMLElement, adDate: string) =>
  container.querySelector(`[title="${adDate}"]`) as HTMLElement;

test('AD calendar shows the defaultValue month with selected, today and offset cells', () => {
  const { container } = render(<Calendar defaultValue={new Date(2026, 9, 12)} />);

  expect(container.firstElementChild).toHaveAttribute('data-calendar-type', 'AD');
  expect(title(container)).toBe('October 2026');
  expect(cell(container, '2026-10-12')).toHaveClass('_patro_dates_current_date');
  expect(cell(container, '2026-10-12')).not.toHaveClass('_patro_dates_today');
  expect(cell(container, '2026-10-29')).toHaveClass('_patro_dates_today');
  expect(cell(container, '2026-10-29')).not.toHaveClass('_patro_dates_current_date');
  expect(cell(container, '2026-09-30')).toHaveClass('_patro_dates_prev_month_date_offset');
  expect(cell(container, '2026-11-01')).toHaveClass('_patro_dates_next_month_date_offset');
});

test('AD header subtitle names the two BS months the AD month spans', () => {
  const subtitle = (date: Date) =>
    render(<Calendar defaultValue={date} />).container.querySelector('._patro_header_subtitle')
      ?.textContent;

  expect(subtitle(new Date(2026, 8, 15))).toBe('भाद्र – आश्विन २०८३');
  expect(subtitle(new Date(2027, 2, 15))).toBe('फाल्गुन – चैत्र २०८३');
  expect(subtitle(new Date(2026, 3, 15))).toBe('चैत्र २०८२ – बैशाख २०८३');
});

test('BS calendar shows the BS month containing defaultValue', () => {
  const { container } = render(<Calendar calendar='BS' defaultValue={TODAY} showSecondaryDate />);

  expect(container.firstElementChild).toHaveAttribute('data-calendar-type', 'BS');
  expect(title(container)).toBe('कार्तिक २०८३');
  expect(container.querySelector('._patro_header_subtitle')?.textContent).toBe('Oct – Nov 2026');
  expect(cell(container, '2026-10-18').textContent).toBe('१18');
  expect(cell(container, '2026-10-29')).toHaveClass('_patro_dates_current_date');
});

test('the secondary date shows by default and can be hidden', () => {
  const { container, rerender } = render(<Calendar defaultValue={TODAY} />);
  expect(cell(container, '2026-10-29').querySelector('sub')?.textContent).toBe('१२');

  rerender(<Calendar defaultValue={TODAY} showSecondaryDate={false} />);
  expect(cell(container, '2026-10-29').querySelector('sub')).toBeNull();
});

test('onChange receives the date in both calendars', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  const { container } = render(<Calendar defaultValue={TODAY} onChange={onChange} />);

  await user.click(cell(container, '2026-10-05'));
  expect(onChange).toHaveBeenCalledWith({
    date: new Date(2026, 9, 5),
    ad: '2026-10-05',
    bs: '2083-06-19',
  });
});

test('controlled: selection follows value, not clicks', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  const { container, rerender } = render(<Calendar value={TODAY} onChange={onChange} />);

  await user.click(cell(container, '2026-10-05'));
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ ad: '2026-10-05' }));
  expect(cell(container, '2026-10-29')).toHaveClass('_patro_dates_current_date');
  expect(cell(container, '2026-10-05')).not.toHaveClass('_patro_dates_current_date');

  rerender(<Calendar value={new Date(2026, 9, 5)} onChange={onChange} />);
  expect(cell(container, '2026-10-05')).toHaveClass('_patro_dates_current_date');

  rerender(<Calendar value={null} onChange={onChange} />);
  expect(container.querySelector('._patro_dates_current_date')).toBeNull();
});

test('uncontrolled: defaultValue is only the starting value', async () => {
  const { container, rerender } = render(<Calendar defaultValue={TODAY} />);
  rerender(<Calendar defaultValue={new Date(2026, 9, 5)} />);
  expect(cell(container, '2026-10-29')).toHaveClass('_patro_dates_current_date');
});

test('header buttons never submit a surrounding form', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn((event: { preventDefault: () => void }) => event.preventDefault());
  render(
    <form onSubmit={onSubmit}>
      <Calendar defaultValue={TODAY} />
    </form>,
  );
  await user.click(screen.getByLabelText('Next month'));
  await user.click(screen.getByLabelText('November 2026, choose month'));
  await user.click(screen.getByLabelText('Next year'));
  expect(onSubmit).not.toHaveBeenCalled();
});

describe('labels', () => {
  test('follow the display language', () => {
    const { rerender } = render(<Calendar calendar='BS' defaultValue={TODAY} />);
    expect(screen.getByLabelText('अर्को महिना')).toBeInTheDocument();
    rerender(<Calendar calendar='BS' locale='en' defaultValue={TODAY} />);
    expect(screen.getByLabelText('Next month')).toBeInTheDocument();
  });

  test('can be overridden one at a time', () => {
    render(
      <Calendar defaultValue={TODAY} showTodayButton labels={{ nextMonth: 'Mois suivant' }} />,
    );
    expect(screen.getByLabelText('Mois suivant')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
  });
});

test('month navigation steps by one month in the displayed calendar', async () => {
  const user = userEvent.setup();
  const { container } = render(<Calendar calendar='BS' defaultValue={TODAY} />);

  await user.click(screen.getByLabelText('अर्को महिना'));
  expect(title(container)).toBe('मंसिर २०८३');
  await user.click(screen.getByLabelText('अघिल्लो महिना'));
  await user.click(screen.getByLabelText('अघिल्लो महिना'));
  expect(title(container)).toBe('आश्विन २०८३');
});

test('switching AD to BS keeps the selected date in view', () => {
  const { container, rerender } = render(<Calendar defaultValue={TODAY} />);
  expect(title(container)).toBe('October 2026');

  rerender(<Calendar calendar='BS' defaultValue={TODAY} />);
  expect(title(container)).toBe('कार्तिक २०८३');
});

test('clicking a day selects it and calls onChange with its AD date', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  const { container } = render(<Calendar defaultValue={TODAY} onChange={onChange} />);

  await user.click(cell(container, '2026-10-05'));
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ ad: '2026-10-05' }));
  expect(cell(container, '2026-10-05')).toHaveClass('_patro_dates_current_date');
  expect(cell(container, '2026-10-29')).not.toHaveClass('_patro_dates_current_date');
});

describe('keyboard navigation', () => {
  const focused = (container: HTMLElement) =>
    container.querySelector('._patro_dates_focused')?.getAttribute('title');

  const setup = (props: Partial<CalendarBaseProps & SingleSelection> = {}) => {
    const user = userEvent.setup();
    const utils = render(<Calendar defaultValue={TODAY} {...props} />);
    const grid = screen.getByRole('grid');
    return { user, grid, ...utils };
  };

  test('tabbing into the grid focuses the selected day and wires it for screen readers', async () => {
    const { user, container, grid } = setup();
    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();

    expect(grid).toHaveFocus();
    expect(focused(container)).toBe('2026-10-29');
    const active = document.getElementById(grid.getAttribute('aria-activedescendant') ?? '');
    expect(active).toHaveAttribute('title', '2026-10-29');
    expect(active).toHaveAttribute('aria-label', '29 October 2026, १२ कार्तिक २०८३');
    expect(active).toHaveAttribute('aria-selected', 'true');
    expect(grid).toHaveAccessibleName('October 2026');
  });

  test('arrow keys move by day and week, crossing into the next month', async () => {
    const { user, container, grid } = setup();
    grid.focus();

    await user.keyboard('{ArrowRight}');
    expect(focused(container)).toBe('2026-10-30');
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(focused(container)).toBe('2026-10-28');
    await user.keyboard('{ArrowDown}');
    expect(focused(container)).toBe('2026-11-04');
    expect(title(container)).toBe('November 2026');
    await user.keyboard('{ArrowUp}');
    expect(focused(container)).toBe('2026-10-28');
    expect(title(container)).toBe('October 2026');
  });

  test('arrow keys cross BS month boundaries in BS mode', async () => {
    const { user, container, grid } = setup({
      calendar: 'BS',
      defaultValue: new Date(2026, 10, 12),
    });
    grid.focus();

    await user.keyboard('{ArrowDown}');
    expect(focused(container)).toBe('2026-11-19');
    expect(title(container)).toBe('मंसिर २०८३');
  });

  test('PageDown and PageUp move the focused day by a month', async () => {
    const { user, container, grid } = setup();
    grid.focus();

    await user.keyboard('{PageDown}');
    expect(title(container)).toBe('November 2026');
    expect(focused(container)).toBe('2026-11-29');
    await user.keyboard('{PageUp}');
    expect(focused(container)).toBe('2026-10-29');
  });

  test('a month move clamps to the shorter month', async () => {
    const { user, container, grid } = setup({ defaultValue: new Date(2027, 0, 31) });
    grid.focus();

    await user.keyboard('{PageDown}');
    expect(focused(container)).toBe('2027-02-28');
  });

  test('Shift+PageUp / Shift+PageDown move by a year', async () => {
    const { user, container, grid } = setup();
    grid.focus();

    await user.keyboard('{Shift>}{PageUp}{/Shift}');
    expect(title(container)).toBe('October 2025');
    expect(focused(container)).toBe('2025-10-29');
    await user.keyboard('{Shift>}{PageDown}{PageDown}{/Shift}');
    expect(focused(container)).toBe('2027-10-29');
  });

  test('month moves follow BS months in BS mode', async () => {
    // 2026-10-29 = BS 2083-07-12; a BS month later is 2083-08-12.
    const { user, container, grid } = setup({ calendar: 'BS' });
    grid.focus();

    await user.keyboard('{PageDown}');
    expect(title(container)).toBe('मंसिर २०८३');
    expect(focused(container)).toBe(bs2Ad('2083-08-12'));
  });

  test('Home and End go to the start and end of the week', async () => {
    // 2026-10-29 is a Thursday.
    const { user, container, grid } = setup();
    grid.focus();

    await user.keyboard('{Home}');
    expect(focused(container)).toBe('2026-10-25');
    await user.keyboard('{End}');
    expect(focused(container)).toBe('2026-10-31');
  });

  test('Home and End respect weekStartsOn and skip disabled days', async () => {
    const { user, container, grid } = setup({
      weekStartsOn: 1,
      isDateDisabled: ({ date }: PatroDate) => date.getDay() === 0,
    });
    grid.focus();

    await user.keyboard('{Home}');
    expect(focused(container)).toBe('2026-10-26');
    await user.keyboard('{End}');
    expect(focused(container)).toBe('2026-10-31');
  });

  test('Enter selects the focused day', async () => {
    const onChange = jest.fn();
    const { user, container, grid } = setup({ onChange });
    grid.focus();

    await user.keyboard('{ArrowRight}{Enter}');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ ad: '2026-10-30' }));
    expect(cell(container, '2026-10-30')).toHaveClass('_patro_dates_current_date');
  });

  test('clicking a day does not show the keyboard focus ring', async () => {
    const { user, container } = setup();
    await user.click(cell(container, '2026-10-05'));
    expect(container.querySelector('._patro_dates_focused')).toBeNull();

    await user.keyboard('{ArrowRight}');
    expect(focused(container)).toBe('2026-10-06');
  });
});

test('defaultValue={null} shows the current month with nothing selected', () => {
  const { container } = render(<Calendar defaultValue={null} />);
  expect(title(container)).toBe('October 2026');
  expect(container.querySelector('._patro_dates_current_date')).toBeNull();
  expect(screen.getByRole('grid').querySelector('[aria-selected="true"]')).toBeNull();
});

describe('supported range edges', () => {
  test('last month (BS 2099 Chaitra) renders, cannot go further, days past the table are blank', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Calendar calendar='BS' defaultValue={new Date(2043, 3, 1)} showSecondaryDate />,
    );
    expect(title(container)).toBe('चैत्र २०९९');

    const next = screen.getByLabelText('अर्को महिना');
    expect(next).toBeDisabled();
    await user.click(next);
    screen.getByRole('grid').focus();
    await user.keyboard('{PageDown}{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(title(container)).toBe('चैत्र २०९९');

    const beyond = cell(container, '2043-04-15');
    expect(beyond).toHaveClass('_patro_dates_disabled');
    expect(beyond).toHaveAttribute('aria-disabled', 'true');
    expect(beyond.textContent).toBe('');
  });

  test('first AD month (April 1921) renders with pre-table days disabled', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = render(
      <Calendar defaultValue={new Date(1921, 3, 13)} onChange={onChange} showSecondaryDate />,
    );
    expect(title(container)).toBe('April 1921');
    expect(container.querySelector('._patro_header_subtitle')?.textContent).toBe(
      'चैत्र १९७७ – बैशाख १९७८',
    );
    expect(screen.getByLabelText('Previous month')).toBeDisabled();

    const before = cell(container, '1921-04-12');
    expect(before).toHaveClass('_patro_dates_disabled');
    expect(before.textContent).toBe('12');
    expect(cell(container, '1921-04-13').textContent).toBe('13१');

    await user.click(before);
    expect(onChange).not.toHaveBeenCalled();

    screen.getByRole('grid').focus();
    await user.keyboard('{ArrowLeft}{PageUp}');
    expect(container.querySelector('._patro_dates_focused')).toHaveAttribute('title', '1921-04-13');
    expect(title(container)).toBe('April 1921');
  });

  test('first BS month (1978 Baisakh) cannot go back', () => {
    const { container } = render(<Calendar calendar='BS' defaultValue={new Date(1921, 3, 20)} />);
    expect(title(container)).toBe('बैशाख १९७८');
    expect(screen.getByLabelText('अघिल्लो महिना')).toBeDisabled();
    expect(screen.getByLabelText('अर्को महिना')).toBeEnabled();
  });

  test('an out-of-range defaultValue shows the nearest month with nothing selected', () => {
    const { container } = render(<Calendar defaultValue={new Date(2050, 0, 1)} />);
    expect(title(container)).toBe('April 2043');
    expect(container.querySelector('._patro_dates_current_date')).toBeNull();
  });
});

describe('minDate / maxDate / isDateDisabled', () => {
  const minDate = new Date(2026, 9, 10);
  const maxDate = new Date(2026, 10, 20);

  test('days outside the bounds are disabled but still show their numbers', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = render(
      <Calendar defaultValue={TODAY} minDate={minDate} maxDate={maxDate} onChange={onChange} />,
    );
    const early = cell(container, '2026-10-09');
    expect(early).toHaveClass('_patro_dates_disabled');
    expect(early).toHaveAttribute('aria-disabled', 'true');
    expect(early.textContent).toBe('9२३');
    expect(cell(container, '2026-10-10')).not.toHaveClass('_patro_dates_disabled');

    await user.click(early);
    expect(onChange).not.toHaveBeenCalled();
  });

  test('navigation stops at the months containing the bounds', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Calendar defaultValue={TODAY} minDate={minDate} maxDate={maxDate} />,
    );
    expect(screen.getByLabelText('Previous month')).toBeDisabled();
    await user.click(screen.getByLabelText('Next month'));
    expect(title(container)).toBe('November 2026');
    expect(screen.getByLabelText('Next month')).toBeDisabled();
    expect(cell(container, '2026-11-21')).toHaveClass('_patro_dates_disabled');
  });

  test('the view opens inside the bounds when the value is outside them', () => {
    const { container } = render(<Calendar defaultValue={null} minDate={new Date(2027, 0, 10)} />);
    expect(title(container)).toBe('January 2027');
  });

  test('minDate after maxDate disables every day instead of crashing', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = render(
      <Calendar
        minDate={new Date(2026, 9, 20)}
        maxDate={new Date(2026, 9, 10)}
        onChange={onChange}
      />,
    );
    expect(
      container.querySelectorAll('._patro_dates_date:not(._patro_dates_disabled)'),
    ).toHaveLength(0);
    expect(screen.getByLabelText('Previous month')).toBeDisabled();
    expect(screen.getByLabelText('Next month')).toBeDisabled();
    await user.click(screen.getByRole('grid'));
    await user.keyboard('{ArrowRight}{PageUp}{Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });

  test('bounds apply in BS mode too', () => {
    const { container } = render(
      <Calendar calendar='BS' defaultValue={TODAY} maxDate={new Date(2026, 10, 1)} />,
    );
    expect(title(container)).toBe('कार्तिक २०८३');
    expect(screen.getByLabelText('अर्को महिना')).toBeDisabled();
    expect(cell(container, '2026-11-02')).toHaveClass('_patro_dates_disabled');
  });

  test('isDateDisabled disables matching days and the keyboard skips them', async () => {
    const user = userEvent.setup();
    const saturdays = ({ date }: { date: Date }) => date.getDay() === 6;
    const { container } = render(
      <Calendar defaultValue={new Date(2026, 9, 30)} isDateDisabled={saturdays} />,
    );
    expect(cell(container, '2026-10-31')).toHaveClass('_patro_dates_disabled');
    expect(cell(container, '2026-10-30')).not.toHaveClass('_patro_dates_disabled');

    screen.getByRole('grid').focus();
    await user.keyboard('{ArrowRight}');
    expect(container.querySelector('._patro_dates_focused')).toHaveAttribute('title', '2026-11-01');
    expect(title(container)).toBe('November 2026');
  });

  test('the keyboard cannot move past the bounds', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Calendar defaultValue={new Date(2026, 9, 11)} minDate={minDate} />,
    );
    screen.getByRole('grid').focus();
    await user.keyboard('{ArrowLeft}{ArrowLeft}{ArrowUp}');
    expect(container.querySelector('._patro_dates_focused')).toHaveAttribute('title', '2026-10-10');
  });
});

describe('locale and numerals', () => {
  const subtitle = (container: HTMLElement) =>
    container.querySelector('._patro_header_subtitle')?.textContent;

  test('BS calendar fully in English with Latin digits', () => {
    const { container } = render(
      <Calendar calendar='BS' defaultValue={TODAY} locale='en' numerals='latin' />,
    );
    expect(title(container)).toBe('Kartik 2083');
    expect(subtitle(container)).toBe('Oct – Nov 2026');
    expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent('Su');
    expect(cell(container, '2026-10-29').textContent).toBe('1229');
    expect(cell(container, '2026-10-29')).toHaveAttribute(
      'aria-label',
      '29 October 2026, 12 Kartik 2083',
    );
  });

  test('AD calendar fully in Nepali with Devanagari digits', () => {
    const { container } = render(
      <Calendar defaultValue={TODAY} locale='ne' numerals='devanagari' />,
    );
    expect(title(container)).toBe('अक्टोबर २०२६');
    expect(subtitle(container)).toBe('आश्विन – कार्तिक २०८३');
    expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent('आइत');
    expect(cell(container, '2026-10-29').textContent).toBe('२९१२');
  });

  test('locale alone keeps each calendar in its own digits', () => {
    const { container } = render(<Calendar calendar='BS' defaultValue={TODAY} locale='en' />);
    expect(title(container)).toBe('Kartik २०८३');
  });
});

describe('grid layout', () => {
  const rows = (container: HTMLElement) => container.querySelectorAll('._patro_dates').length;

  test('always renders 6 weeks by default, or only the weeks needed with fixedWeeks={false}', () => {
    const february = new Date(2026, 1, 10);
    const { container, rerender } = render(<Calendar defaultValue={february} />);
    expect(rows(container)).toBe(6);

    rerender(<Calendar defaultValue={february} fixedWeeks={false} />);
    expect(rows(container)).toBe(4);
  });

  test('weekStartsOn moves the first column', () => {
    const { container } = render(<Calendar defaultValue={TODAY} weekStartsOn={1} />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]).toHaveTextContent('Mo');
    expect(headers[6]).toHaveTextContent('Su');
    expect(container.querySelector('[role="gridcell"]')).toHaveAttribute('title', '2026-09-28');
  });

  test('weekStartsOn works in BS mode', () => {
    render(<Calendar calendar='BS' defaultValue={TODAY} weekStartsOn={1} />);
    expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent('सोम');
  });
});

test('weekendDays marks those weekdays in the grid and the header', () => {
  const { container } = render(<Calendar defaultValue={TODAY} weekendDays={[6]} />);
  expect(cell(container, '2026-10-31')).toHaveClass('_patro_dates_weekend');
  expect(cell(container, '2026-10-30')).not.toHaveClass('_patro_dates_weekend');
  const headers = screen.getAllByRole('columnheader');
  expect(headers[6]).toHaveClass('_patro_days_day_weekend');
  expect(headers[0]).not.toHaveClass('_patro_days_day_weekend');
});

test('weekend header marking follows weekStartsOn', () => {
  render(<Calendar defaultValue={TODAY} weekendDays={[6]} weekStartsOn={1} />);
  expect(screen.getAllByRole('columnheader')[5]).toHaveClass('_patro_days_day_weekend');
});

test('dayClassName adds your own classes, e.g. for holidays', () => {
  const holidays = new Set(['2083-07-04']);
  const { container } = render(
    <Calendar
      calendar='BS'
      defaultValue={TODAY}
      dayClassName={({ bs }) => (holidays.has(bs) ? 'holiday' : undefined)}
    />,
  );
  expect(cell(container, '2026-10-21')).toHaveClass('holiday');
  expect(cell(container, '2026-10-22')).not.toHaveClass('holiday');
});

test('dayContent adds content to a day and dayLabel extends its accessible name', () => {
  const holidays: Record<string, string> = { '2083-06-26': 'Dashain' };
  const { container } = render(
    <Calendar
      defaultValue={TODAY}
      dayContent={({ bs }) => holidays[bs] && <i className='dot' />}
      dayLabel={({ bs }) => holidays[bs]}
    />,
  );
  // 2026-10-12 = BS 2083-06-26.
  const holiday = cell(container, '2026-10-12');
  expect(holiday.querySelector('._patro_dates_content .dot')).not.toBeNull();
  expect(holiday).toHaveAccessibleName('12 October 2026, २६ आश्विन २०८३, Dashain');
  expect(cell(container, '2026-10-13').querySelector('._patro_dates_content')).toBeNull();
  expect(cell(container, '2026-10-13')).toHaveAccessibleName('13 October 2026, २७ आश्विन २०८३');
});

test('onMonthChange reports the new month, not the initial one', async () => {
  const user = userEvent.setup();
  const onMonthChange = jest.fn();
  render(<Calendar defaultValue={TODAY} onMonthChange={onMonthChange} />);
  expect(onMonthChange).not.toHaveBeenCalled();

  await user.click(screen.getByLabelText('Next month'));
  expect(onMonthChange).toHaveBeenCalledTimes(1);
  expect(onMonthChange).toHaveBeenCalledWith({
    start: expect.objectContaining({ ad: '2026-11-01' }),
    end: expect.objectContaining({ ad: '2026-11-30' }),
  });
});

describe('numberOfMonths', () => {
  const titles = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('._patro_header_title'), (el) => el.textContent);

  test('shows consecutive months, hiding other months’ days so none repeats', async () => {
    const user = userEvent.setup();
    const { container } = render(<Calendar defaultValue={TODAY} numberOfMonths={2} />);
    expect(titles(container)).toEqual(['October 2026', 'November 2026']);
    expect(container.querySelectorAll('[title="2026-11-01"]')).toHaveLength(1);
    expect(screen.getAllByLabelText('Previous month')).toHaveLength(1);
    expect(screen.getAllByLabelText('Next month')).toHaveLength(1);

    await user.click(screen.getByLabelText('Next month'));
    expect(titles(container)).toEqual(['November 2026', 'December 2026']);
  });

  test('one Tab stop; arrow keys cross into the next month without scrolling', async () => {
    const user = userEvent.setup();
    const { container } = render(<Calendar defaultValue={TODAY} numberOfMonths={2} />);
    const grids = screen.getAllByRole('grid');
    expect(grids.map((grid) => grid.tabIndex)).toEqual([0, -1]);

    // Previous month, the title, then the first grid (the first month has no Next arrow).
    await user.tab();
    await user.tab();
    await user.tab();
    expect(grids[0]).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(grids[1]).toHaveFocus();
    expect(grids[1]).toHaveAttribute('aria-activedescendant', expect.stringMatching(/2026-11-05$/));
    expect(titles(container)).toEqual(['October 2026', 'November 2026']);

    await user.keyboard('{PageDown}');
    expect(titles(container)).toEqual(['November 2026', 'December 2026']);
    expect(grids[1]).toHaveFocus();
    expect(container.querySelector('._patro_dates_focused')).toHaveAttribute('title', '2026-12-05');

    await user.keyboard('{Shift>}{PageUp}{/Shift}');
    expect(titles(container)).toEqual(['December 2025', 'January 2026']);
    expect(grids[0]).toHaveFocus();
  });

  test('a range can start in one month and end in the next', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = render(<Calendar mode='range' numberOfMonths={2} onChange={onChange} />);
    await user.click(cell(container, '2026-10-28'));
    await user.click(cell(container, '2026-11-03'));
    expect(onChange).toHaveBeenLastCalledWith({
      start: expect.objectContaining({ ad: '2026-10-28' }),
      end: expect.objectContaining({ ad: '2026-11-03' }),
    });
    expect(cell(container, '2026-11-01')).toHaveClass('_patro_dates_in_range');
  });

  test('BS months follow BS month boundaries', () => {
    const { container } = render(
      <Calendar calendar='BS' defaultValue={TODAY} numberOfMonths={2} />,
    );
    expect(titles(container)).toEqual(['कार्तिक २०८३', 'मंसिर २०८३']);
  });
});

describe('presets', () => {
  const addDays = (date: Date, days: number) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

  test('single presets select a day, move to its month and mark the active one', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = render(
      <Calendar
        defaultValue={null}
        onChange={onChange}
        presets={[
          { label: 'Today', value: () => new Date() },
          { label: 'In a month', value: () => addDays(new Date(), 30) },
        ]}
      />,
    );
    expect(screen.getByRole('group', { name: 'Quick picks' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'In a month' }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ ad: '2026-11-28' }));
    expect(title(container)).toBe('November 2026');
    expect(screen.getByRole('button', { name: 'In a month' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Today' })).toHaveAttribute('aria-pressed', 'false');
  });

  test('range presets set both ends; presets breaking the rules are disabled', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <Calendar
        mode='range'
        maxDays={7}
        maxDate={new Date(2026, 11, 31)}
        onChange={onChange}
        presets={[
          {
            label: 'Next 7 days',
            value: () => ({ start: new Date(), end: addDays(new Date(), 6) }),
          },
          {
            label: 'Next 30 days',
            value: () => ({ start: new Date(), end: addDays(new Date(), 29) }),
          },
          { label: 'Next year', value: { start: new Date(2027, 0, 1), end: new Date(2027, 0, 2) } },
        ]}
      />,
    );
    expect(screen.getByRole('button', { name: 'Next 30 days' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next year' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Next 7 days' }));
    expect(onChange).toHaveBeenLastCalledWith({
      start: expect.objectContaining({ ad: '2026-10-29' }),
      end: expect.objectContaining({ ad: '2026-11-04' }),
    });
  });

  test('picking a range preset closes the Datepicker', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Datepicker
        mode='range'
        defaultOpen
        presets={[
          {
            label: 'This week',
            value: { start: new Date(2026, 9, 25), end: new Date(2026, 9, 31) },
          },
        ]}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'This week' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(container.querySelector('._patro_datepicker_input')).toHaveTextContent(
      '25 Oct – 31 Oct 2026',
    );
  });
});

describe('defaultMonth and month', () => {
  test('defaultMonth is shown when nothing is selected', async () => {
    const user = userEvent.setup();
    const { container, rerender } = render(<Calendar defaultMonth={new Date(2000, 5, 10)} />);
    expect(title(container)).toBe('June 2000');
    expect(container.querySelector('._patro_dates_current_date')).toBeNull();

    await user.click(screen.getByLabelText('Next month'));
    expect(title(container)).toBe('July 2000');

    rerender(<Calendar defaultMonth={new Date(2000, 5, 10)} value={new Date(2026, 0, 5)} />);
    expect(title(container)).toBe('January 2026');
  });

  test('a value wins over defaultMonth', () => {
    const { container } = render(
      <Calendar defaultMonth={new Date(2000, 5, 10)} defaultValue={new Date(2026, 0, 5)} />,
    );
    expect(title(container)).toBe('January 2026');
  });

  test('defaultMonth follows BS months in BS mode', () => {
    // 2000-06-10 is BS 2057-02-28 (Jestha).
    const { container } = render(<Calendar calendar='BS' defaultMonth={new Date(2000, 5, 10)} />);
    expect(title(container)).toBe('जेष्ठ २०५७');
  });

  test('a controlled month only moves when the owner updates it', async () => {
    const user = userEvent.setup();
    const onMonthChange = jest.fn();
    const { container, rerender } = render(
      <Calendar month={new Date(2026, 2, 1)} onMonthChange={onMonthChange} />,
    );
    expect(title(container)).toBe('March 2026');

    await user.click(screen.getByLabelText('Next month'));
    expect(title(container)).toBe('March 2026');
    expect(onMonthChange).toHaveBeenCalledWith({
      start: expect.objectContaining({ ad: '2026-04-01' }),
      end: expect.objectContaining({ ad: '2026-04-30' }),
    });

    rerender(<Calendar month={new Date(2026, 3, 1)} onMonthChange={onMonthChange} />);
    expect(title(container)).toBe('April 2026');
    // Updating the prop isn't reported back.
    expect(onMonthChange).toHaveBeenCalledTimes(1);
  });

  test('a controlled month works with state, the keyboard and the month picker', async () => {
    const user = userEvent.setup();
    const Controlled = () => {
      const [month, setMonth] = useState(new Date(2026, 9, 1));
      return (
        <Calendar
          defaultValue={TODAY}
          month={month}
          onMonthChange={({ start }) => setMonth(start.date)}
        />
      );
    };
    const { container } = render(<Controlled />);
    screen.getByRole('grid').focus();
    await user.keyboard('{PageDown}');
    expect(title(container)).toBe('November 2026');
    expect(container.querySelector('._patro_dates_focused')).toHaveAttribute('title', '2026-11-29');

    await user.click(screen.getByRole('button', { name: /choose month/ }));
    await user.click(screen.getByRole('button', { name: 'March' }));
    expect(title(container)).toBe('March 2026');
  });
});

test('className and style go on the root, e.g. to override theme tokens', () => {
  const { container } = render(
    <Calendar
      defaultValue={TODAY}
      className='my-calendar'
      style={{ '--patro-accent': 'teal' } as React.CSSProperties}
    />,
  );
  const root = container.firstElementChild as HTMLElement;
  expect(root).toHaveClass('_patro_container', 'my-calendar');
  expect(root.style.getPropertyValue('--patro-accent')).toBe('teal');
});

describe('month and year quick navigation', () => {
  const titleButton = () =>
    screen.getByRole('button', { name: /choose (month|year)|(महिना|वर्ष) छान्नुहोस्/ });

  test('title opens a month grid, and picking a month shows its days', async () => {
    const user = userEvent.setup();
    const { container } = render(<Calendar defaultValue={TODAY} />);
    await user.click(titleButton());
    expect(title(container)).toBe('2026');
    expect(screen.getByRole('button', { name: 'October' })).toHaveAttribute('aria-current', 'true');

    await user.click(screen.getByRole('button', { name: 'March' }));
    expect(title(container)).toBe('March 2026');
  });

  test('a birthdate decades back is a few clicks away', async () => {
    const user = userEvent.setup();
    const { container } = render(<Calendar defaultValue={TODAY} />);
    await user.click(titleButton());
    await user.click(titleButton());
    expect(title(container)).toBe('2016 – 2027');

    for (let i = 0; i < 3; i++) await user.click(screen.getByLabelText('Previous 12 years'));
    expect(title(container)).toBe('1980 – 1991');
    await user.click(screen.getByRole('button', { name: '1990' }));
    await user.click(screen.getByRole('button', { name: 'June' }));
    expect(title(container)).toBe('June 1990');
  });

  test('works in BS with BS months and years', async () => {
    const user = userEvent.setup();
    const { container } = render(<Calendar calendar='BS' defaultValue={TODAY} />);
    await user.click(titleButton());
    expect(title(container)).toBe('२०८३');
    await user.click(screen.getByRole('button', { name: 'बैशाख' }));
    expect(title(container)).toBe('बैशाख २०८३');
  });

  test('months and years outside the bounds are disabled', async () => {
    const user = userEvent.setup();
    render(<Calendar defaultValue={TODAY} minDate={new Date(2026, 9, 10)} />);
    await user.click(titleButton());
    expect(screen.getByRole('button', { name: 'September' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'October' })).toBeEnabled();
    expect(screen.getByLabelText('Previous year')).toBeDisabled();
  });

  test('the month grid is one Tab stop, and arrow keys move within it', async () => {
    const user = userEvent.setup();
    const { container } = render(<Calendar defaultValue={TODAY} minDate={new Date(2026, 1, 1)} />);
    await user.click(titleButton());
    const october = screen.getByRole('button', { name: 'October' });
    expect(
      [...container.querySelectorAll('._patro_picker_item')].filter(
        (item) => item.getAttribute('tabindex') === '0',
      ),
    ).toEqual([october]);

    // Title button, then Next year, then the grid.
    await user.tab();
    await user.tab();
    expect(october).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'November' })).toHaveFocus();
    await user.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}');
    // November, August, May, February; January is disabled, so Left stays put.
    expect(screen.getByRole('button', { name: 'February' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: 'February' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('button', { name: 'December' })).toHaveFocus();
    await user.keyboard('{Home}{Enter}');
    expect(title(container)).toBe('February 2026');
  });

  test('Escape goes back to the days', async () => {
    const user = userEvent.setup();
    const { container } = render(<Calendar defaultValue={TODAY} />);
    await user.click(titleButton());
    await user.keyboard('{Escape}');
    expect(title(container)).toBe('October 2026');
  });

  test('Today button jumps to and selects today', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = render(
      <Calendar defaultValue={new Date(2026, 0, 5)} showTodayButton onChange={onChange} />,
    );
    await user.click(screen.getByRole('button', { name: 'Today' }));
    expect(title(container)).toBe('October 2026');
    expect(cell(container, '2026-10-29')).toHaveClass('_patro_dates_current_date');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ ad: '2026-10-29' }));
  });

  test('Today button is disabled when today is not allowed', () => {
    render(<Calendar showTodayButton maxDate={new Date(2026, 0, 1)} locale='ne' />);
    expect(screen.getByRole('button', { name: 'आज' })).toBeDisabled();
  });
});

test('the year page subtitle shows the span in the other calendar', async () => {
  const user = userEvent.setup();
  const { container } = render(<Calendar calendar='BS' defaultValue={TODAY} />);
  const titleButton = () => screen.getByRole('button', { name: /छान्नुहोस्/ });
  await user.click(titleButton());
  await user.click(titleButton());
  expect(container.querySelector('._patro_header_subtitle')?.textContent).toBe(
    'Apr 2019 – Apr 2031',
  );
});

describe('range mode', () => {
  test('a range given end-first is drawn start-first', () => {
    const { container } = render(
      <Calendar
        mode='range'
        value={{ start: new Date(2026, 9, 20), end: new Date(2026, 9, 10) }}
      />,
    );
    expect(cell(container, '2026-10-10')).toHaveClass('_patro_dates_range_start');
    expect(cell(container, '2026-10-15')).toHaveClass('_patro_dates_in_range');
    expect(cell(container, '2026-10-20')).toHaveClass('_patro_dates_range_end');
  });

  const classesOf = (container: HTMLElement, adDate: string) => cell(container, adDate).className;

  describe('range rules', () => {
    const ends = (onChange: jest.Mock) => {
      const { start, end } = onChange.mock.lastCall[0];
      return [start?.ad ?? null, end?.ad ?? null];
    };

    test('minDays: a closer end starts a new range there', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      const { container } = render(<Calendar mode='range' minDays={3} onChange={onChange} />);
      await user.click(cell(container, '2026-10-05'));
      await user.click(cell(container, '2026-10-06'));
      expect(ends(onChange)).toEqual(['2026-10-06', null]);
      await user.click(cell(container, '2026-10-08'));
      expect(ends(onChange)).toEqual(['2026-10-06', '2026-10-08']);
    });

    test('maxDays: a farther end starts a new range, and gets no preview', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      const { container } = render(<Calendar mode='range' maxDays={7} onChange={onChange} />);
      await user.click(cell(container, '2026-10-05'));
      await user.hover(cell(container, '2026-10-12'));
      expect(cell(container, '2026-10-08')).not.toHaveClass('_patro_dates_in_range');
      await user.hover(cell(container, '2026-10-11'));
      expect(cell(container, '2026-10-08')).toHaveClass('_patro_dates_in_range');

      await user.click(cell(container, '2026-10-12'));
      expect(ends(onChange)).toEqual(['2026-10-12', null]);
      await user.click(cell(container, '2026-10-18'));
      expect(ends(onChange)).toEqual(['2026-10-12', '2026-10-18']);
    });

    test('excludeDisabled: a range cannot span a disabled day', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      const booked = ({ ad }: PatroDate) => ad === '2026-10-10';
      const { container, rerender } = render(
        <Calendar mode='range' isDateDisabled={booked} excludeDisabled onChange={onChange} />,
      );
      await user.click(cell(container, '2026-10-05'));
      await user.click(cell(container, '2026-10-12'));
      expect(ends(onChange)).toEqual(['2026-10-12', null]);

      // Without it, disabled days can sit inside a range.
      rerender(<Calendar mode='range' isDateDisabled={booked} onChange={onChange} />);
      await user.click(cell(container, '2026-10-20'));
      await user.click(cell(container, '2026-10-05'));
      await user.click(cell(container, '2026-10-12'));
      expect(ends(onChange)).toEqual(['2026-10-05', '2026-10-12']);
    });
  });

  test('first click sets the start, second the end', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = render(<Calendar mode='range' onChange={onChange} />);
    expect(container.querySelector('._patro_dates_current_date')).toBeNull();

    await user.click(cell(container, '2026-10-05'));
    expect(onChange).toHaveBeenLastCalledWith({
      start: expect.objectContaining({ ad: '2026-10-05' }),
      end: null,
    });
    await user.click(cell(container, '2026-10-09'));
    expect(onChange).toHaveBeenLastCalledWith({
      start: expect.objectContaining({ ad: '2026-10-05' }),
      end: expect.objectContaining({ ad: '2026-10-09', bs: '2083-06-23' }),
    });

    expect(classesOf(container, '2026-10-05')).toMatch(/_current_date.*_range_start/);
    expect(classesOf(container, '2026-10-07')).toContain('_patro_dates_in_range');
    expect(classesOf(container, '2026-10-09')).toMatch(/_current_date.*_range_end/);
    expect(classesOf(container, '2026-10-10')).not.toContain('_patro_dates_in_range');
    const selected = container.querySelectorAll('[aria-selected="true"]');
    expect(Array.from(selected, (el) => el.getAttribute('title'))).toEqual([
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
      '2026-10-08',
      '2026-10-09',
    ]);
  });

  test('hovering previews the range until the end is picked', async () => {
    const user = userEvent.setup();
    const { container } = render(<Calendar mode='range' />);
    await user.click(cell(container, '2026-10-05'));
    await user.hover(cell(container, '2026-10-08'));
    expect(classesOf(container, '2026-10-06')).toMatch(/_in_range.*_range_preview/);
    expect(classesOf(container, '2026-10-08')).toMatch(/_range_end.*_range_preview/);
    expect(cell(container, '2026-10-06')).toHaveAttribute('aria-selected', 'false');

    await user.hover(cell(container, '2026-10-02'));
    expect(container.querySelector('._patro_dates_in_range')).toBeNull();
  });

  test('a click before the start, or after a full range, starts over', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = render(<Calendar mode='range' onChange={onChange} />);
    await user.click(cell(container, '2026-10-10'));
    await user.click(cell(container, '2026-10-04'));
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ start: expect.objectContaining({ ad: '2026-10-04' }), end: null }),
    );
    await user.click(cell(container, '2026-10-06'));
    await user.click(cell(container, '2026-10-20'));
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ start: expect.objectContaining({ ad: '2026-10-20' }), end: null }),
    );
  });

  test('a one-day range is allowed', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = render(<Calendar mode='range' onChange={onChange} />);
    await user.click(cell(container, '2026-10-05'));
    await user.click(cell(container, '2026-10-05'));
    expect(onChange).toHaveBeenLastCalledWith({
      start: expect.objectContaining({ ad: '2026-10-05' }),
      end: expect.objectContaining({ ad: '2026-10-05' }),
    });
  });

  test('ranges can span months, and the keyboard picks both ends', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = render(
      <Calendar mode='range' defaultValue={{ start: null, end: null }} onChange={onChange} />,
    );
    screen.getByRole('grid').focus();
    await user.keyboard('{Enter}{ArrowDown}');
    expect(container.querySelector('._patro_dates_range_preview')).not.toBeNull();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(title(container)).toBe('November 2026');
    expect(onChange).toHaveBeenLastCalledWith({
      start: expect.objectContaining({ ad: '2026-10-29' }),
      end: expect.objectContaining({ ad: '2026-11-12' }),
    });
    expect(classesOf(container, '2026-11-01')).toContain('_patro_dates_in_range');
  });

  test('controlled range follows value', () => {
    const { container } = render(
      <Calendar
        mode='range'
        value={{ start: new Date(2026, 9, 5), end: new Date(2026, 9, 7) }}
        onChange={() => undefined}
      />,
    );
    expect(classesOf(container, '2026-10-06')).toContain('_patro_dates_in_range');
  });
});
