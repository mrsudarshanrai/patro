import { useCallback, useState } from 'react';

/**
 * Controlled when `value` isn't `undefined` (`null` counts as a controlled "nothing selected");
 * otherwise keeps its own state, starting from `initial()`. The setter only updates that own
 * state, so a controlled owner stays the single source of truth.
 */
const useControllableValue = <T>(value: T | undefined, initial: () => T) => {
  const isControlled = value !== undefined;
  const [own, setOwn] = useState<T>(initial);
  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setOwn(() => next);
    },
    [isControlled],
  );
  return [isControlled ? (value as T) : own, setValue] as const;
};

export { useControllableValue };
