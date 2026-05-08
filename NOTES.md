# Guestara Assignment Notes

## Open-Scope Features

I implemented filtering and month stats.

Filtering covers room type, booking source, and status. The heatmap, selected booking list, and stats all recompute from the filtered booking set. Cancelled bookings can appear in the detail panel when selected by the filter, but they still do not count toward occupancy.

The stats strip gives the front desk quick month-level answers: average occupancy, peak occupancy day, total revenue from non-cancelled overlapping bookings, active bookings, and most-booked room type.

I also added localStorage persistence for the last viewed month and filters, plus CSV export for the selected booking range.

## Calendar Decisions

The calendar is Sunday-first because it is a familiar desk-calendar layout and keeps weekend columns visually predictable. Previous and next month days remain visible, dimmed, and selectable so the grid is always rectangular and drag selection can cross visible month boundaries.

I used native `Date` helpers rather than a date library. The app parses `YYYY-MM-DD` strings into local noon dates to avoid UTC date drift and keeps comparisons in date-key form wherever possible.

## Library Choices

No calendar libraries, date-picker primitives, or drag-and-drop libraries are used. shadcn/ui was not added. `lucide-react` is used only for generic interface icons.

## Initial Month

The first visit defaults to January 2026 because that is where the supplied mock data starts, so the app is useful immediately. The Today button always jumps to the real current month at runtime.

## Trade-Offs

The app is desktop-first, matching the assignment guidance. With more time, I would add keyboard range selection, more formal component tests, and a room timeline view for operations teams that need per-room sequencing.
