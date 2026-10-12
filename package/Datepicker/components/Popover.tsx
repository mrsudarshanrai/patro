import { KeyboardEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useIsClient } from '../../hooks/useToday';
import { tabbables } from '../../shared/tabbable';

type Props = {
  popoverRef: (node: HTMLDivElement | null) => void;
  id: string;
  label: string;
  portal: boolean;
  container: Element | null | undefined;
  onEscape: () => void;
  onTabOut: (direction: 'forward' | 'backward') => void;
  children: ReactNode;
};

const Popover = ({
  popoverRef,
  id,
  label,
  portal,
  container,
  onEscape,
  onTabOut,
  children,
}: Props) => {
  const isClient = useIsClient();
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') onEscape();
    // A portalled popover sits away from its field, so Tab at its edges wouldn't reach the next control.
    if (event.key !== 'Tab' || !portal) return;
    const stops = tabbables(event.currentTarget);
    const edge = event.shiftKey ? stops[0] : stops[stops.length - 1];
    if (event.target !== edge) return;
    event.preventDefault();
    event.stopPropagation();
    onTabOut(event.shiftKey ? 'backward' : 'forward');
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
  return isClient ? createPortal(popover, container ?? document.body) : null;
};

export { Popover };
