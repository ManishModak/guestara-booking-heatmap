import { addDays, compareDateKeys, formatDateKey, getMonthBounds, getNights, parseDate } from './date.js';

export const TOTAL_ROOMS = 10;
export const OCCUPYING_STATUSES = new Set(['confirmed', 'checked_in', 'checked_out']);

export function isOccupyingBooking(booking) {
  return OCCUPYING_STATUSES.has(booking.status);
}

export function bookingOccupiesDate(booking, dateKey) {
  return isOccupyingBooking(booking)
    && compareDateKeys(booking.checkIn, dateKey) <= 0
    && compareDateKeys(booking.checkOut, dateKey) > 0;
}

export function buildOccupancyMap(bookings) {
  const occupancy = new Map();

  bookings.filter(isOccupyingBooking).forEach((booking) => {
    for (
      let cursor = parseDate(booking.checkIn);
      compareDateKeys(formatDateKey(cursor), booking.checkOut) < 0;
      cursor = addDays(cursor, 1)
    ) {
      const key = formatDateKey(cursor);
      occupancy.set(key, (occupancy.get(key) || 0) + 1);
    }
  });

  return occupancy;
}

export function bookingOverlapsRange(booking, range) {
  if (!range) return false;
  const selectedEndExclusive = formatDateKey(addDays(range.end, 1));
  return compareDateKeys(booking.checkIn, selectedEndExclusive) < 0
    && compareDateKeys(booking.checkOut, range.start) > 0;
}

export function bookingOverlapsMonth(booking, visibleMonth) {
  const bounds = getMonthBounds(visibleMonth);
  return compareDateKeys(booking.checkIn, bounds.endExclusive) < 0
    && compareDateKeys(booking.checkOut, bounds.start) > 0;
}

export function getMonthStats(bookings, visibleMonth) {
  const activeBookings = bookings.filter((booking) => isOccupyingBooking(booking) && bookingOverlapsMonth(booking, visibleMonth));
  const occupancyMap = buildOccupancyMap(bookings);
  const bounds = getMonthBounds(visibleMonth);
  const roomTypes = new Map();
  let totalOccupiedRoomNights = 0;
  let dayCount = 0;
  let peak = { dateKey: bounds.start, count: 0 };

  for (
    let cursor = parseDate(bounds.start);
    compareDateKeys(formatDateKey(cursor), bounds.endExclusive) < 0;
    cursor = addDays(cursor, 1)
  ) {
    const key = formatDateKey(cursor);
    const count = occupancyMap.get(key) || 0;
    totalOccupiedRoomNights += count;
    dayCount += 1;
    if (count > peak.count) peak = { dateKey: key, count };
  }

  activeBookings.forEach((booking) => {
    roomTypes.set(booking.roomType, (roomTypes.get(booking.roomType) || 0) + 1);
  });

  const mostBookedRoomType = [...roomTypes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
  const totalRevenue = activeBookings.reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0);
  const averageOccupancy = dayCount === 0 ? 0 : Math.round((totalOccupiedRoomNights / (dayCount * TOTAL_ROOMS)) * 100);
  const longestStay = activeBookings.reduce((max, booking) => Math.max(max, getNights(booking.checkIn, booking.checkOut)), 0);

  return {
    activeBookings: activeBookings.length,
    averageOccupancy,
    longestStay,
    mostBookedRoomType,
    peak,
    totalRevenue,
  };
}
