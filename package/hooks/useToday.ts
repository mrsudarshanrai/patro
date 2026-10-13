import { useSyncExternalStore } from 'react';
import { createDateString, getToday, supportedAdDate } from '../utils';
import type { DateInput } from '../types/public';

const currentAdDate = () => {
  const { year, month, date } = getToday();
  return createDateString(year, month, date);
};

// Re-render just after local midnight so a page left open moves on to the new day.
const subscribe = (onChange: () => void) => {
  let timer: ReturnType<typeof setTimeout>;
  const schedule = () => {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    timer = setTimeout(
      () => {
        onChange();
        schedule();
      },
      midnight.getTime() - now.getTime() + 1000,
    );
  };
  schedule();
  return () => clearTimeout(timer);
};

const noSubscription = () => (): void => undefined;

/**
 * Today's AD date, or null while server rendering and hydrating: the server's
 * "today" (often UTC) can differ from the visitor's, which would break hydration.
 */
const useToday = (today?: DateInput): string | null => {
  const live = useSyncExternalStore(subscribe, currentAdDate, (): null => null);
  return supportedAdDate(today) ?? live;
};

/** False while server rendering and hydrating, true after. */
const useIsClient = () =>
  useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );

export { useToday, useIsClient };
