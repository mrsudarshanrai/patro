import { ad2Bs, datePartsIn, DisplayOptions, formatDate, languageOf } from '../utils';
import type { CalendarSystem } from '../types/public';
import type {
  ComboboxAriaOptions,
  ComboboxAriaProps,
  FormField,
  ShownRange,
} from './DatepickerType';

const DEFAULT_PLACEHOLDER = {
  single: { en: 'Select a date', ne: 'मिति छान्नुहोस्' },
  range: { en: 'Select dates', ne: 'मितिहरू छान्नुहोस्' },
};

const defaultPlaceholder = (isRange: boolean, calendar: CalendarSystem, display: DisplayOptions) =>
  DEFAULT_PLACEHOLDER[isRange ? 'range' : 'single'][languageOf(calendar, display)];

const rangeText = (range: ShownRange, calendar: CalendarSystem, display: DisplayOptions) => {
  if (!range.start) return null;
  if (!range.end) return `${formatDate(range.start, calendar, display)} – …`;
  const [startYear] = datePartsIn(range.start, calendar);
  const [endYear] = datePartsIn(range.end, calendar);
  const start = formatDate(range.start, calendar, display, {
    short: true,
    withYear: startYear !== endYear,
  });
  return `${start} – ${formatDate(range.end, calendar, display, { short: true })}`;
};

const formFields = (
  name: string | undefined,
  shown: { range: ShownRange | null; adDate: string | null },
  valueFormat: 'ad' | 'bs',
): FormField[] => {
  const submitted = (adDate: string | null) =>
    adDate ? (valueFormat === 'bs' ? ad2Bs(adDate) : adDate) : '';
  return shown.range
    ? [
        { name: name && `${name}[start]`, value: submitted(shown.range.start) },
        { name: name && `${name}[end]`, value: submitted(shown.range.end) },
      ]
    : [{ name, value: submitted(shown.adDate) }];
};

const comboboxAria = ({
  isOpen,
  popoverId,
  invalid,
  required,
  label,
  labelId,
  ariaLabel,
  ariaDescribedBy,
  fallbackLabel,
}: ComboboxAriaOptions): ComboboxAriaProps => ({
  'aria-haspopup': 'dialog',
  'aria-expanded': isOpen,
  'aria-controls': isOpen ? popoverId : undefined,
  'aria-invalid': invalid || undefined,
  'aria-required': required || undefined,
  'aria-label': ariaLabel ?? (label ? undefined : fallbackLabel),
  'aria-labelledby': !ariaLabel && label ? labelId : undefined,
  'aria-describedby': ariaDescribedBy,
});

export { defaultPlaceholder, rangeText, formFields, comboboxAria };
