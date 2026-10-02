/** @jest-environment jsdom */
import './textEncoderPolyfill';
import { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { Calendar } from '../Calendar';
import { Datepicker } from '../Datepicker';

// React only warns about act() environments when this is set.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => jest.useRealTimers());

// The server's clock is a day behind the browser's, e.g. UTC vs Asia/Kathmandu near midnight.
test('hydrates without mismatches when the server and browser disagree on today', async () => {
  jest.useFakeTimers({ now: new Date(2026, 9, 29, 23, 0), advanceTimers: true });
  const app = (
    <>
      <Calendar showTodayButton />
      <Datepicker defaultOpen />
      <Datepicker defaultOpen portal />
    </>
  );
  const container = document.createElement('div');
  container.innerHTML = renderToString(app);
  document.body.appendChild(container);

  jest.setSystemTime(new Date(2026, 9, 30, 4, 45));
  const errors: unknown[] = [];
  const consoleError = jest.spyOn(console, 'error').mockImplementation((...args) => {
    errors.push(args);
  });
  await act(async () => {
    hydrateRoot(container, app, { onRecoverableError: (error) => errors.push(error) });
  });
  consoleError.mockRestore();

  expect(errors).toEqual([]);
  expect(document.querySelectorAll('[aria-busy="true"]')).toHaveLength(0);
  const todayCells = [...document.querySelectorAll('._patro_dates_today')];
  expect(todayCells.map((cell) => cell.getAttribute('title'))).toEqual([
    '2026-10-30',
    '2026-10-30',
    '2026-10-30',
  ]);
  // The portal popover mounts in document.body once hydrated.
  expect(document.body.querySelector(':scope > ._patro_datepicker_popper')).not.toBeNull();
});
