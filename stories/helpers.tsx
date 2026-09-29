import type { ReactNode } from 'react';
import './stories.css';

// Storybook's date controls pass epoch numbers, not Dates.
export const toDate = (value: unknown) =>
  typeof value === 'number' ? new Date(value) : (value as Date | undefined);

// A few public holidays in BS 2083 (AD 2026-27), keyed by BS date.
export const HOLIDAYS: Record<string, string> = {
  '2083-06-25': 'Ghatasthapana',
  '2083-07-04': 'Vijaya Dashami',
  '2083-07-22': 'Laxmi Puja',
  '2083-07-24': 'Govardhan Puja',
  '2083-07-25': 'Bhai Tika',
  '2083-07-29': 'Chhath',
  '2083-10-01': 'Maghe Sankranti',
};

export const holidayClass = ({ bs }: { bs: string }) =>
  HOLIDAYS[bs] ? 'story-holiday' : undefined;

export const Readout = ({ label, children }: { label: string; children: ReactNode }) => (
  <pre className='story-readout'>
    <strong>{label}</strong>
    {'\n'}
    {children}
  </pre>
);

export const json = (value: unknown) =>
  JSON.stringify(value, (_, v) => (v instanceof Date ? `Date(${v.toDateString()})` : v), 2);
