# Hotel booking

Pick a stay across two months. Booked nights can't be picked and a stay can't run through them, the shortest stay is two nights, and the field submits AD dates with an ordinary form post.

<div class="vp-raw example">
  <ReactIsland demo="Booking" />
</div>

::: info
Rooms, rates and bookings are sample data.
:::

## Code

```tsx
<form onSubmit={…}>
  <Datepicker
    mode='range'
    name='stay'                  // submits stay[start] and stay[end]
    numberOfMonths={2}
    minDays={3}                  // counted in days, both ends: 2 nights
    maxDays={15}
    minDate={new Date()}
    isDateDisabled={({ ad }) => booked.has(ad)}
    excludeDisabled              // a stay can't run through a booked night
    dayLabel={({ ad }) => (booked.has(ad) ? 'Booked' : undefined)}
    required
    clearable
    onChange={setRange}
  />
</form>
```
