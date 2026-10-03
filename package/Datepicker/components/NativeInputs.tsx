import type { FormField } from '../DatepickerType';

type Props = {
  fields: FormField[];
  required: boolean;
  disabled: boolean;
  onFocus: () => void;
};

const NativeInputs = ({ fields, required, disabled, onFocus }: Props) => (
  <>
    {fields.map((field, index) => (
      <input
        key={index}
        className='_patro_datepicker_native'
        name={field.name}
        value={field.value}
        required={required}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden
        onChange={() => undefined}
        onFocus={onFocus}
      />
    ))}
  </>
);

export { NativeInputs };
