import {
  FocusEvent,
  forwardRef,
  KeyboardEvent,
  ReactElement,
  RefAttributes,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import { Calendar } from '../Calendar';
import { ICalendar } from '../Calendar/types';
import {
  CalendarProps,
  DatepickerProps,
  DatepickerRangeProps,
  DatepickerSingleProps,
  DateRange,
  PatroDate,
  PatroDateRange,
  RangeSelection,
  SingleSelection,
} from '../types/public';
import {
  ad2Bs,
  formatDate,
  labelsFor,
  languageOf,
  otherSystem,
  datePartsIn,
  formatInputDate,
  parseInputDate,
  supportedAdDate,
  supportedAdRange,
  toAdDateString,
  toPatroDate,
} from '../utils';
import { icons } from './icons';
import { useIsClient } from '../hooks/useToday';

const DEFAULT_PLACEHOLDER = {
  single: { en: 'Select a date', ne: 'मिति छान्नुहोस्' },
  range: { en: 'Select dates', ne: 'मितिहरू छान्नुहोस्' },
};
const EMPTY_RANGE: DateRange = { start: null, end: null };

const DatepickerComponent = forwardRef<HTMLElement, DatepickerProps>(
  function Datepicker(props, ref) {
    const {
      mode,
      value,
      defaultValue,
      onChange,
      presets,
      calendar = ICalendar.CalendarTypeEnum.AD,
      label,
      placeholder,
      theme,
      locale,
      numerals,
      formatValue,
      editable = false,
      disabled = false,
      readOnly = false,
      invalid = false,
      closeOnSelect = true,
      open,
      defaultOpen = false,
      onOpenChange,
      clearable = false,
      name,
      valueFormat = 'ad',
      required = false,
      id,
      autoFocus = false,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      onFocus,
      onBlur,
      placement = 'bottom-start',
      portal = false,
      className,
      style,
      ...calendarProps
    } = props;
    const text = labelsFor(calendar, { locale, numerals }, props.labels);
    const generatedId = useId();
    const isClient = useIsClient();
    const inputId = id ?? generatedId;
    const labelId = `${inputId}-label`;
    const popoverId = `${inputId}-popover`;

    const isRange = mode === 'range';
    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState<Date | DateRange | null>(() =>
      defaultValue !== undefined ? defaultValue : isRange ? EMPTY_RANGE : null,
    );
    const currentValue = isControlled ? value : uncontrolledValue;
    const selectedRange = isRange ? ((currentValue as DateRange | null) ?? EMPTY_RANGE) : null;
    const selectedDate = selectedRange ? null : (currentValue as Date | null);

    const isOpenControlled = open !== undefined;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const isOpen = !disabled && !readOnly && (isOpenControlled ? open : uncontrolledOpen);

    // The focusable field: the combobox div, or the text input when editable.
    const [inputRef, setInputRef] = useState<HTMLElement | null>(null);
    // The field's box, which the popover is placed against.
    const [anchorRef, setAnchorRef] = useState<HTMLDivElement | null>(null);
    const [popperRef, setPopperRef] = useState<HTMLDivElement | null>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    // Keyboard users land in the day grid; mouse users keep focus where they clicked.
    const [focusGrid, setFocusGrid] = useState(false);

    const shownAdDate = supportedAdDate(selectedDate);
    const shownRange = selectedRange && supportedAdRange(selectedRange);
    const display = { locale, numerals };

    const setInputNode = useCallback(
      (node: HTMLElement | null) => {
        setInputRef(node);
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );
    const setInputAndAnchor = useCallback(
      (node: HTMLDivElement | null) => {
        setInputNode(node);
        setAnchorRef(node);
      },
      [setInputNode],
    );

    const setOpen = useCallback(
      (next: boolean) => {
        if (next === isOpen || (next && (disabled || readOnly))) return;
        if (!isOpenControlled) setUncontrolledOpen(next);
        onOpenChange?.(next);
      },
      [isOpen, disabled, readOnly, isOpenControlled, onOpenChange],
    );

    useEffect(() => {
      if (autoFocus) inputRef?.focus();
    }, [autoFocus, inputRef]);

    useEffect(() => {
      if (!isOpen) return;
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (popperRef?.contains(target) || anchorRef?.contains(target)) return;
        setOpen(false);
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, anchorRef, popperRef, setOpen]);

    // autoUpdate re-places the popover on scroll, resize and layout shifts, not just on open.
    useEffect(() => {
      if (!anchorRef || !popperRef || !isOpen) return;
      return autoUpdate(anchorRef, popperRef, () => {
        computePosition(anchorRef, popperRef, {
          placement,
          strategy: portal ? 'fixed' : 'absolute',
          middleware: [offset(6), flip(), shift({ padding: 8 })],
        }).then(({ x, y }) => {
          Object.assign(popperRef.style, { left: `${x}px`, top: `${y}px`, opacity: '1' });
        });
      });
    }, [isOpen, anchorRef, popperRef, placement, portal]);

    const commit = (next: PatroDate | null) => {
      if (!isControlled) setUncontrolledValue(next?.date ?? null);
      (onChange as SingleSelection['onChange'])?.(next);
    };

    const commitRange = (next: PatroDateRange) => {
      if (!isControlled) {
        setUncontrolledValue({ start: next.start?.date ?? null, end: next.end?.date ?? null });
      }
      (onChange as RangeSelection['onChange'])?.(next);
    };

    const close = () => {
      if (!closeOnSelect) return;
      setOpen(false);
      inputRef?.focus();
    };

    const onSelect = (selected: PatroDate | null) => {
      commit(selected);
      close();
    };

    const onSelectRange = (selected: PatroDateRange) => {
      commitRange(selected);
      if (selected.end) close();
    };

    const onClear = () => {
      if (isRange) commitRange({ start: null, end: null });
      else commit(null);
      inputRef?.focus();
    };

    const onInputKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setFocusGrid(!isOpen);
        setOpen(!isOpen);
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setFocusGrid(true);
        setOpen(true);
      }
    };

    const onInputClick = () => {
      setFocusGrid(false);
      setOpen(!isOpen);
    };

    // Tabbing out of the picker closes it; focus lost to nowhere (e.g. switching windows) doesn't.
    // React bubbles blur out of a portal, so this also sees the portalled popover.
    const onFocusLeave = (event: FocusEvent<HTMLDivElement>) => {
      const next = event.relatedTarget as Node | null;
      if (!isOpen || !next) return;
      if (rootRef.current?.contains(next) || popperRef?.contains(next)) return;
      setOpen(false);
    };

    // Typing (editable, single mode). `draft` is the text while it differs from the value.
    const isEditable = editable && !isRange;
    const [draft, setDraft] = useState<string | null>(null);
    const [typedInvalid, setTypedInvalid] = useState(false);
    const { minDate, maxDate, isDateDisabled } = calendarProps;
    const typedAllowed = (adDate: string) =>
      (!minDate || adDate >= toAdDateString(minDate)) &&
      (!maxDate || adDate <= toAdDateString(maxDate)) &&
      !isDateDisabled?.(toPatroDate(adDate));

    const resetDraft = () => {
      setDraft(null);
      setTypedInvalid(false);
    };

    // Commits the typed text (empty clears); false if it isn't an allowed date.
    const commitDraft = () => {
      if (draft === null) return true;
      const typed = draft.trim();
      const adDate = typed ? parseInputDate(typed, calendar) : null;
      if (typed && !(adDate && typedAllowed(adDate))) return false;
      if (adDate !== shownAdDate) commit(adDate ? toPatroDate(adDate) : null);
      resetDraft();
      return true;
    };

    const onTextKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (commitDraft()) setOpen(false);
        else setTypedInvalid(true);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setFocusGrid(true);
        setOpen(true);
      } else if (event.key === 'Escape') {
        if (isOpen) setOpen(false);
        else resetDraft();
      }
    };

    // Leaving with text that isn't a date puts the last value back.
    const onTextBlur = (event: FocusEvent<HTMLInputElement>) => {
      if (!commitDraft()) resetDraft();
      onBlur?.(event);
    };

    const onPopperKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      inputRef?.focus();
    };

    const hasValue = shownRange ? !!shownRange.start : !!shownAdDate;
    const showClear = clearable && hasValue && !disabled && !readOnly;
    const submitted = (adDate: string | null) =>
      adDate ? (valueFormat === 'bs' ? ad2Bs(adDate) : adDate) : '';
    const formFields = shownRange
      ? [
          { name: name && `${name}[start]`, value: submitted(shownRange.start) },
          { name: name && `${name}[end]`, value: submitted(shownRange.end) },
        ]
      : [{ name, value: submitted(shownAdDate) }];

    const rangeText = (range: { start: string | null; end: string | null }) => {
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

    const calendarSelection = (
      shownRange
        ? { mode: 'range', value: selectedRange, onChange: onSelectRange, presets }
        : { value: selectedDate, onChange: onSelect, presets }
    ) as Pick<CalendarProps, 'mode' | 'value' | 'onChange' | 'presets'>;

    const popover = isOpen && (
      <div
        ref={setPopperRef}
        id={popoverId}
        role='dialog'
        aria-label={text.chooseDate}
        className='_patro_datepicker_popper'
        // Transparent, not hidden, until placed: a keyboard-opened grid must be able to take focus.
        style={{ position: portal ? 'fixed' : 'absolute', left: 0, top: 0, opacity: 0 }}
        onKeyDown={onPopperKeyDown}
      >
        <Calendar
          {...calendarProps}
          {...(calendarSelection as CalendarProps)}
          calendar={calendar}
          locale={locale}
          numerals={numerals}
          theme={theme}
          autoFocus={focusGrid}
        />
      </div>
    );

    return (
      <div
        ref={rootRef}
        onBlur={onFocusLeave}
        className={['_patro_datepicker _patro', className].filter(Boolean).join(' ')}
        style={style}
        data-calendar-type={calendar}
        data-theme={theme}
      >
        {label && (
          <div id={labelId} className='_patro_datepicker_label'>
            {label}
          </div>
        )}
        <div className='_patro_datepicker_control'>
          {isEditable ? (
            <div
              ref={setAnchorRef}
              className={[
                '_patro_datepicker_input',
                '_patro_datepicker_input_editable',
                isOpen && '_patro_datepicker_input_open',
                (invalid || typedInvalid) && '_patro_datepicker_input_invalid',
                showClear && '_patro_datepicker_input_clearable',
                disabled && '_patro_datepicker_input_disabled',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <input
                ref={setInputNode}
                id={inputId}
                className='_patro_datepicker_input_text'
                type='text'
                role='combobox'
                autoComplete='off'
                spellCheck={false}
                value={
                  draft ?? (shownAdDate ? formatInputDate(shownAdDate, calendar, display) : '')
                }
                placeholder={placeholder ?? 'YYYY-MM-DD'}
                disabled={disabled}
                readOnly={readOnly}
                aria-haspopup='dialog'
                aria-expanded={isOpen}
                aria-controls={isOpen ? popoverId : undefined}
                aria-invalid={invalid || typedInvalid || undefined}
                aria-required={required || undefined}
                aria-label={ariaLabel ?? (label ? undefined : text.chooseDate)}
                aria-labelledby={!ariaLabel && label ? labelId : undefined}
                aria-describedby={ariaDescribedBy}
                onChange={(event) => {
                  setDraft(event.target.value);
                  setTypedInvalid(false);
                }}
                onClick={() => {
                  setFocusGrid(false);
                  setOpen(true);
                }}
                onKeyDown={onTextKeyDown}
                onFocus={onFocus}
                onBlur={onTextBlur}
              />
              {/* Always rendered: it fills the space that keeps the buttons at the end. */}
              <span className='_patro_datepicker_input_secondary'>
                {shownAdDate && draft === null
                  ? formatDate(shownAdDate, otherSystem(calendar), display, { short: true })
                  : ''}
              </span>
              {/* Out of the tab order: ArrowDown on the field opens the popover too (APG). */}
              <button
                type='button'
                className='_patro_datepicker_input_icon _patro_datepicker_toggle'
                tabIndex={-1}
                aria-label={text.chooseDate}
                aria-haspopup='dialog'
                aria-expanded={isOpen}
                aria-controls={isOpen ? popoverId : undefined}
                disabled={disabled || readOnly}
                onClick={() => {
                  setFocusGrid(false);
                  setOpen(!isOpen);
                }}
              >
                {icons.calendarIcon}
              </button>
            </div>
          ) : (
            <div
              ref={setInputAndAnchor}
              id={inputId}
              className={[
                '_patro_datepicker_input',
                invalid && '_patro_datepicker_input_invalid',
                showClear && '_patro_datepicker_input_clearable',
              ]
                .filter(Boolean)
                .join(' ')}
              // Select-only combobox (WAI-ARIA APG): unlike a button it can be required and read-only.
              role='combobox'
              tabIndex={disabled ? -1 : 0}
              aria-haspopup='dialog'
              aria-expanded={isOpen}
              aria-controls={isOpen ? popoverId : undefined}
              aria-disabled={disabled || undefined}
              aria-readonly={readOnly || undefined}
              aria-invalid={invalid || undefined}
              aria-required={required || undefined}
              aria-label={ariaLabel ?? (label ? undefined : text.chooseDate)}
              aria-labelledby={!ariaLabel && label ? labelId : undefined}
              aria-describedby={ariaDescribedBy}
              onClick={onInputClick}
              onKeyDown={onInputKeyDown}
              onFocus={onFocus}
              onBlur={onBlur}
            >
              {shownRange && shownRange.start ? (
                <span className='_patro_datepicker_input_primary _patro_datepicker_input_custom'>
                  {formatValue
                    ? (formatValue as (value: PatroDateRange) => string)({
                        start: toPatroDate(shownRange.start),
                        end: shownRange.end ? toPatroDate(shownRange.end) : null,
                      })
                    : rangeText(shownRange)}
                </span>
              ) : shownAdDate && formatValue ? (
                <span className='_patro_datepicker_input_primary _patro_datepicker_input_custom'>
                  {(formatValue as (value: PatroDate) => string)(toPatroDate(shownAdDate))}
                </span>
              ) : shownAdDate ? (
                <>
                  <span className='_patro_datepicker_input_primary'>
                    {formatDate(shownAdDate, calendar, display)}
                  </span>
                  <span className='_patro_datepicker_input_secondary'>
                    {calendar === 'AD'
                      ? formatDate(shownAdDate, 'BS', display, { withYear: false })
                      : formatDate(shownAdDate, otherSystem(calendar), display, { short: true })}
                  </span>
                </>
              ) : (
                <span className='_patro_datepicker_input_placeholder'>
                  {placeholder ??
                    DEFAULT_PLACEHOLDER[isRange ? 'range' : 'single'][
                      languageOf(calendar, display)
                    ]}
                </span>
              )}
              <span className='_patro_datepicker_input_icon'>{icons.calendarIcon}</span>
            </div>
          )}
          {showClear && (
            <button
              type='button'
              className='_patro_datepicker_clear'
              aria-label={text.clear}
              onClick={onClear}
            >
              {icons.clearIcon}
            </button>
          )}
          {(name || required) &&
            formFields.map((field, index) => (
              // Real input so native forms submit and validate the date; focus goes back to the picker.
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
                onFocus={() => inputRef?.focus()}
              />
            ))}
        </div>
        {/* No document.body while server rendering; the portal appears after hydration. */}
        {popover && (portal ? isClient && createPortal(popover, document.body) : popover)}
      </div>
    );
  },
);

// Overloads so `onChange` etc. are typed from `mode` even without strictNullChecks.
type DatepickerOverloads = {
  (props: DatepickerRangeProps & RefAttributes<HTMLElement>): ReactElement;
  (props: DatepickerSingleProps & RefAttributes<HTMLElement>): ReactElement;
  (props: DatepickerProps & RefAttributes<HTMLElement>): ReactElement;
};

const Datepicker = DatepickerComponent as unknown as DatepickerOverloads;

export { Datepicker };
