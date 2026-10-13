# Reschedule in a dialog

A Datepicker inside a native modal `<dialog>`. The popover renders into the dialog through `portalContainer`, so the dialog's own clipping can't cut it off, and Escape closes the calendar before it closes the dialog. Saturdays and public holidays are unavailable.

<div class="vp-raw example">
  <ReactIsland demo="Reschedule" />
</div>

::: info
Appointments are sample data; public holidays are from nepalipatro.com.np for BS 2083.
:::

## Code

```tsx
const [dialogEl, setDialogEl] = useState<HTMLDialogElement | null>(null);

<dialog ref={setDialogEl}>
  <Datepicker
    portalContainer={dialogEl}   // render the popover inside the modal
    label='New date'
    minDate={tomorrow}
    isDateDisabled={({ date, bs }) => date.getDay() === 6 || isPublicHoliday(bs)}
    onChange={setDraft}
  />
</dialog>
```
