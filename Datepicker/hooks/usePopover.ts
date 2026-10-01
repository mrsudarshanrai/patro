import { FocusEvent, useCallback, useEffect, useRef, useState } from 'react';
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import { useControllableValue } from '../../hooks/useControllableValue';
import type { UsePopoverOptions } from '../DatepickerType';

/**
 * The Datepicker popover's open state (controlled or not, never open while disabled or
 * read-only), its position against the field, and dismissal by outside click or focus leaving.
 */
const usePopover = ({
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  readOnly,
  placement,
  portal,
}: UsePopoverOptions) => {
  const [openValue, setOpenValue] = useControllableValue(open, () => defaultOpen);
  const isOpen = !disabled && !readOnly && openValue;
  // The field's box, which the popover is placed against.
  const [anchor, setAnchor] = useState<HTMLDivElement | null>(null);
  const [popover, setPopover] = useState<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const setOpen = useCallback(
    (next: boolean) => {
      if (next === isOpen || (next && (disabled || readOnly))) return;
      setOpenValue(next);
      onOpenChange?.(next);
    },
    [isOpen, disabled, readOnly, setOpenValue, onOpenChange],
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (popover?.contains(target) || anchor?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, anchor, popover, setOpen]);

  // autoUpdate re-places the popover on scroll, resize and layout shifts, not just on open.
  useEffect(() => {
    if (!anchor || !popover || !isOpen) return;
    return autoUpdate(anchor, popover, () => {
      computePosition(anchor, popover, {
        placement,
        strategy: portal ? 'fixed' : 'absolute',
        middleware: [offset(6), flip(), shift({ padding: 8 })],
      }).then(({ x, y }) => {
        Object.assign(popover.style, { left: `${x}px`, top: `${y}px`, opacity: '1' });
      });
    });
  }, [isOpen, anchor, popover, placement, portal]);

  // Tabbing out of the picker closes it; focus lost to nowhere (e.g. switching windows) doesn't.
  // React bubbles blur out of a portal, so this also sees the portalled popover.
  const onFocusLeave = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (!isOpen || !next) return;
    if (rootRef.current?.contains(next) || popover?.contains(next)) return;
    setOpen(false);
  };

  return { isOpen, setOpen, setAnchor, setPopover, rootRef, onFocusLeave };
};

export { usePopover };
