import { renderToString } from 'react-dom/server';
import { Calendar } from '../Calendar';
import { Datepicker } from '../Datepicker';

// Runs in node: no `document`, like a real server render.

test('a portal Datepicker server-renders without touching document', () => {
  const html = renderToString(<Datepicker defaultOpen portal />);
  expect(html).toContain('_patro_datepicker_input');
  expect(html).not.toContain('_patro_datepicker_popper');
});

test('without a value or `today`, the server leaves the month blank', () => {
  jest.useFakeTimers({ now: new Date(2026, 9, 29) });
  const html = renderToString(<Calendar />);
  jest.useRealTimers();
  expect(html).toContain('aria-busy="true"');
  expect(html).not.toContain('_patro_dates_today');
});

test('`today` lets the server render the month and today marker', () => {
  const html = renderToString(<Calendar today={new Date(2026, 9, 29)} />);
  expect(html).not.toContain('aria-busy');
  expect(html).toContain('October 2026');
  expect(html).toMatch(/title="2026-10-29" class="[^"]*_patro_dates_today/);
});

test('a value server-renders its month', () => {
  const html = renderToString(<Calendar value={new Date(2026, 0, 15)} />);
  expect(html).not.toContain('aria-busy');
  expect(html).toContain('January 2026');
});
