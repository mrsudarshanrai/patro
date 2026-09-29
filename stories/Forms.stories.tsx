import { useState, type FormEvent } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Datepicker, type DateRange } from '../index';
import { holidayClass, Readout } from './helpers';

const meta = {
  title: 'Templates/Forms',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const formDataText = (form: HTMLFormElement) =>
  Array.from(new FormData(form).entries())
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

const RegistrationForm = () => {
  const [dob, setDob] = useState<Date | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState('');
  const dobMissing = submitted && !dob;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (event.currentTarget.checkValidity()) setSent(formDataText(event.currentTarget));
  };

  return (
    <div className='story-row'>
      <form className='story-form' noValidate onSubmit={onSubmit}>
        <h2>Citizen registration</h2>
        <p>Dates in Bikram Sambat, submitted as BS.</p>

        <div className='story-field'>
          <label htmlFor='fullName'>Full name</label>
          <input id='fullName' name='fullName' required defaultValue='Sita Sharma' />
        </div>

        <div className='story-field'>
          <Datepicker
            label='Date of birth'
            calendar='BS'
            name='dob'
            valueFormat='bs'
            required
            value={dob}
            onChange={(picked) => setDob(picked?.date ?? null)}
            maxDate={new Date()}
            invalid={dobMissing}
            aria-describedby='dob-help'
            clearable
          />
          <span id='dob-help' className={dobMissing ? 'story-error' : 'story-hint'}>
            {dobMissing ? 'Date of birth is required.' : 'As written on your birth certificate.'}
          </span>
        </div>

        <div className='story-field'>
          <Datepicker
            label='Citizenship issued on'
            calendar='BS'
            name='issuedOn'
            valueFormat='bs'
            defaultValue={null}
            minDate={dob ?? undefined}
            maxDate={new Date()}
            placeholder='Optional'
          />
        </div>

        <div className='story-field'>
          <label htmlFor='district'>District</label>
          <select id='district' name='district' defaultValue='Kathmandu'>
            <option>Kathmandu</option>
            <option>Lalitpur</option>
            <option>Bhaktapur</option>
            <option>Kaski</option>
          </select>
        </div>

        <div className='story-actions'>
          <button type='submit' className='story-submit'>
            Register
          </button>
        </div>
      </form>
      <Readout label='Submitted FormData'>{sent || 'Submit the form to see the values.'}</Readout>
    </div>
  );
};

export const Registration: Story = {
  name: 'Registration (BS, required, validation)',
  render: () => <RegistrationForm />,
};

const NIGHTLY_RATE = 3500;
const DAY = 86400000;

const BookingForm = () => {
  const [stay, setStay] = useState<DateRange>({ start: null, end: null });
  const [sent, setSent] = useState('');
  const nights =
    stay.start && stay.end ? Math.round((stay.end.getTime() - stay.start.getTime()) / DAY) : 0;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (event.currentTarget.checkValidity()) setSent(formDataText(event.currentTarget));
    else event.currentTarget.reportValidity();
  };

  return (
    <div className='story-row'>
      <form className='story-form' onSubmit={onSubmit}>
        <h2>Book a room</h2>
        <p>Pick check-in, then check-out. Holidays are marked.</p>

        <div className='story-field'>
          <Datepicker
            mode='range'
            label='Stay'
            name='stay'
            required
            clearable
            value={stay}
            onChange={({ start, end }) =>
              setStay({ start: start?.date ?? null, end: end?.date ?? null })
            }
            minDate={new Date()}
            weekendDays={[6]}
            dayClassName={holidayClass}
            placeholder='Check-in – check-out'
          />
        </div>

        <div className='story-field'>
          <label htmlFor='guests'>Guests</label>
          <select id='guests' name='guests' defaultValue='2'>
            <option value='1'>1 guest</option>
            <option value='2'>2 guests</option>
            <option value='3'>3 guests</option>
          </select>
        </div>

        <div className='story-summary'>
          <span>
            {nights} night{nights === 1 ? '' : 's'} × NPR {NIGHTLY_RATE.toLocaleString()}
          </span>
          <strong>NPR {(nights * NIGHTLY_RATE).toLocaleString()}</strong>
        </div>

        <div className='story-actions'>
          <button type='submit' className='story-submit'>
            Book
          </button>
        </div>
      </form>
      <Readout label='Submitted FormData'>{sent || 'Pick a stay and book.'}</Readout>
    </div>
  );
};

export const Booking: Story = {
  name: 'Hotel booking (range, holidays, summary)',
  render: () => <BookingForm />,
};

const LeaveForm = () => {
  const [sent, setSent] = useState('');
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (event.currentTarget.checkValidity()) setSent(formDataText(event.currentTarget));
    else event.currentTarget.reportValidity();
  };

  return (
    <div className='story-row'>
      <form className='story-form' onSubmit={onSubmit}>
        <h2>बिदा निवेदन</h2>
        <p>बिदाको मिति छान्नुहोस्।</p>

        <div className='story-field'>
          <label htmlFor='employee'>कर्मचारीको नाम</label>
          <input id='employee' name='employee' required defaultValue='राम बहादुर' />
        </div>

        <div className='story-field'>
          <Datepicker
            mode='range'
            calendar='BS'
            label='बिदा अवधि'
            name='leave'
            valueFormat='bs'
            required
            minDate={new Date()}
            weekendDays={[6]}
            isDateDisabled={({ date }) => date.getDay() === 6}
            dayClassName={holidayClass}
            showTodayButton
          />
          <span className='story-hint'>शनिबार छान्न मिल्दैन।</span>
        </div>

        <div className='story-field'>
          <label htmlFor='reason'>कारण</label>
          <select id='reason' name='reason' defaultValue='चाडपर्व'>
            <option>चाडपर्व</option>
            <option>बिरामी</option>
            <option>व्यक्तिगत</option>
          </select>
        </div>

        <div className='story-actions'>
          <button type='submit' className='story-submit'>
            पेस गर्नुहोस्
          </button>
        </div>
      </form>
      <Readout label='Submitted FormData'>{sent || 'फारम पेस गर्नुहोस्।'}</Readout>
    </div>
  );
};

export const LeaveApplication: Story = {
  name: 'Leave application (Nepali, BS range)',
  render: () => <LeaveForm />,
};
