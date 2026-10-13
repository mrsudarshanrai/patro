import type { ReactNode } from 'react';

/** The live part of an example: the demo, and beside it what it returned. */
export function Demo({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className={aside ? 'demo-body' : 'demo-body solo'}>
      <div className='demo-main'>{children}</div>
      {aside && <aside className='demo-aside'>{aside}</aside>}
    </div>
  );
}

/** Shows a value exactly as the component handed it over. */
export function Ledger({ title, entries, empty }: { title: string; entries: [string, ReactNode][]; empty?: string }) {
  return (
    <section className='ledger' aria-label={title} aria-live='polite'>
      <h2>{title}</h2>
      {entries.length === 0 ? (
        <p className='ledger-empty'>{empty ?? 'Nothing yet.'}</p>
      ) : (
        <dl>
          {entries.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

export const nf = new Intl.NumberFormat('en-IN');
