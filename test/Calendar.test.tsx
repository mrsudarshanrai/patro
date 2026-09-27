/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar } from '../Calendar';

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

test('AD calendar shows the defaultDate month with selected, today and offset cells', () => {
  const { container } = render(<Calendar defaultDate={new Date(2026, 9, 12)} />);

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
    render(<Calendar defaultDate={date} />).container.querySelector('._patro_header_subtitle')
      ?.textContent;

  expect(subtitle(new Date(2026, 8, 15))).toBe('भाद्र/आश्विन - 2083');
  expect(subtitle(new Date(2027, 2, 15))).toBe('फाल्गुन/चैत्र - 2083');
  expect(subtitle(new Date(2026, 3, 15))).toBe('चैत्र/बैशाख - 2082');
});

test('BS calendar shows the BS month containing defaultDate', () => {
  const { container } = render(<Calendar calendarType='BS' defaultDate={TODAY} showExtra />);

  expect(container.firstElementChild).toHaveAttribute('data-calendar-type', 'BS');
  expect(title(container)).toBe('कार्तिक 2083');
  expect(container.querySelector('._patro_header_subtitle')?.textContent).toBe('Oct/Nov - 2026');
  expect(cell(container, '2026-10-18').textContent).toBe('१18');
  expect(cell(container, '2026-10-29')).toHaveClass('_patro_dates_current_date');
});

test('showExtra toggles the other-calendar number', () => {
  const { container, rerender } = render(<Calendar defaultDate={TODAY} />);
  expect(cell(container, '2026-10-29').querySelector('sub')).toBeNull();

  rerender(<Calendar defaultDate={TODAY} showExtra />);
  expect(cell(container, '2026-10-29').querySelector('sub')?.textContent).toBe('१२');
});

test('month navigation steps by one month in the displayed calendar', async () => {
  const user = userEvent.setup();
  const { container } = render(<Calendar calendarType='BS' defaultDate={TODAY} />);

  await user.click(screen.getByLabelText('Next month'));
  expect(title(container)).toBe('मंसिर 2083');
  await user.click(screen.getByLabelText('Previous month'));
  await user.click(screen.getByLabelText('Previous month'));
  expect(title(container)).toBe('आश्विन 2083');
});

test('switching AD to BS keeps the selected date in view', () => {
  const { container, rerender } = render(<Calendar defaultDate={TODAY} />);
  expect(title(container)).toBe('October 2026');

  rerender(<Calendar calendarType='BS' defaultDate={TODAY} />);
  expect(title(container)).toBe('कार्तिक 2083');
});

test('clicking a day selects it and calls onChange with its AD date', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  const { container } = render(<Calendar defaultDate={TODAY} onChange={onChange} />);

  await user.click(cell(container, '2026-10-05'));
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ adDate: '2026-10-05' }));
  expect(cell(container, '2026-10-05')).toHaveClass('_patro_dates_current_date');
  expect(cell(container, '2026-10-29')).not.toHaveClass('_patro_dates_current_date');
});
