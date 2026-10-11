import { RefObject, useEffect, useRef } from 'react';

const useFormReset = (rootRef: RefObject<HTMLElement | null>, onReset: () => void) => {
  const onResetRef = useRef(onReset);
  useEffect(() => {
    onResetRef.current = onReset;
  });

  useEffect(() => {
    const form = rootRef.current?.closest('form');
    if (!form) return;
    const handleReset = () => onResetRef.current();
    form.addEventListener('reset', handleReset);
    return () => form.removeEventListener('reset', handleReset);
  }, [rootRef]);
};

export { useFormReset };
