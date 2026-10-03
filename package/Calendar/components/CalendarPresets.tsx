import type { PresetItem } from '../CalendarType';

type Props = { items: PresetItem[]; label: string; onPick: (item: PresetItem) => void };

const CalendarPresets = ({ items, label, onPick }: Props) => (
  <div className='_patro_presets' role='group' aria-label={label}>
    {items.map((item) => (
      <button
        key={item.label}
        type='button'
        className='_patro_presets_item'
        aria-pressed={item.pressed}
        disabled={item.disabled}
        onClick={() => onPick(item)}
      >
        {item.label}
      </button>
    ))}
  </div>
);

export { CalendarPresets };
