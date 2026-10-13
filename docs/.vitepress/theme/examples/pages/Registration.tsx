import { useState, type CSSProperties } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Datepicker, addBsYears, bsDaysBetween, formatBsDate, getBsToday, type PatroDate } from 'patrojs';
import { Demo, Ledger } from '../shared';

interface Values {
  fullName: string;
  district: string;
  dob: PatroDate | null;
}

const districts = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kaski', 'Morang', 'Chitwan', 'Rupandehi', 'Jhapa'];
const MIN_AGE = 16;

/** Whole years between a BS birth date and today, counted in BS. */
const ageInYears = (dobBs: string, todayBs: string) => {
  let years = Number(todayBs.slice(0, 4)) - Number(dobBs.slice(0, 4));
  if (todayBs.slice(5) < dobBs.slice(5)) years -= 1;
  return years;
};

export default function Registration({ theme }: { theme: 'light' | 'dark' }) {
  const todayBs = getBsToday();
  const [submitted, setSubmitted] = useState<Values | null>(null);
  const { control, register, handleSubmit, formState, reset } = useForm<Values>({
    defaultValues: { fullName: 'Sita Gurung', district: 'Kaski', dob: null },
  });
  const errors = formState.errors;

  return (
    <Demo
      aside={
        <Ledger
          title='Submitted to the server'
          empty='Submit the form to see the record it produces.'
          entries={
            submitted?.dob
              ? [
                  ['fullName', submitted.fullName],
                  ['district', submitted.district],
                  ['dob_bs', <code>{submitted.dob.bs}</code>],
                  ['dob_ad', <code>{submitted.dob.ad}</code>],
                  ['in words', formatBsDate(submitted.dob.bs, { weekday: true })],
                  ['age', `${ageInYears(submitted.dob.bs, todayBs)} years (${new Intl.NumberFormat('en-IN').format(bsDaysBetween(submitted.dob.bs, todayBs))} days)`],
                ]
              : []
          }
        />
      }
    >
      <form className='form' noValidate onSubmit={handleSubmit((v) => setSubmitted(v))} onReset={() => { reset(); setSubmitted(null); }}>
        <div className='field'>
          <label htmlFor='fullName'>Full name</label>
          <input id='fullName' autoComplete='name' {...register('fullName', { required: 'Enter your full name.' })} aria-invalid={!!errors.fullName} />
          {errors.fullName && <p className='error'>{errors.fullName.message}</p>}
        </div>
        <div className='field'>
          <label htmlFor='district'>Permanent district</label>
          <select id='district' {...register('district')}>
            {districts.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className='field'>
          <Controller
            name='dob'
            control={control}
            rules={{
              required: 'Enter your date of birth.',
              validate: (dob) => !dob || addBsYears(dob.bs, MIN_AGE) <= todayBs || `You must be at least ${MIN_AGE} years old in BS.`,
            }}
            render={({ field, fieldState }) => (
              <Datepicker
                ref={field.ref}
                id='dob'
                label='जन्म मिति (वि.सं.) · Date of birth'
                calendar='BS'
                theme={theme}
                editable
                clearable
                defaultMonth='2008-01-01'
                maxDate={new Date()}
                value={field.value?.date ?? null}
                onChange={field.onChange}
                onBlur={field.onBlur}
                invalid={!!fieldState.error}
                aria-describedby='dob-help dob-error'
                style={{ '--patro-input-width': '100%' } as CSSProperties}
              />
            )}
          />
          <p id='dob-help' className='help'>Type it as २०५७-०९-१५ or 2057/9/15, or pick it from the calendar.</p>
          <p id='dob-error' className='error' role='alert'>
            {errors.dob?.message}
          </p>
        </div>
        <div className='actions'>
          <button type='submit' className='primary'>
            Register
          </button>
          <button type='reset'>Start over</button>
        </div>
      </form>
    </Demo>
  );
}
