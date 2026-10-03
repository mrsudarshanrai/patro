import { useCallback, useState } from 'react';

// `null` is a controlled "nothing selected"; only `undefined` means uncontrolled.
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
