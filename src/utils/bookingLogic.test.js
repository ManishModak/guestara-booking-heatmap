import { describe, expect, it } from 'vitest';
import { getCalendarDays, getNights, normalizeRange } from './date.js';
import { bookingOccupiesDate, bookingOverlapsRange, buildOccupancyMap } from './occupancy.js';

const sample = [
  {
    id: 'A',
    guestName: 'Test Guest',
    roomNumber: '101',
    roomType: 'Standard',
    checkIn: '2026-02-10',
    checkOut: '2026-02-13',
    status: 'confirmed',
    source: 'Direct',
    totalAmount: 100,
  },
  {
    id: 'B',
    guestName: 'Cancelled Guest',
    roomNumber: '102',
    roomType: 'Standard',
    checkIn: '2026-02-10',
    checkOut: '2026-02-12',
    status: 'cancelled',
    source: 'Direct',
    totalAmount: 100,
  },
  {
    id: 'C',
    guestName: 'Month Edge',
    roomNumber: '103',
    roomType: 'Suite',
    checkIn: '2026-02-28',
    checkOut: '2026-03-02',
    status: 'checked_in',
    source: 'Expedia',
    totalAmount: 100,
  },
];

describe('booking date logic', () => {
  it('uses inclusive check-in and exclusive check-out nights', () => {
    expect(bookingOccupiesDate(sample[0], '2026-02-10')).toBe(true);
    expect(bookingOccupiesDate(sample[0], '2026-02-12')).toBe(true);
    expect(bookingOccupiesDate(sample[0], '2026-02-13')).toBe(false);
    expect(getNights('2026-02-10', '2026-02-13')).toBe(3);
  });

  it('excludes cancelled bookings from occupancy', () => {
    const occupancy = buildOccupancyMap(sample);
    expect(occupancy.get('2026-02-10')).toBe(1);
    expect(occupancy.get('2026-02-11')).toBe(1);
  });

  it('keeps cross-month nights on both calendar months', () => {
    const occupancy = buildOccupancyMap(sample);
    expect(occupancy.get('2026-02-28')).toBe(1);
    expect(occupancy.get('2026-03-01')).toBe(1);
    expect(occupancy.get('2026-03-02')).toBeUndefined();
  });

  it('normalizes backward drag ranges', () => {
    expect(normalizeRange('2026-02-12', '2026-02-05')).toEqual({
      start: '2026-02-05',
      end: '2026-02-12',
    });
  });

  it('finds selected range booking overlaps using night semantics', () => {
    expect(bookingOverlapsRange(sample[0], { start: '2026-02-13', end: '2026-02-13' })).toBe(false);
    expect(bookingOverlapsRange(sample[0], { start: '2026-02-12', end: '2026-02-12' })).toBe(true);
  });

  it('generates rectangular Sunday-first grids with outside-month days', () => {
    const days = getCalendarDays(new Date(2026, 1, 1, 12));
    expect(days.length % 7).toBe(0);
    expect(days[0].dateKey).toBe('2026-02-01');
    const marchDays = getCalendarDays(new Date(2026, 2, 1, 12));
    expect(marchDays[0].dateKey).toBe('2026-03-01');
    expect(marchDays.at(-1).dateKey).toBe('2026-04-04');
  });
});
