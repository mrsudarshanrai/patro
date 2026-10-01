import type { FocusEvent } from 'react';
import type {
  CalendarBaseProps,
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
  /**
   * Let people type the date as well, e.g. 2083-07-12 or 2083/7/12, in the displayed calendar and
   * Latin or Devanagari digits. Committed on Enter or when leaving the field. Single mode only.
   */
  editable?: boolean;
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
  'aria-describedby'?: string;
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
  /** Popover position relative to the input. Defaults to 'bottom-start'. */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'bottom' | 'top';
  /** Render the popover in `document.body`, e.g. to escape `overflow: hidden` parents. */
  portal?: boolean;
}

export type DatepickerSingleProps = DatepickerBaseProps &
  SingleSelection & {
    /** Custom input text for the selected date, replacing the default two-calendar text. */
    formatValue?: (value: PatroDate) => string;
  };
export type DatepickerRangeProps = DatepickerBaseProps &
  RangeSelection & {
    /** Custom input text for the selected range. */
    formatValue?: (value: PatroDateRange) => string;
  };
export type DatepickerProps = DatepickerSingleProps | DatepickerRangeProps;

/** AD dates ('YYYY-MM-DD') of the shown range, after dropping unsupported dates. */
export interface ShownRange {
  start: string | null;
  end: string | null;
}

/** A hidden native input that submits the date with a form. */
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
  ariaDescribedBy: string | undefined;
  /** Accessible name when there's neither `label` nor `aria-label`. */
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
