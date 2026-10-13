import { useCallback, useRef, useState, type CSSProperties } from 'react';
import { Datepicker, ad2Bs, formatBsDate, type PatroDate } from 'patrojs';
import { holidays, isPublicHoliday } from '../data/holidays';
import { Demo, Ledger } from '../shared';

interface Appointment {
  id: string;
  who: string;
  what: string;
  ad: string;
}

const initial: Appointment[] = [
  { id: 'a1', who: 'Dental clinic, Lakeside', what: 'Dental check-up', ad: '2026-10-21' },
  { id: 'a2', who: 'Ward office', what: 'Recommendation letter pickup', ad: '2026-11-04' },
  { id: 'a3', who: 'Transport management office', what: 'Bluebook renewal', ad: '2026-11-17' },
];

export default function Reschedule({ theme }: { theme: 'light' | 'dark' }) {
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [draft, setDraft] = useState<PatroDate | null>(null);
  const [container, setContainer] = useState<HTMLDialogElement | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const dialog = useRef<HTMLDialogElement | null>(null);
  const dialogRef = useCallback((el: HTMLDialogElement | null) => {
    dialog.current = el;
    setContainer(el);
  }, []);

  const open = (a: Appointment) => {
    setEditing(a);
    setDraft(null);
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();
  const save = () => {
    if (!editing || !draft) return;
    setItems((xs) => xs.map((x) => (x.id === editing.id ? { ...x, ad: draft.ad } : x)));
    setLog((l) => [`${editing.what}: ${editing.ad} → ${draft.ad}`, ...l].slice(0, 4));
    close();
  };

  return (
    <Demo
      aside={<Ledger title='Changes' empty='Reschedule an appointment to see it logged here.' entries={log.map((l, i) => [String(log.length - i), l])} />}
    >
      <ul className='appointments'>
        {items.map((a) => (
          <li key={a.id}>
            <div className='appt-date' aria-hidden='true'>
              <span className='appt-day'>{formatBsDate(ad2Bs(a.ad)).split(' ')[0]}</span>
              <span className='appt-month'>{formatBsDate(ad2Bs(a.ad)).split(' ').slice(1).join(' ')}</span>
            </div>
            <div className='appt-text'>
              <p className='appt-what'>{a.what}</p>
              <p className='help'>
                {a.who} · {formatBsDate(ad2Bs(a.ad), { locale: 'en', weekday: true })} · {a.ad}
              </p>
            </div>
            <button type='button' onClick={() => open(a)} aria-label={`Reschedule ${a.what}`}>
              Reschedule
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className='modal'
        aria-labelledby='modal-title'
        onClose={() => setEditing(null)}
      >
        <form
          method='dialog'
          className='form'
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <h2 id='modal-title'>Reschedule {editing?.what.toLowerCase()}</h2>
          <p className='help'>Currently {editing ? `${formatBsDate(ad2Bs(editing.ad), { locale: 'en', weekday: true })} (${editing.ad})` : ''}</p>
          <div className='field'>
            <Datepicker
              id='new-date'
              label='New date'
              theme={theme}
              portalContainer={container}
              minDate={tomorrow()}
              defaultMonth={editing?.ad}
              isDateDisabled={({ date, bs }) => date.getDay() === 6 || isPublicHoliday(bs)}
              dayLabel={({ bs }) => holidays[bs]?.en}
              value={draft?.date ?? null}
              onChange={setDraft}
              clearable
              style={{ '--patro-input-width': '100%' } as CSSProperties}
            />
          </div>
          <div className='actions'>
            <button type='submit' className='primary' disabled={!draft}>
              Save new date
            </button>
            <button type='button' onClick={close}>
              Cancel
            </button>
          </div>
        </form>
      </dialog>
    </Demo>
  );
}

function tomorrow() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
}
