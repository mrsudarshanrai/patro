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
  const utils = render(<Datepicker defaultValue={TODAY} {...props} />);
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
  const { input } = setup({ calendar: 'BS' });
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
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ ad: '2026-10-05' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(input).toHaveTextContent('5 October 2026');

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
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ ad: '2026-10-28' }));
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

describe('empty state (defaultValue={null})', () => {
  test('shows the placeholder, then the picked date', async () => {
    const { user, input, container } = setup({ defaultValue: null });
    expect(input).toHaveTextContent('Select a date');
    expect(container.querySelector('._patro_datepicker_input_secondary')).toBeNull();

    await user.click(input);
    expect(container.querySelector('._patro_header_title')).toHaveTextContent('October 2026');
    expect(container.querySelector('._patro_dates_current_date')).toBeNull();
    expect(screen.getByTitle('2026-10-29')).toHaveClass('_patro_dates_today');

    await user.click(screen.getByTitle('2026-10-05'));
    expect(input).toHaveTextContent('5 October 2026');
  });

  test('uses a Nepali placeholder in BS mode and accepts a custom one', () => {
    const { input, unmount } = setup({ defaultValue: null, calendar: 'BS' });
    expect(input).toHaveTextContent('मिति छान्नुहोस्');
    unmount();

    const { input: custom } = setup({ defaultValue: null, placeholder: 'Pick a day' });
    expect(custom).toHaveTextContent('Pick a day');
  });

  test('a controlling parent can clear the value by passing null', () => {
    const { input, rerender } = setup({ value: TODAY });
    expect(input).toHaveTextContent('29 October 2026');

    rerender(<Datepicker value={null} />);
    expect(input).toHaveTextContent('Select a date');
  });
});

test('an out-of-range defaultValue shows the placeholder instead of crashing', () => {
  const { input } = setup({ defaultValue: new Date(2050, 0, 1), calendar: 'BS' });
  expect(input).toHaveTextContent('मिति छान्नुहोस्');
});

test('controlled: the input shows value, and picking a day only calls onChange', async () => {
  const onChange = jest.fn();
  const { user, input } = setup({ value: TODAY, onChange });
  await user.click(input);
  await user.click(screen.getByTitle('2026-10-05'));

  expect(onChange).toHaveBeenCalledWith(
    expect.objectContaining({ ad: '2026-10-05', bs: '2083-06-19' }),
  );
  expect(input).toHaveTextContent('29 October 2026');
});

test('passes date bounds through to the calendar', async () => {
  const { user, input } = setup({ minDate: new Date(2026, 9, 10) });
  await user.click(input);
  expect(screen.getByTitle('2026-10-09')).toHaveClass('_patro_dates_disabled');
  expect(screen.getByLabelText('Previous month')).toBeDisabled();
});

test('locale and numerals apply to the input text and placeholder', () => {
  const { input, unmount } = setup({ calendar: 'BS', locale: 'en', numerals: 'latin' });
  expect(input).toHaveTextContent('12 Kartik 2083');
  expect(input).toHaveTextContent('29 Oct 2026');
  unmount();

  const { input: empty } = setup({ calendar: 'BS', locale: 'en', defaultValue: null });
  expect(empty).toHaveTextContent('Select a date');
});

test('formatValue replaces the input text', () => {
  const { input } = setup({ formatValue: ({ bs, ad }) => `${bs} (${ad})` });
  expect(input).toHaveTextContent('2083-07-12 (2026-10-29)');
  expect(input.querySelector('._patro_datepicker_input_secondary')).toBeNull();
});
