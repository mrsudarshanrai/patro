import { KeyboardEvent, useRef, useState } from 'react';
import { CalendarSystem } from '../../types/public';

type Item = { value: number; label: string; disabled: boolean; current: boolean };

type Props = {
  items: Item[];
  label: string;
  onPick: (value: number) => void;
};

const COLUMNS = 3;
const STEPS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -COLUMNS,
  ArrowDown: COLUMNS,
};

// 3x4 grid of months or years, same height as the day grid. One Tab stop; arrow keys move.
const CalendarPicker = ({ items, label, onPick }: Props) => {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [focused, setFocused] = useState<number>();
  const enabled = (index: number) => !!items[index] && !items[index].disabled;
  const firstEnabled = items.findIndex((item) => !item.disabled);
  const current = items.findIndex((item) => item.current && !item.disabled);
  const tabStop =
    focused !== undefined && enabled(focused) ? focused : current >= 0 ? current : firstEnabled;

  const focus = (index: number) => {
    setFocused(index);
    buttons.current[index]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = STEPS[event.key];
    if (step !== undefined) {
      event.preventDefault();
      let next = index + step;
      while (next >= 0 && next < items.length && !enabled(next)) next += step;
      if (enabled(next)) focus(next);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const order = items.map((_, i) => i).filter(enabled);
      if (order.length) focus(event.key === 'Home' ? order[0] : order[order.length - 1]);
    }
  };

  return (
    <div className='_patro_picker' role='group' aria-label={label}>
      {items.map((item, index) => (
        <button
          key={item.value}
          ref={(node) => {
            buttons.current[index] = node;
          }}
          type='button'
          className='_patro_picker_item'
          tabIndex={index === tabStop ? 0 : -1}
          aria-current={item.current || undefined}
          disabled={item.disabled}
          onClick={() => onPick(item.value)}
          onKeyDown={(event) => onKeyDown(event, index)}
          onFocus={() => setFocused(index)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export type PickerView = 'days' | 'months' | 'years';
export type { Item as PickerItem, CalendarSystem };
export { CalendarPicker };
