/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Datepicker } from '../Datepicker';

const TODAY = new Date(2026, 9, 29);

beforeEach(() => {
  jest.useFakeTimers({ now: TODAY, advanceTimers: true });
});

afterEach(() => {
  jest.useRealTimers();
});

const setup = (props: Partial<Parameters<typeof Datepicker>[0]> = {}) => {
  const user = userEvent.setup();
  const utils = render(<Datepicker defaultDate={TODAY} {...props} />);
  return { user, input: screen.getByRole('button'), ...utils };
};

test('shows the date in both calendars, with an optional label', () => {
  const { input } = setup({ label: 'Date' });
  expect(screen.getByText('Date')).toBeInTheDocument();
  expect(input).toHaveTextContent('29 October 2026');
  expect(input).toHaveTextContent('१२ कार्तिक');
  expect(input).toHaveAttribute('aria-expanded', 'false');
});

test('BS mode shows the BS date first', () => {
  const { input } = setup({ calendarType: 'BS' });
  expect(input).toHaveTextContent('१२ कार्तिक २०८३');
  expect(input).toHaveTextContent('29 Oct 2026');
});

test('click toggles the popover', async () => {
  const { user, input } = setup();
  await user.click(input);
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(input).toHaveAttribute('aria-expanded', 'true');

  await user.click(input);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('Enter opens and Escape closes the popover', async () => {
  const { user, input } = setup();
  input.focus();
  await user.keyboard('{Enter}');
  expect(screen.getByRole('dialog')).toBeInTheDocument();

  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('clicking outside closes the popover', async () => {
  const { user, input } = setup();
  await user.click(input);
  expect(screen.getByRole('dialog')).toBeInTheDocument();

  await user.click(document.body);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('picking a day updates the input, closes the popover and calls onChange', async () => {
  const onChange = jest.fn();
  const { user, input } = setup({ onChange });
  await user.click(input);

  await user.click(screen.getByTitle('2026-10-05'));
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ adDate: '2026-10-05' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(input).toHaveTextContent('05 October 2026');

  await user.click(input);
  expect(screen.getByTitle('2026-10-05')).toHaveClass('_patro_dates_current_date');
});

test('keyboard: ArrowDown opens, arrows + Enter pick a day and focus returns to the input', async () => {
  const onChange = jest.fn();
  const { user, input } = setup({ onChange });
  input.focus();

  await user.keyboard('{ArrowDown}');
  expect(screen.getByRole('dialog')).toBeInTheDocument();

  screen.getByRole('grid').focus();
  await user.keyboard('{ArrowLeft}{Enter}');
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ adDate: '2026-10-28' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(input).toHaveFocus();
  expect(input).toHaveTextContent('28 October 2026');
});

test('Escape inside the calendar closes the popover and returns focus to the input', async () => {
  const { user, input } = setup();
  await user.click(input);
  screen.getByRole('grid').focus();

  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(input).toHaveFocus();
});

describe('empty state (defaultDate={null})', () => {
  test('shows the placeholder, then the picked date', async () => {
    const { user, input, container } = setup({ defaultDate: null });
    expect(input).toHaveTextContent('Select a date');
    expect(container.querySelector('._patro_datepicker_input_secondary')).toBeNull();

    await user.click(input);
    expect(container.querySelector('._patro_header_title')).toHaveTextContent('October 2026');
    expect(container.querySelector('._patro_dates_current_date')).toBeNull();
    expect(screen.getByTitle('2026-10-29')).toHaveClass('_patro_dates_today');

    await user.click(screen.getByTitle('2026-10-05'));
    expect(input).toHaveTextContent('05 October 2026');
  });

  test('uses a Nepali placeholder in BS mode and accepts a custom one', () => {
    const { input, unmount } = setup({ defaultDate: null, calendarType: 'BS' });
    expect(input).toHaveTextContent('मिति छान्नुहोस्');
    unmount();

    const { input: custom } = setup({ defaultDate: null, placeholder: 'Pick a day' });
    expect(custom).toHaveTextContent('Pick a day');
  });

  test('a parent can clear the value by passing null', () => {
    const { input, rerender } = setup();
    expect(input).toHaveTextContent('29 October 2026');

    rerender(<Datepicker defaultDate={null} />);
    expect(input).toHaveTextContent('Select a date');
  });
});

test('an out-of-range defaultDate shows the placeholder instead of crashing', () => {
  const { input } = setup({ defaultDate: new Date(2050, 0, 1), calendarType: 'BS' });
  expect(input).toHaveTextContent('मिति छान्नुहोस्');
});
