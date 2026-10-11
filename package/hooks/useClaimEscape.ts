import { useEffect } from 'react';

// Window capture runs before dialogs' document listeners; they all skip an Escape whose default is prevented.
const useClaimEscape = (active: boolean, contains: (node: Node) => boolean) => {
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && event.target instanceof Node && contains(event.target))
        event.preventDefault();
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [active, contains]);
};

export { useClaimEscape };
