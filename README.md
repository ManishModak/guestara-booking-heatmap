# Guestara Booking Calendar Heatmap

Single-page React application for the Guestara frontend assignment. It fetches `bookings.json` from the public folder and renders an interactive month-view occupancy heatmap for 10 hotel rooms.

## Run Locally

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm test
npm run build
```

## Implementation Notes

- Booking data is loaded with `fetch('/bookings.json')`; it is not imported as a module.
- Occupancy uses `checkIn <= date < checkOut`, so checkout day is not counted.
- Cancelled bookings are excluded from occupancy.
- Date helpers use local calendar-day parsing instead of `new Date('YYYY-MM-DD')`.
- Drag selection is implemented with native mouse events.
