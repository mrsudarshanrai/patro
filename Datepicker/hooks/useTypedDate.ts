import { ChangeEvent, FocusEvent, KeyboardEvent, useState } from 'react';
import { parseInputDate, toAdDateString, toPatroDate } from '../../utils';
import type { UseTypedDateOptions } from '../DatepickerType';

/**
 * Typing a date into an `editable` Datepicker. `draft` is the text while it differs from the
 * value; it's committed on Enter or blur, marked invalid on Enter if it isn't an allowed date,
 * and put back to the value on blur or Escape.
 */
const useTypedDate = ({
  calendar,
  shownAdDate,
  minDate,
  maxDate,
  isDateDisabled,
  commit,
  isOpen,
  setOpen,
  openFromKeyboard,
  onBlur,
}: UseTypedDateOptions) => {
  const [draft, setDraft] = useState<string | null>(null);
  const [typedInvalid, setTypedInvalid] = useState(false);

  const allowed = (adDate: string) =>
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
    if (typed && !(adDate && allowed(adDate))) return false;
    if (adDate !== shownAdDate) commit(adDate ? toPatroDate(adDate) : null);
    resetDraft();
    return true;
  };

  const onTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDraft(event.target.value);
    setTypedInvalid(false);
  };

  const onTextKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (commitDraft()) setOpen(false);
      else setTypedInvalid(true);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      openFromKeyboard();
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

  return { draft, typedInvalid, onTextChange, onTextKeyDown, onTextBlur };
};

export { useTypedDate };
