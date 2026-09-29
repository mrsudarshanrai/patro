/** @jest-environment jsdom */
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Calendar } from '../Calendar';
import { Datepicker } from '../Datepicker';

expect.extend(toHaveNoViolations);

const TODAY = new Date(2026, 9, 29);

beforeEach(() => {
  jest.useFakeTimers({ now: TODAY, advanceTimers: true });
});

afterEach(() => {
  jest.useRealTimers();
});

test.each(['AD', 'BS'] as const)('%s calendar', async (calendar) => {
  const { container } = render(
    <Calendar
      calendar={calendar}
      defaultValue={new Date(2026, 9, 12)}
      minDate={new Date(2026, 9, 3)}
      showTodayButton
    />,
  );
  expect(await axe(container)).toHaveNoViolations();
});

test('range calendar', async () => {
  const { container } = render(
    <Calendar
      mode='range'
      defaultValue={{ start: new Date(2026, 9, 6), end: new Date(2026, 9, 14) }}
    />,
  );
  expect(await axe(container)).toHaveNoViolations();
});

test('month and year pickers', async () => {
  const user = userEvent.setup();
  const { container, getByRole } = render(<Calendar defaultValue={TODAY} />);
  await user.click(getByRole('button', { name: /choose month/ }));
  expect(await axe(container)).toHaveNoViolations();
  await user.click(getByRole('button', { name: /choose year/ }));
  expect(await axe(container)).toHaveNoViolations();
});

test('open Datepicker with label, value and clear button', async () => {
  const user = userEvent.setup();
  const { container, getByRole } = render(
    <Datepicker label='Date of birth' defaultValue={TODAY} clearable name='dob' required />,
  );
  expect(await axe(container)).toHaveNoViolations();
  await user.click(getByRole('combobox', { name: 'Date of birth' }));
  expect(await axe(container)).toHaveNoViolations();
});

test('empty, invalid and disabled Datepickers', async () => {
  const { container } = render(
    <>
      <Datepicker label='Start' defaultValue={null} invalid />
      <Datepicker label='End' defaultValue={null} disabled />
      <Datepicker aria-label='Stay' mode='range' />
    </>,
  );
  expect(await axe(container)).toHaveNoViolations();
});
