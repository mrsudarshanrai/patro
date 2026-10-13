# Examples

patrojs in six small, real-world apps. Each one is live: use it, and the panel beside it shows exactly what the components returned. The code is underneath.

| Example | What it shows |
| --- | --- |
| [Festival calendar](./calendar) | A BS `Calendar` with this season's festivals: `dayClassName`, `dayContent`, `dayLabel`, `weekendDays`, `onMonthChange` and the Today button |
| [Registration form](./registration) | An `editable`, `clearable` Datepicker in react-hook-form's `Controller`, with a minimum age checked by `addBsYears` |
| [Hotel booking](./booking) | A two-month range with booked nights (`isDateDisabled`, `excludeDisabled`), a minimum stay, presets and a native form post |
| [बिदा निवेदन (leave form)](./leave) | A form entirely in Nepali that counts working days with `addBsDays` and `getBsWeekday`, and submits BS dates |
| [Reschedule in a dialog](./reschedule) | A Datepicker inside a modal `<dialog>` through `portalContainer`; Escape closes the picker first |
| [Date converter](./converter) | `ad2Bs`, `bs2Ad`, `formatBsDate`, `addBsMonths` and `bsDaysBetween`, with no calendar |
