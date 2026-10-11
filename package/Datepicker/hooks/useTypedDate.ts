import { ChangeEvent, FocusEvent, KeyboardEvent, useState } from 'react';
import { parseInputDate, toInputAdDate, toPatroDate } from '../../utils';
import type { UseTypedDateOptions } from '../DatepickerType';

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

  const minAdDate = toInputAdDate(minDate);
  const maxAdDate = toInputAdDate(maxDate);
  const allowed = (adDate: string) =>
    (!minAdDate || adDate >= minAdDate) &&
    (!maxAdDate || adDate <= maxAdDate) &&
    !isDateDisabled?.(toPatroDate(adDate));

  const resetDraft = () => {
    setDraft(null);
    setTypedInvalid(false);
  };

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

  const onTextBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (!commitDraft()) resetDraft();
    onBlur?.(event);
  };

  return { draft, typedInvalid, onTextChange, onTextKeyDown, onTextBlur };
};

export { useTypedDate };
