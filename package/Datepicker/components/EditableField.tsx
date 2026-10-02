import { icons } from '../../shared/icons';
import type { EditableFieldProps } from '../DatepickerType';

const EditableField = ({
  anchorRef,
  inputRef,
  id,
  aria,
  popoverId,
  toggleLabel,
  text,
  placeholder,
  secondaryText,
  disabled,
  readOnly,
  invalid,
  clearable,
  isOpen,
  onOpen,
  onToggle,
  onTextChange,
  onTextKeyDown,
  onTextBlur,
  onFocus,
}: EditableFieldProps) => (
  <div
    ref={anchorRef}
    className={[
      '_patro_datepicker_input',
      '_patro_datepicker_input_editable',
      isOpen && '_patro_datepicker_input_open',
      invalid && '_patro_datepicker_input_invalid',
      clearable && '_patro_datepicker_input_clearable',
      disabled && '_patro_datepicker_input_disabled',
    ]
      .filter(Boolean)
      .join(' ')}
  >
    <input
      ref={inputRef}
      id={id}
      className='_patro_datepicker_input_text'
      type='text'
      role='combobox'
      autoComplete='off'
      spellCheck={false}
      value={text}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      {...aria}
      onChange={onTextChange}
      onClick={() => onOpen(false)}
      onKeyDown={onTextKeyDown}
      onFocus={onFocus}
      onBlur={onTextBlur}
    />
    {/* Always rendered: it's the spacer that keeps the buttons at the end. */}
    <span className='_patro_datepicker_input_secondary'>{secondaryText}</span>
    {/* Out of the tab order: ArrowDown on the field opens the popover (APG). */}
    <button
      type='button'
      className='_patro_datepicker_input_icon _patro_datepicker_toggle'
      tabIndex={-1}
      aria-label={toggleLabel}
      aria-haspopup='dialog'
      aria-expanded={isOpen}
      aria-controls={isOpen ? popoverId : undefined}
      disabled={disabled || readOnly}
      onClick={() => onToggle(false)}
    >
      {icons.calendarIcon}
    </button>
  </div>
);

export { EditableField };
