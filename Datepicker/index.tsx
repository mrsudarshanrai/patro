import {
  forwardRef,
  KeyboardEvent,
  ReactElement,
  RefAttributes,
  useCallback,
  useEffect,
  useId,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Calendar } from '../Calendar';
import { ICalendar } from '../Calendar/types';
import {
  CalendarProps,
  DateRange,
  PatroDate,
  PatroDateRange,
  RangeSelection,
  SingleSelection,
} from '../types/public';
import {
  formatDate,
  labelsFor,
  otherSystem,
  formatInputDate,
  supportedAdDate,
  supportedAdRange,
  toPatroDate,
  EMPTY_RANGE,
} from '../utils';
import { icons } from '../shared/icons';
import type {
  DatepickerProps,
  DatepickerRangeProps,
  DatepickerSingleProps,
} from './DatepickerType';
import { useIsClient } from '../hooks/useToday';
import { useControllableValue } from '../hooks/useControllableValue';
import { usePopover } from './hooks/usePopover';
import { useTypedDate } from './hooks/useTypedDate';
import { comboboxAria, defaultPlaceholder, formFields, rangeText } from './utils';

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
    const [currentValue, setValue] = useControllableValue<Date | DateRange | null>(value, () =>
      defaultValue !== undefined ? defaultValue : isRange ? EMPTY_RANGE : null,
    );
    const selectedRange = isRange ? ((currentValue as DateRange | null) ?? EMPTY_RANGE) : null;
    const selectedDate = selectedRange ? null : (currentValue as Date | null);

    const { isOpen, setOpen, setAnchor, setPopover, rootRef, onFocusLeave } = usePopover({
      open,
      defaultOpen,
      onOpenChange,
      disabled,
      readOnly,
      placement,
      portal,
    });

    // The focusable field: the combobox div, or the text input when editable.
    const [inputRef, setInputRef] = useState<HTMLElement | null>(null);
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
        setAnchor(node);
      },
      [setInputNode, setAnchor],
    );

    useEffect(() => {
      if (autoFocus) inputRef?.focus();
    }, [autoFocus, inputRef]);

    const commit = (next: PatroDate | null) => {
      setValue(next?.date ?? null);
      (onChange as SingleSelection['onChange'])?.(next);
    };

    const commitRange = (next: PatroDateRange) => {
      setValue({ start: next.start?.date ?? null, end: next.end?.date ?? null });
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

    const isEditable = editable && !isRange;
    const openFromKeyboard = () => {
      setFocusGrid(true);
      setOpen(true);
    };
    const { draft, typedInvalid, onTextChange, onTextKeyDown, onTextBlur } = useTypedDate({
      calendar,
      shownAdDate,
      minDate: calendarProps.minDate,
      maxDate: calendarProps.maxDate,
      isDateDisabled: calendarProps.isDateDisabled,
      commit,
      isOpen,
      setOpen,
      openFromKeyboard,
      onBlur,
    });

    const onPopperKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      inputRef?.focus();
    };

    const hasValue = shownRange ? !!shownRange.start : !!shownAdDate;
    const showClear = clearable && hasValue && !disabled && !readOnly;
    const fields = formFields(name, { range: shownRange, adDate: shownAdDate }, valueFormat);
    const aria = {
      isOpen,
      popoverId,
      required,
      label,
      labelId,
      ariaLabel,
      ariaDescribedBy,
      fallbackLabel: text.chooseDate,
    };

    const calendarSelection = (
      shownRange
        ? { mode: 'range', value: selectedRange, onChange: onSelectRange, presets }
        : { value: selectedDate, onChange: onSelect, presets }
    ) as Pick<CalendarProps, 'mode' | 'value' | 'onChange' | 'presets'>;

    const popover = isOpen && (
      <div
        ref={setPopover}
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
              ref={setAnchor}
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
                {...comboboxAria({ ...aria, invalid: invalid || typedInvalid })}
                onChange={onTextChange}
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
              {...comboboxAria({ ...aria, invalid })}
              aria-disabled={disabled || undefined}
              aria-readonly={readOnly || undefined}
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
                    : rangeText(shownRange, calendar, display)}
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
                  {placeholder ?? defaultPlaceholder(isRange, calendar, display)}
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
            fields.map((field, index) => (
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
