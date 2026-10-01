import { icons } from '../../shared/icons';

const ClearButton = ({ label, onClear }: { label: string; onClear: () => void }) => (
  <button type='button' className='_patro_datepicker_clear' aria-label={label} onClick={onClear}>
    {icons.clearIcon}
  </button>
);

export { ClearButton };
