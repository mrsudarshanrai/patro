import { forwardRef, ReactElement, RefAttributes, useEffect, useId, useState } from 'react';
import { Calendar } from '../Calendar';
import type { CalendarProps } from '../Calendar/CalendarType';
import { PatroDate, PatroDateRange } from '../types/public';
import { formatDate, formatInputDate, labelsFor, languageOf, otherSystem } from '../utils';
import type {
  DatepickerProps,
  DatepickerRangeProps,
  DatepickerSingleProps,
} from './DatepickerType';
import { useDatepickerValue } from './hooks/useDatepickerValue';
import { useFieldRef } from './hooks/useFieldRef';
import { usePopover } from './hooks/usePopover';
import { useTypedDate } from './hooks/useTypedDate';
import { comboboxAria, formFields } from './utils';
import { ClearButton } from './components/ClearButton';
import { ComboboxField } from './components/ComboboxField';
import { EditableField } from './components/EditableField';
import { FieldValue } from './components/FieldValue';
import { NativeInputs } from './components/NativeInputs';
import { Popover } from './components/Popover';

const DatepickerComponent = forwardRef<HTMLElement, DatepickerProps>(
  function Datepicker(props, ref) {
    const {
      mode,
      value,
      defaultValue,
      onChange,
      presets,
      calendar = 'AD',
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
    const inputId = id ?? generatedId;
    const labelId = `${inputId}-label`;
    const popoverId = `${inputId}-popover`;
    const display = { locale, numerals };

    const isRange = mode === 'range';
    const isEditable = editable && !isRange;
    const { selectedRange, selectedDate, shownAdDate, shownRange, hasValue, commit, commitRange } =
      useDatepickerValue({ isRange, value, defaultValue, onChange });

    const { isOpen, setOpen, setAnchor, setPopover, rootRef, onFocusLeave } = usePopover({
      open,
      defaultOpen,
      onOpenChange,
      disabled,
      readOnly,
      placement,
      portal,
    });
    const [focusGrid, setFocusGrid] = useState(false);
    const popoverControls = {
      isOpen,
      onOpen: (fromKeyboard: boolean) => {
        setFocusGrid(fromKeyboard);
        setOpen(true);
      },
      onToggle: (fromKeyboard: boolean) => {
        setFocusGrid(fromKeyboard && !isOpen);
        setOpen(!isOpen);
      },
      onClose: () => setOpen(false),
    };

    const { field, setFieldNode, setFieldAndAnchor } = useFieldRef(ref, setAnchor);

    useEffect(() => {
      if (autoFocus) field?.focus();
    }, [autoFocus, field]);

    const close = () => {
      if (!closeOnSelect) return;
      setOpen(false);
      field?.focus();
    };

    const onClear = () => {
      if (isRange) commitRange({ start: null, end: null });
      else commit(null);
      field?.focus();
    };

    const typed = useTypedDate({
      calendar,
      shownAdDate,
      minDate: calendarProps.minDate,
      maxDate: calendarProps.maxDate,
      isDateDisabled: calendarProps.isDateDisabled,
      commit,
      isOpen,
      setOpen,
      openFromKeyboard: () => popoverControls.onOpen(true),
      onBlur,
    });

    const showClear = clearable && hasValue && !disabled && !readOnly;
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
        ? {
            mode: 'range',
            value: selectedRange,
            presets,
            onChange: (selected: PatroDateRange) => {
              commitRange(selected);
              if (selected.end) close();
            },
          }
        : {
            value: selectedDate,
            presets,
            onChange: (selected: PatroDate | null) => {
              commit(selected);
              close();
            },
          }
    ) as Pick<CalendarProps, 'mode' | 'value' | 'onChange' | 'presets'>;

    return (
      <div
        ref={rootRef}
        onBlur={onFocusLeave}
        className={['_patro_datepicker _patro', className].filter(Boolean).join(' ')}
        style={style}
        lang={languageOf(calendar, display)}
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
            <EditableField
              {...popoverControls}
              anchorRef={setAnchor}
              inputRef={setFieldNode}
              id={inputId}
              aria={comboboxAria({ ...aria, invalid: invalid || typed.typedInvalid })}
              popoverId={popoverId}
              toggleLabel={text.chooseDate}
              text={
                typed.draft ?? (shownAdDate ? formatInputDate(shownAdDate, calendar, display) : '')
              }
              placeholder={placeholder ?? 'YYYY-MM-DD'}
              secondaryText={
                shownAdDate && typed.draft === null
                  ? formatDate(shownAdDate, otherSystem(calendar), display, { short: true })
                  : ''
              }
              disabled={disabled}
              readOnly={readOnly}
              invalid={invalid || typed.typedInvalid}
              clearable={showClear}
              onTextChange={typed.onTextChange}
              onTextKeyDown={typed.onTextKeyDown}
              onTextBlur={typed.onTextBlur}
              onFocus={onFocus}
            />
          ) : (
            <ComboboxField
              {...popoverControls}
              fieldRef={setFieldAndAnchor}
              id={inputId}
              aria={comboboxAria({ ...aria, invalid })}
              disabled={disabled}
              readOnly={readOnly}
              invalid={invalid}
              clearable={showClear}
              onFocus={onFocus}
              onBlur={onBlur}
            >
              <FieldValue
                calendar={calendar}
                display={display}
                isRange={isRange}
                shownAdDate={shownAdDate}
                shownRange={shownRange}
                formatValue={formatValue}
                placeholder={placeholder}
              />
            </ComboboxField>
          )}
          {showClear && <ClearButton label={text.clear} onClear={onClear} />}
          {(name || required) && (
            <NativeInputs
              fields={formFields(name, { range: shownRange, adDate: shownAdDate }, valueFormat)}
              required={required}
              disabled={disabled}
              onFocus={() => field?.focus()}
            />
          )}
        </div>
        {isOpen && (
          <Popover
            popoverRef={setPopover}
            id={popoverId}
            label={text.chooseDate}
            portal={portal}
            onEscape={() => {
              setOpen(false);
              field?.focus();
            }}
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
          </Popover>
        )}
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
