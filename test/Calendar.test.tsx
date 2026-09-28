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

describe('keyboard navigation', () => {
  const focused = (container: HTMLElement) =>
    container.querySelector('._patro_dates_focused')?.getAttribute('title');

  const setup = (props: Partial<Parameters<typeof Calendar>[0]> = {}) => {
    const user = userEvent.setup();
    const utils = render(<Calendar defaultDate={TODAY} {...props} />);
    const grid = screen.getByRole('grid');
    return { user, grid, ...utils };
  };

  test('tabbing into the grid focuses the selected day and wires it for screen readers', async () => {
    const { user, container, grid } = setup();
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
      calendarType: 'BS',
      defaultDate: new Date(2026, 10, 12),
    });
    grid.focus();

    await user.keyboard('{ArrowDown}');
    expect(focused(container)).toBe('2026-11-19');
    expect(title(container)).toBe('मंसिर 2083');
  });

  test('PageDown and PageUp change month and keep a visible day focused', async () => {
    const { user, container, grid } = setup();
    grid.focus();

    await user.keyboard('{PageDown}');
    expect(title(container)).toBe('November 2026');
    expect(focused(container)).toBe('2026-11-01');
    await user.keyboard('{PageUp}');
    expect(focused(container)).toBe('2026-10-29');
  });

  test('Enter selects the focused day', async () => {
    const onChange = jest.fn();
    const { user, container, grid } = setup({ onChange });
    grid.focus();

    await user.keyboard('{ArrowRight}{Enter}');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ adDate: '2026-10-30' }));
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

test('defaultDate={null} shows the current month with nothing selected', () => {
  const { container } = render(<Calendar defaultDate={null} />);
  expect(title(container)).toBe('October 2026');
  expect(container.querySelector('._patro_dates_current_date')).toBeNull();
  expect(screen.getByRole('grid').querySelector('[aria-selected="true"]')).toBeNull();
});

describe('supported range edges', () => {
  test('last month (BS 2099 Chaitra) renders, cannot go further, days past the table are blank', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Calendar calendarType='BS' defaultDate={new Date(2043, 3, 1)} showExtra />,
    );
    expect(title(container)).toBe('चैत्र 2099');

    const next = screen.getByLabelText('Next month');
    expect(next).toBeDisabled();
    await user.click(next);
    screen.getByRole('grid').focus();
    await user.keyboard('{PageDown}{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(title(container)).toBe('चैत्र 2099');

    const beyond = cell(container, '2043-04-15');
    expect(beyond).toHaveClass('_patro_dates_disabled');
    expect(beyond).toHaveAttribute('aria-disabled', 'true');
    expect(beyond.textContent).toBe('');
  });

  test('first AD month (April 1921) renders with pre-table days disabled', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = render(
      <Calendar defaultDate={new Date(1921, 3, 13)} onChange={onChange} showExtra />,
    );
    expect(title(container)).toBe('April 1921');
    expect(container.querySelector('._patro_header_subtitle')?.textContent).toBe(
      'चैत्र/बैशाख - 1977',
    );
    expect(screen.getByLabelText('Previous month')).toBeDisabled();

    const before = cell(container, '1921-04-12');
    expect(before).toHaveClass('_patro_dates_disabled');
    expect(before.textContent).toBe('12');
    expect(cell(container, '1921-04-13').textContent).toBe('13०१');

    await user.click(before);
    expect(onChange).not.toHaveBeenCalled();

    screen.getByRole('grid').focus();
    await user.keyboard('{ArrowLeft}{PageUp}');
    expect(container.querySelector('._patro_dates_focused')).toHaveAttribute('title', '1921-04-13');
    expect(title(container)).toBe('April 1921');
  });

  test('first BS month (1978 Baisakh) cannot go back', () => {
    const { container } = render(
      <Calendar calendarType='BS' defaultDate={new Date(1921, 3, 20)} />,
    );
    expect(title(container)).toBe('बैशाख 1978');
    expect(screen.getByLabelText('Previous month')).toBeDisabled();
    expect(screen.getByLabelText('Next month')).toBeEnabled();
  });

  test('an out-of-range defaultDate shows the nearest month with nothing selected', () => {
    const { container } = render(<Calendar defaultDate={new Date(2050, 0, 1)} />);
    expect(title(container)).toBe('April 2043');
    expect(container.querySelector('._patro_dates_current_date')).toBeNull();
  });
});
