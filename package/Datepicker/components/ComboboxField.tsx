import { KeyboardEvent } from 'react';
import { icons } from '../../shared/icons';
import type { ComboboxFieldProps } from '../DatepickerType';

// Select-only combobox (WAI-ARIA APG): unlike a button it can be required and read-only.
const ComboboxField = ({
  fieldRef,
  id,
  aria,
  disabled,
  readOnly,
  invalid,
  clearable,
  onOpen,
  onToggle,
  onClose,
  onFocus,
  onBlur,
  children,
}: ComboboxFieldProps) => {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') onClose();
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle(true);
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      onOpen(true);
    }
  };

  return (
    <div
      ref={fieldRef}
      id={id}
      className={[
        '_patro_datepicker_input',
        invalid && '_patro_datepicker_input_invalid',
        clearable && '_patro_datepicker_input_clearable',
      ]
        .filter(Boolean)
        .join(' ')}
      role='combobox'
      tabIndex={disabled ? -1 : 0}
      {...aria}
      aria-disabled={disabled || undefined}
      aria-readonly={readOnly || undefined}
      onClick={() => onToggle(false)}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {children}
      <span className='_patro_datepicker_input_icon'>{icons.calendarIcon}</span>
    </div>
  );
};

export { ComboboxField };
