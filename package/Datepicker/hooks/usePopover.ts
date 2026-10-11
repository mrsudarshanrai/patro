import { FocusEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  autoUpdate,
  computePosition,
  detectOverflow,
  flip,
  getOverflowAncestors,
  hide,
  offset,
  shift,
  size,
  type Middleware,
} from '@floating-ui/dom';
import { useClaimEscape } from '../../hooks/useClaimEscape';
import { useControllableValue } from '../../hooks/useControllableValue';
import type { UsePopoverOptions } from '../DatepickerType';

const SCREEN_PADDING = 8;

// The page can scroll down to a popover that runs past the bottom, never up past the top.
const keepTopOnScreen: Middleware = {
  name: 'keepTopOnScreen',
  fn: async (state) => {
    const { top } = await detectOverflow(state, {
      padding: SCREEN_PADDING,
      boundary: document.documentElement,
    });
    return top > 0 ? { y: state.y + top } : {};
  },
};

// A popover positioned inside the field's scroll container scrolls and clips with it, so it never floats detached.
const scrollsWithField = (anchor: Element, popover: HTMLElement) => {
  const container = getOverflowAncestors(anchor).find((node) => node instanceof Element);
  return !!container && !!popover.offsetParent && container.contains(popover.offsetParent);
};

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

  const containsNode = useCallback(
    (node: Node) => !!(rootRef.current?.contains(node) || popover?.contains(node)),
    [popover],
  );
  useClaimEscape(isOpen, containsNode);

  // autoUpdate also follows layout shifts, not just scroll and resize.
  useEffect(() => {
    if (!anchor || !popover || !isOpen) return;
    return autoUpdate(anchor, popover, () => {
      computePosition(anchor, popover, {
        placement,
        strategy: portal ? 'fixed' : 'absolute',
        middleware: [
          offset(6),
          flip({ padding: SCREEN_PADDING, fallbackStrategy: 'initialPlacement' }),
          shift({ padding: SCREEN_PADDING, crossAxis: portal }),
          keepTopOnScreen,
          size({
            padding: SCREEN_PADDING,
            apply: ({ availableWidth }: { availableWidth: number }) => {
              popover.style.maxWidth = `${availableWidth}px`;
            },
          }),
          hide(),
        ],
      }).then(({ x, y, middlewareData }) => {
        Object.assign(popover.style, { left: `${x}px`, top: `${y}px`, opacity: '1' });
        const detached =
          !!middlewareData.hide?.referenceHidden && !scrollsWithField(anchor, popover);
        popover.toggleAttribute('data-detached', detached);
      });
    });
  }, [isOpen, anchor, popover, placement, portal]);

  // React bubbles blur out of portals, so this also sees the portalled popover.
  const onFocusLeave = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (!isOpen || !next) return;
    if (rootRef.current?.contains(next) || popover?.contains(next)) return;
    setOpen(false);
  };

  return { isOpen, setOpen, setAnchor, setPopover, rootRef, onFocusLeave };
};

export { usePopover };
