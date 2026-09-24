import { stepViewAnchor } from '../hooks/useCalendarData';

test('stepViewAnchor advances one AD month without an invalid date at a month-length boundary', () => {
  // Regression: navigation state used to carry a stale day-of-month forward,
  // so stepping from a 29-31 day month into a shorter one could build an
  // invalid date string (e.g. "2026-02-31") that silently rolled into a
  // different month. Anchors are always pinned to day 1, so this can't happen.
  expect(stepViewAnchor('2026-01-01', 'AD', 1)).toBe('2026-02-01');
  expect(stepViewAnchor('2026-12-01', 'AD', 1)).toBe('2027-01-01');
  expect(stepViewAnchor('2026-01-01', 'AD', -1)).toBe('2025-12-01');
});

test('stepViewAnchor advances one true BS month in BS mode, including a BS year rollover', () => {
  // BS 2079-07-01 <-> BS 2079-08-01 (mid-year step, computed via bs2Ad).
  expect(stepViewAnchor('2022-10-18', 'BS', 1)).toBe('2022-11-17');
  expect(stepViewAnchor('2022-11-17', 'BS', -1)).toBe('2022-10-18');

  // BS 2079-12-01 -> BS 2080-01-01: a true BS year rollover, distinct from
  // stepping the underlying AD date by one AD month (BS 2079 has 12 months,
  // so month 12 + 1 must roll into BS 2080's Baisakh, not just +1 AD month).
  expect(stepViewAnchor('2023-03-15', 'BS', 1)).toBe('2023-04-14');
  expect(stepViewAnchor('2023-04-14', 'BS', -1)).toBe('2023-03-15');
});
