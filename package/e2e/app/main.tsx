import { ReactElement, useEffect, useState } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import * as RadixDialog from '@radix-ui/react-dialog';
import { Dialog as HeadlessDialog, DialogPanel } from '@headlessui/react';
import { Calendar, Datepicker, type DatepickerSingleProps } from '../../index';
import '../../scss/style.scss';

const params = new URLSearchParams(location.search);
const today = new Date(2026, 9, 29);

const Picker = (props: DatepickerSingleProps) => (
  <Datepicker label='Date' defaultOpen today={today} {...props} />
);

// ?container portals the popover into the dialog itself.
const DialogPicker = ({ container }: { container: Element | null }) => (
  <Picker {...(params.has('container') && { portalContainer: container })} />
);

const NativeDialog = () => {
  const [dialog, setDialog] = useState<HTMLDialogElement | null>(null);
  useEffect(() => dialog?.showModal(), [dialog]);
  return (
    <dialog id='dialog' ref={setDialog}>
      <DialogPicker container={dialog} />
    </dialog>
  );
};

const RadixHost = () => {
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  return (
    <RadixDialog.Root defaultOpen>
      <RadixDialog.Portal>
        <RadixDialog.Content id='dialog' ref={setContent} aria-describedby={undefined}>
          <RadixDialog.Title>Booking</RadixDialog.Title>
          <DialogPicker container={content} />
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};

const HeadlessHost = () => {
  const [open, setOpen] = useState(true);
  const [panel, setPanel] = useState<HTMLElement | null>(null);
  return (
    <HeadlessDialog open={open} onClose={() => setOpen(false)}>
      <DialogPanel id='dialog' ref={setPanel}>
        <DialogPicker container={panel} />
      </DialogPanel>
    </HeadlessDialog>
  );
};

const LayoutShift = () => {
  const [banner, setBanner] = useState(false);
  return (
    <div style={{ padding: 8 }}>
      <button type='button' id='shift' onClick={() => setBanner(true)}>
        Shift
      </button>
      {banner && <div style={{ height: 120 }}>banner</div>}
      <Picker />
    </div>
  );
};

const HostPage = () => (
  <div>
    <style>
      {`svg { width: 32px; height: 32px } header, p { background: rgb(255, 0, 0); margin: 40px }
        .column ._patro_datepicker { --patro-input-width: 100% }`}
    </style>
    <header>Site</header>
    <h1>Heading</h1>
    <strong>bold</strong>
    <div className='column' style={{ width: 600 }}>
      <Datepicker label='Date' today={today} />
    </div>
    <Calendar today={today} />
  </div>
);

const scenarios: Record<string, () => ReactElement> = {
  placement: () => (
    <div style={{ padding: '420px 0 0 350px' }}>
      <Datepicker
        label='Date'
        defaultOpen
        today={today}
        mode='range'
        numberOfMonths={2}
        placement={params.get('p') as DatepickerSingleProps['placement']}
      />
    </div>
  ),
  'right-edge': () => (
    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 8 }}>
      <Datepicker
        label='Date'
        defaultOpen
        today={today}
        mode='range'
        numberOfMonths={2}
        portal={params.has('portal')}
      />
    </div>
  ),
  'bottom-edge': () => (
    <div style={{ position: 'absolute', bottom: 8, left: 8 }}>
      <Picker />
    </div>
  ),
  'two-months': () => (
    <div style={{ padding: 8 }}>
      <Datepicker label='Date' defaultOpen today={today} mode='range' numberOfMonths={2} />
    </div>
  ),
  'short-viewport': () => (
    <div style={{ padding: '150px 8px 0' }}>
      <Picker />
    </div>
  ),
  'layout-shift': LayoutShift,
  'scroll-container': () => (
    <div id='scroller' style={{ height: 300, overflow: 'auto', margin: 8 }}>
      <div style={{ height: 40 }} />
      <Picker />
      <div style={{ height: 900 }} />
    </div>
  ),
  'portal-scroll': () => (
    <div style={{ padding: 8, height: 2000 }}>
      <div style={{ height: 40 }} />
      <Picker portal />
    </div>
  ),
  closed: () => (
    <div style={{ padding: 8 }}>
      <Picker defaultOpen={false} name='date' />
    </div>
  ),
  'native-dialog': NativeDialog,
  'radix-dialog': RadixHost,
  'headless-dialog': HeadlessHost,
  'host-page': HostPage,
  calendar: () => (
    <Calendar
      calendar={(params.get('calendar') as 'AD' | 'BS') ?? 'AD'}
      today={today}
      defaultMonth={params.has('month') ? new Date(`${params.get('month')}T00:00`) : undefined}
    />
  ),
};

const root = document.getElementById('root') as HTMLElement;
if (params.get('s') === 'hydrate') {
  const { html, props } = window.serverRender;
  root.innerHTML = html;
  hydrateRoot(root, <Datepicker {...props} />, {
    onRecoverableError: (error) => window.hydrationErrors.push(String(error)),
  });
} else {
  const Scenario = scenarios[params.get('s') ?? ''] ?? (() => <p>Unknown scenario</p>);
  createRoot(root).render(<Scenario />);
}
