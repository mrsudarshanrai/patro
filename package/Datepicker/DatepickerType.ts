import type { ChangeEvent, FocusEvent, HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import type { DisplayOptions } from '../utils';
import type { DataAttributes } from '../shared/dataAttributes';
import type { CalendarBaseProps } from '../Calendar/CalendarType';
import type {
  CalendarSystem,
  DateInput,
  DateRangeInput,
  PatroDate,
  PatroDateRange,
  RangeSelection,
  SingleSelection,
} from '../types/public';

export interface DatepickerBaseProps extends CalendarBaseProps {
  label?: string;
  /** Shown when there's no value. Defaults to 'Select a date' / 'मिति छान्नुहोस्'. */
  placeholder?: string;
  disabled?: boolean;
  /** Focusable and shows its value, but can't be opened or changed. */
  readOnly?: boolean;
  /** Error styling and `aria-invalid`, e.g. after failed form validation. */
  invalid?: boolean;
  /** Close the popover after picking a day. Defaults to true. */
  closeOnSelect?: boolean;
  /** Controlled popover state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Show a button that clears the value. */
  clearable?: boolean;
  /** Form field name; the date is submitted with the form. Range mode submits `name[start]` and `name[end]`. */
  name?: string;
  /** Submitted date format: 'ad' (default) or 'bs', both 'YYYY-MM-DD'. */
  valueFormat?: 'ad' | 'bs';
  /** Block form submission while empty (native form validation). */
  required?: boolean;
  id?: string;
  autoFocus?: boolean;
  'aria-label'?: string;
  /** Labels the field with other elements, e.g. a `<legend>` or a table header, instead of `label`. */
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  /** Extra class names for the field, e.g. a form library's input class. */
  inputClassName?: string;
  /** Mobile keyboard for the `editable` text input, e.g. 'numeric'. */
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
  /** Popover position relative to the input. Defaults to 'bottom-start'. */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'bottom' | 'top';
  /** Render the popover in `document.body`, e.g. to escape `overflow: hidden` parents. */
  portal?: boolean;
  /**
   * Element to render the popover into instead of `document.body`; setting it turns `portal` on.
   * Inside a modal dialog, pass the dialog's content element: a modal blocks clicks and focus outside itself.
   */
  portalContainer?: Element | null;
}

export type DatepickerSingleProps = DatepickerBaseProps &
  SingleSelection & {
    /**
     * Latin or Devanagari digits. Committed on Enter or when leaving the field.
     */
    editable?: boolean;
    /** Custom input text for the selected date, replacing the default two-calendar text. */
    formatValue?: (value: PatroDate) => string;
  };
export type DatepickerRangeProps = DatepickerBaseProps &
  RangeSelection & {
    /** Custom input text for the selected range. */
    formatValue?: (value: PatroDateRange) => string;
    editable?: never;
  };
export type DatepickerProps = DatepickerSingleProps | DatepickerRangeProps;

export interface ShownRange {
  start: string | null;
  end: string | null;
}

export interface FormField {
  name: string | undefined;
  value: string;
}

export interface ComboboxAriaOptions {
  isOpen: boolean;
  popoverId: string;
  invalid: boolean;
  required: boolean;
  label: string | undefined;
  labelId: string;
  ariaLabel: string | undefined;
  ariaLabelledBy: string | undefined;
  ariaDescribedBy: string | undefined;
  fallbackLabel: string;
}

export interface UsePopoverOptions {
  open: boolean | undefined;
  defaultOpen: boolean;
  onOpenChange: ((open: boolean) => void) | undefined;
  disabled: boolean;
  readOnly: boolean;
  placement: NonNullable<DatepickerBaseProps['placement']>;
  portal: boolean;
}

export interface UseTypedDateOptions {
  calendar: CalendarSystem;
  shownAdDate: string | null;
  minDate: DateInput | undefined;
  maxDate: DateInput | undefined;
  isDateDisabled: ((date: PatroDate) => boolean) | undefined;
  commit: (next: PatroDate | null) => void;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  openFromKeyboard: () => void;
  onBlur: ((event: FocusEvent<HTMLElement>) => void) | undefined;
}

export interface ComboboxAriaProps {
  'aria-haspopup': 'dialog';
  'aria-expanded': boolean;
  'aria-controls': string | undefined;
  'aria-invalid': true | undefined;
  'aria-required': true | undefined;
  'aria-label': string | undefined;
  'aria-labelledby': string | undefined;
  'aria-describedby': string | undefined;
}

export interface PopoverControls {
  isOpen: boolean;
  onOpen: (fromKeyboard: boolean) => void;
  onToggle: (fromKeyboard: boolean) => void;
  onClose: () => void;
}

export interface FieldValueProps {
  calendar: CalendarSystem;
  display: DisplayOptions;
  isRange: boolean;
  shownAdDate: string | null;
  shownRange: ShownRange | null;
  formatValue: DatepickerSingleProps['formatValue'] | DatepickerRangeProps['formatValue'];
  placeholder: string | undefined;
}

export interface ComboboxFieldProps extends PopoverControls {
  fieldRef: (node: HTMLDivElement | null) => void;
  id: string;
  aria: ComboboxAriaProps;
  attributes: DataAttributes;
  className: string | undefined;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  clearable: boolean;
  onFocus: ((event: FocusEvent<HTMLElement>) => void) | undefined;
  onBlur: ((event: FocusEvent<HTMLElement>) => void) | undefined;
  children: ReactNode;
}

export interface EditableFieldProps extends PopoverControls {
  anchorRef: (node: HTMLDivElement | null) => void;
  inputRef: (node: HTMLElement | null) => void;
  id: string;
  aria: ComboboxAriaProps;
  attributes: DataAttributes;
  className: string | undefined;
  inputMode: DatepickerBaseProps['inputMode'];
  popoverId: string;
  toggleLabel: string;
  text: string;
  placeholder: string;
  secondaryText: string;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  clearable: boolean;
  onTextChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onTextKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onTextBlur: (event: FocusEvent<HTMLInputElement>) => void;
  onFocus: ((event: FocusEvent<HTMLElement>) => void) | undefined;
}

export interface UseDatepickerValueOptions {
  isRange: boolean;
  value: DateInput | DateRangeInput | null | undefined;
  defaultValue: DateInput | DateRangeInput | null | undefined;
  onChange: DatepickerSingleProps['onChange'] | DatepickerRangeProps['onChange'];
}
