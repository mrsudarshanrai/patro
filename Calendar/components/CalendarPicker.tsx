import { CalendarSystem } from '../../types/public';

type Item = { value: number; label: string; disabled: boolean; current: boolean };

type Props = {
  items: Item[];
  label: string;
  onPick: (value: number) => void;
};

// 3x4 grid of months or years, same height as the day grid.
const CalendarPicker = ({ items, label, onPick }: Props) => (
  <div className='_patro_picker' role='group' aria-label={label}>
    {items.map((item) => (
      <button
        key={item.value}
        type='button'
        className='_patro_picker_item'
        aria-current={item.current || undefined}
        disabled={item.disabled}
        onClick={() => onPick(item.value)}
      >
        {item.label}
      </button>
    ))}
  </div>
);

export type PickerView = 'days' | 'months' | 'years';
export type { Item as PickerItem, CalendarSystem };
export { CalendarPicker };
