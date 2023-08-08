import { useEffect, useState } from 'react';
import { Calendar } from '../Calendar';
import { createPopper } from '@popperjs/core';
import { Datepicker as DatepickerType } from './types';

const Datepicker = (props: DatepickerType.Props) => {
  const { ...rest } = props;
  const [isPopperVisible, setIsPopperVisible] = useState(false);
  const [inputRef, setInputRef] = useState(null);
  const [popperRef, setPopperRef] = useState(null);

  const togglePopper = () => {
    setIsPopperVisible(!isPopperVisible);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      inputRef &&
      popperRef &&
      !popperRef.contains(event.target) &&
      !inputRef.contains(event.target)
    ) {
      setIsPopperVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popperRef, inputRef]);

  useEffect(() => {
    if (inputRef && popperRef && isPopperVisible) {
      createPopper(inputRef, popperRef);
    }
  }, [isPopperVisible, inputRef, popperRef]);

  return (
    <div>
      <div>
        <input ref={(ref) => setInputRef(ref)} onClick={togglePopper} placeholder='Click me' />
        {isPopperVisible && (
          <div ref={(ref) => setPopperRef(ref)} className='popper-content'>
            <Calendar showExtra={true} {...rest} />
          </div>
        )}
      </div>
    </div>
  );
};

export { Datepicker };
