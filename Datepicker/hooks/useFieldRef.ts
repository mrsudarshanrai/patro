import { ForwardedRef, useCallback, useState } from 'react';

const useFieldRef = (
  ref: ForwardedRef<HTMLElement>,
  setAnchor: (node: HTMLDivElement | null) => void,
) => {
  const [field, setField] = useState<HTMLElement | null>(null);
  const setFieldNode = useCallback(
    (node: HTMLElement | null) => {
      setField(node);
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );
  const setFieldAndAnchor = useCallback(
    (node: HTMLDivElement | null) => {
      setFieldNode(node);
      setAnchor(node);
    },
    [setFieldNode, setAnchor],
  );
  return { field, setFieldNode, setFieldAndAnchor };
};

export { useFieldRef };
