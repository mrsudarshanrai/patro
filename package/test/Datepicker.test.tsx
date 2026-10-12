/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar } from '../Calendar';
import { Datepicker } from '../Datepicker';
import type { DatepickerBaseProps, DatepickerProps } from '../Datepicker/DatepickerType';
import type { PatroDate, SingleSelection } from '../types/public';

const TODAY = new Date(2026, 9, 29);

beforeEach(() => {
  jest.useFakeTimers({ now: TODAY, advanceTimers: true });
});

afterEach(() => {
  jest.useRealTimers();
});

type SingleProps = Partial<
  DatepickerBaseProps & SingleSelection & { formatValue?: (value: PatroDate) => string }
>;

const setup = (props: SingleProps = {}) => {
  const user = userEvent.setup();
  const utils = render(<Datepicker defaultValue={TODAY} {...props} />);
  const input = utils.container.querySelector('[aria-haspopup="dialog"]') as HTMLElement;
  return { user, input, ...utils };
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

test('Escape in the open popover is claimed before a surrounding dialog sees it', async () => {
  const { user, input } = setup();
  const seen: boolean[] = [];
  const record = (event: KeyboardEvent) => seen.push(event.defaultPrevented);
  document.addEventListener('keydown', record, true);
  await user.click(input);
  screen.getByRole('grid').focus();
  await user.keyboard('{Escape}');
  await user.keyboard('{Escape}');
  document.removeEventListener('keydown', record, true);

  expect(seen).toEqual([true, false]);
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

describe('behaviour and forms', () => {
  test('disabled cannot be focused or opened', async () => {
    const { user, input } = setup({ disabled: true });
    expect(input).toHaveAttribute('aria-disabled', 'true');
    expect(input).toHaveAttribute('tabindex', '-1');
    await user.click(input);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('readOnly is focusable but cannot be opened', async () => {
    const { user, input } = setup({ readOnly: true });
    expect(input).toHaveAttribute('aria-readonly', 'true');
    input.focus();
    await user.keyboard('{Enter}{ArrowDown}');
    await user.click(input);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('invalid sets aria-invalid and error styling', () => {
    const { input } = setup({ invalid: true });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('_patro_datepicker_input_invalid');
  });

  test('closeOnSelect={false} keeps the popover open after picking', async () => {
    const { user, input } = setup({ closeOnSelect: false });
    await user.click(input);
    await user.click(screen.getByTitle('2026-10-05'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(input).toHaveTextContent('5 October 2026');
  });

  test('controlled open only changes when the parent says so', async () => {
    const onOpenChange = jest.fn();
    const { user, input, rerender } = setup({ open: true, onOpenChange });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(input);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    rerender(<Datepicker defaultValue={TODAY} open={false} onOpenChange={onOpenChange} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('defaultOpen starts open, and onOpenChange reports changes', async () => {
    const onOpenChange = jest.fn();
    const { user, input } = setup({ defaultOpen: true, onOpenChange });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(input);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('clearable shows a clear button that empties the value', async () => {
    const onChange = jest.fn();
    const { user, input } = setup({ clearable: true, onChange });
    await user.click(screen.getByLabelText('Clear date'));
    expect(onChange).toHaveBeenCalledWith(null);
    expect(input).toHaveTextContent('Select a date');
    expect(screen.queryByLabelText('Clear date')).not.toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  test('name submits the date with a native form, in AD or BS', () => {
    const { container, rerender } = render(
      <form>
        <Datepicker name='dob' defaultValue={TODAY} />
      </form>,
    );
    const form = () => new FormData(container.querySelector('form') as HTMLFormElement);
    expect(form().get('dob')).toBe('2026-10-29');

    rerender(
      <form>
        <Datepicker name='dob' defaultValue={TODAY} valueFormat='bs' />
      </form>,
    );
    expect(form().get('dob')).toBe('2083-07-12');
  });

  test('required blocks form submission while empty', () => {
    const { container } = render(
      <form>
        <Datepicker name='dob' required defaultValue={null} />
      </form>,
    );
    const form = container.querySelector('form') as HTMLFormElement;
    expect(form.checkValidity()).toBe(false);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-required', 'true');
  });

  test('label, id and aria props are wired to the input', () => {
    render(
      <>
        <Datepicker
          label='Date of birth'
          id='dob'
          aria-describedby='dob-help'
          defaultValue={TODAY}
        />
        <p id='dob-help'>As on your citizenship</p>
      </>,
    );
    const input = screen.getByRole('combobox', { name: 'Date of birth' });
    expect(input).toHaveAttribute('id', 'dob');
    expect(input).toHaveAccessibleDescription('As on your citizenship');
  });

  test('focus props, autoFocus and ref reach the input', async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const ref = createRef<HTMLDivElement>();
    render(<Datepicker ref={ref} autoFocus onFocus={onFocus} onBlur={onBlur} />);
    expect(ref.current).toBe(screen.getByRole('combobox', { name: 'Choose a date' }));
    expect(ref.current).toHaveFocus();
    expect(onFocus).toHaveBeenCalled();
    ref.current?.blur();
    expect(onBlur).toHaveBeenCalled();
  });

  test('portal renders the popover in document.body', async () => {
    const { user, input, container } = setup({ portal: true });
    await user.click(input);
    expect(screen.getByRole('dialog').parentElement).toBe(document.body);
    expect(container.querySelector('[role="dialog"]')).toBeNull();

    await user.click(screen.getByTitle('2026-10-05'));
    expect(input).toHaveTextContent('5 October 2026');
  });
});

test('className and style go on the Datepicker root only', async () => {
  const { user, input, container } = setup({ className: 'my-picker', style: { width: 320 } });
  const root = container.firstElementChild as HTMLElement;
  expect(root).toHaveClass('_patro_datepicker', 'my-picker');
  expect(root.style.width).toBe('320px');

  await user.click(input);
  expect(container.querySelector('._patro_container')).not.toHaveClass('my-picker');
});

describe('range mode', () => {
  const setupRange = (props: Record<string, unknown> = {}) => {
    const user = userEvent.setup();
    const utils = render(<Datepicker mode='range' {...props} />);
    const input = utils.container.querySelector('[aria-haspopup="dialog"]') as HTMLElement;
    return { user, input, ...utils };
  };

  test('shows the range, and closes only once the end is picked', async () => {
    const { user, input } = setupRange();
    expect(input).toHaveTextContent('Select dates');
    await user.click(input);
    await user.click(screen.getByTitle('2026-10-05'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(input).toHaveTextContent('5 October 2026 – …');

    await user.click(screen.getByTitle('2026-10-09'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(input).toHaveTextContent('5 Oct – 9 Oct 2026');
  });

  test('writes the year on both ends when they differ, and works in BS', () => {
    const { input, unmount } = setupRange({
      defaultValue: { start: new Date(2026, 11, 28), end: new Date(2027, 0, 3) },
    });
    expect(input).toHaveTextContent('28 Dec 2026 – 3 Jan 2027');
    unmount();

    const { input: bs } = setupRange({
      calendar: 'BS',
      defaultValue: { start: new Date(2026, 9, 21), end: new Date(2026, 9, 25) },
    });
    expect(bs).toHaveTextContent('४ कार्तिक – ८ कार्तिक २०८३');
  });

  test('a range given end-first is shown start-first', () => {
    const { input } = setupRange({
      defaultValue: { start: new Date(2026, 9, 20), end: new Date(2026, 9, 10) },
    });
    expect(input).toHaveTextContent('10 Oct – 20 Oct 2026');
  });

  test('submits both ends with a form, and clearing resets both', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = render(
      <form>
        <Datepicker
          mode='range'
          name='stay'
          clearable
          defaultValue={{ start: new Date(2026, 9, 5), end: new Date(2026, 9, 9) }}
          onChange={onChange}
        />
      </form>,
    );
    const form = () => new FormData(container.querySelector('form') as HTMLFormElement);
    expect(form().get('stay[start]')).toBe('2026-10-05');
    expect(form().get('stay[end]')).toBe('2026-10-09');

    await user.click(screen.getByLabelText('Clear date'));
    expect(onChange).toHaveBeenCalledWith({ start: null, end: null });
    expect(form().get('stay[start]')).toBe('');
  });

  test('formatValue receives the range', () => {
    const { input } = setupRange({
      defaultValue: { start: new Date(2026, 9, 5), end: new Date(2026, 9, 9) },
      formatValue: ({ start, end }: { start: { bs: string }; end: { bs: string } }) =>
        `${start.bs} → ${end.bs}`,
    });
    expect(input).toHaveTextContent('2083-06-19 → 2083-06-23');
  });
});

test('popover and clear button names follow the display language', async () => {
  const { user, input } = setup({ calendar: 'BS', clearable: true });
  expect(screen.getByLabelText('मिति हटाउनुहोस्')).toBeInTheDocument();
  await user.click(input);
  expect(screen.getByRole('dialog', { name: 'मिति छान्नुहोस्' })).toBeInTheDocument();
});

describe('focus management', () => {
  test('opening with the keyboard moves focus into the day grid', async () => {
    const { user, input } = setup();
    input.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('grid')).toHaveFocus();
    expect(input).toHaveAttribute('aria-controls', screen.getByRole('dialog').id);

    await user.keyboard('{ArrowRight}{Enter}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(input).toHaveFocus();
    expect(input).toHaveTextContent('30 October 2026');
  });

  test('opening with the mouse keeps focus on the input', async () => {
    const { user, input } = setup();
    await user.click(input);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  test('tabbing out of the popover closes it', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Datepicker defaultValue={TODAY} />
        <button type='button'>after</button>
      </>,
    );
    const input = screen.getByRole('combobox', { name: 'Choose a date' });
    expect(input).toHaveTextContent('29 October 2026');
    input.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('grid')).toHaveFocus();
    await user.tab();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'after' })).toHaveFocus();
  });

  test('moving focus within the popover keeps it open', async () => {
    const { user, input } = setup();
    input.focus();
    await user.keyboard('{Enter}');
    await user.tab({ shift: true });
    expect(screen.getByLabelText('Next month')).toHaveFocus();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

test('defaultMonth opens an empty picker on that month, e.g. for a date of birth', async () => {
  const { user, input, container } = setup({
    defaultValue: null,
    defaultMonth: new Date(2000, 5, 1),
  });
  await user.click(input);
  expect(container.querySelector('._patro_header_title')).toHaveTextContent('June 2000');
  await user.click(screen.getByTitle('2000-06-15'));
  await user.click(input);
  expect(container.querySelector('._patro_header_title')).toHaveTextContent('June 2000');
});

describe('editable', () => {
  test('a new value from the parent replaces half-typed text', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Datepicker editable label='Date' value='2026-10-29' />);
    const field = screen.getByRole('combobox', { name: 'Date' });
    await user.clear(field);
    await user.type(field, '2026-1');
    expect(field).toHaveValue('2026-1');

    rerender(<Datepicker editable label='Date' value='2026-11-05' />);
    expect(field).toHaveValue('2026-11-05');
    expect(field).toHaveFocus();
  });

  const setupEditable = (props: SingleProps & { editable?: boolean } = {}) => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const utils = render(
      <>
        <Datepicker editable label='Date' defaultValue={TODAY} onChange={onChange} {...props} />
        <button type='button'>after</button>
      </>,
    );
    const field = screen.getByRole('combobox', { name: 'Date' }) as HTMLInputElement;
    return { user, onChange, field, ...utils };
  };

  test('shows the value as editable text in the displayed calendar', () => {
    const { field, unmount } = setupEditable();
    expect(field.tagName).toBe('INPUT');
    expect(field).toHaveValue('2026-10-29');
    unmount();
    const { field: bs } = setupEditable({ calendar: 'BS' });
    expect(bs).toHaveValue('२०८३-०७-१२');
  });

  test('typing a date and pressing Enter commits it', async () => {
    const { user, field, onChange } = setupEditable();
    await user.clear(field);
    await user.type(field, '2026/1/5{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ ad: '2026-01-05' }));
    expect(field).toHaveValue('2026-01-05');
  });

  test('BS text can be typed in Latin or Devanagari digits', async () => {
    const { user, field, onChange } = setupEditable({ calendar: 'BS' });
    await user.clear(field);
    await user.type(field, '2083-01-01');
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ bs: '2083-01-01' }));
    expect(field).toHaveValue('२०८३-०१-०१');
  });

  test('Enter on text that is not a date marks it invalid; leaving puts the value back', async () => {
    const { user, field, onChange } = setupEditable();
    await user.clear(field);
    await user.type(field, '2026-02-30{Enter}');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(onChange).not.toHaveBeenCalled();
    await user.tab();
    expect(field).toHaveValue('2026-10-29');
    expect(field).not.toHaveAttribute('aria-invalid');
  });

  test('dates outside minDate/maxDate or disabled are rejected', async () => {
    const { user, field, onChange } = setupEditable({
      maxDate: new Date(2026, 11, 31),
      isDateDisabled: ({ ad }: PatroDate) => ad === '2026-11-11',
    });
    await user.clear(field);
    await user.type(field, '2027-01-01{Enter}');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    await user.clear(field);
    await user.type(field, '2026-11-11{Enter}');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(onChange).not.toHaveBeenCalled();
  });

  test('clearing the text clears the value', async () => {
    const { user, field, onChange } = setupEditable();
    await user.clear(field);
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(field).toHaveValue('');
    expect(field).toHaveAttribute('placeholder', 'YYYY-MM-DD');
  });

  test('ArrowDown opens the calendar in the grid; picking fills the text', async () => {
    const { user, field } = setupEditable();
    field.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('grid')).toHaveFocus();
    expect(field).toHaveAttribute('aria-controls', screen.getByRole('dialog').id);
    await user.keyboard('{ArrowLeft}{Enter}');
    expect(field).toHaveFocus();
    expect(field).toHaveValue('2026-10-28');
  });

  test('the calendar button toggles the popover; ref and name point at the right elements', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLElement>();
    const { container } = render(<Datepicker editable ref={ref} name='dob' defaultValue={TODAY} />);
    expect(ref.current).toBe(screen.getByRole('combobox'));
    await user.click(screen.getByRole('button', { name: 'Choose a date' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(container.querySelector('input[name="dob"]')).toHaveValue('2026-10-29');
  });
});

describe('pass-through props', () => {
  test('data-*, inputClassName and aria-labelledby reach the field', () => {
    render(
      <>
        <span id='external'>Check-in</span>
        <Datepicker data-testid='dob' inputClassName='form-input' aria-labelledby='external' />
      </>,
    );
    const field = screen.getByTestId('dob');
    expect(field).toHaveAttribute('role', 'combobox');
    expect(field).toHaveClass('_patro_datepicker_input', 'form-input');
    expect(screen.getByRole('combobox', { name: 'Check-in' })).toBe(field);
  });

  test('editable: data-* and inputMode go on the text input, the class on its box', () => {
    render(
      <Datepicker editable data-testid='dob' inputClassName='form-input' inputMode='numeric' />,
    );
    const input = screen.getByTestId('dob');
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('inputmode', 'numeric');
    expect(input.parentElement).toHaveClass('form-input');
  });

  test('Calendar puts data-* on its root', () => {
    const { container } = render(<Calendar data-testid='cal' data-section='booking' />);
    expect(container.firstElementChild).toHaveAttribute('data-testid', 'cal');
    expect(container.firstElementChild).toHaveAttribute('data-section', 'booking');
  });
});

test('range-only props are type errors in single mode, data-* is not', () => {
  render(
    <>
      {/* @ts-expect-error minDays only applies to mode='range' */}
      <Datepicker minDays={2} />
      {/* @ts-expect-error editable is single mode only */}
      <Datepicker mode='range' editable />
      <Datepicker data-testid='single' />
      {/* @ts-expect-error maxDays only applies to mode='range' */}
      <Calendar maxDays={3} />
    </>,
  );
  expect(screen.getByTestId('single')).toHaveAttribute('role', 'combobox');
});

test('a range Datepicker given editable from plain JS still ignores it', () => {
  const props = { mode: 'range', editable: true, label: 'Stay' } as unknown as DatepickerProps;
  const { container } = render(<Datepicker {...props} />);
  expect(container.querySelector('input[type="text"]')).toBeNull();
  expect(screen.getByRole('combobox', { name: 'Stay' }).tagName).toBe('DIV');
});
