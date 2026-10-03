import { KeyboardEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useIsClient } from '../../hooks/useToday';

type Props = {
  popoverRef: (node: HTMLDivElement | null) => void;
  id: string;
  label: string;
  portal: boolean;
  onEscape: () => void;
  children: ReactNode;
};

const Popover = ({ popoverRef, id, label, portal, onEscape, children }: Props) => {
  const isClient = useIsClient();
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') onEscape();
  };
  const popover = (
    <div
      ref={popoverRef}
      id={id}
      role='dialog'
      aria-label={label}
      className='_patro_datepicker_popper'
      // Transparent, not hidden, until placed: a keyboard-opened grid must be able to take focus.
      style={{ position: portal ? 'fixed' : 'absolute', left: 0, top: 0, opacity: 0 }}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  );
  // No document.body on the server; the portal appears after hydration.
  if (!portal) return popover;
  return isClient ? createPortal(popover, document.body) : null;
};

export { Popover };
