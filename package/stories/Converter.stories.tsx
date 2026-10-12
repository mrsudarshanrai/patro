import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ad2Bs, bs2Ad, isValidAdDate, isValidBsDate } from '../index';
import { Readout } from './helpers';

const meta = {
  title: 'Utilities/Date converter',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const convert = (fn: (date: string) => string, date: string) => {
  try {
    return fn(date);
  } catch (error) {
    return `⚠ ${(error as Error).message}`;
  }
};

const ConverterDemo = () => {
  const [ad, setAd] = useState('2026-10-29');
  const [bs, setBs] = useState('2083-07-12');
  return (
    <div className='story-form'>
      <h2>ad2Bs / bs2Ad</h2>
      <p>
        Both take and return <code>YYYY-MM-DD</code>, in Latin or Devanagari digits, and throw for
        anything else. Supported: AD 1921-04-13 – 2043-04-14. Also exported from{' '}
        <code>patrojs/utils</code> for server code.
      </p>

      <div className='story-field'>
        <label htmlFor='ad'>AD date</label>
        <input id='ad' type='date' value={ad} onChange={(event) => setAd(event.target.value)} />
        <Readout label={`ad2Bs('${ad}')`}>{convert(ad2Bs, ad)}</Readout>
        <Readout label={`isValidAdDate('${ad}')`}>{String(isValidAdDate(ad))}</Readout>
      </div>

      <div className='story-field'>
        <label htmlFor='bs'>BS date</label>
        <input id='bs' value={bs} onChange={(event) => setBs(event.target.value)} />
        <Readout label={`bs2Ad('${bs}')`}>{convert(bs2Ad, bs)}</Readout>
        <Readout label={`isValidBsDate('${bs}')`}>{String(isValidBsDate(bs))}</Readout>
      </div>
    </div>
  );
};

export const Converter: Story = {
  render: () => <ConverterDemo />,
};
