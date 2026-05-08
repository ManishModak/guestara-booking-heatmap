export const EMPTY_FILTERS = {
  roomType: 'all',
  source: 'all',
  status: 'all',
};

export function validateBookings(payload) {
  if (!Array.isArray(payload)) {
    throw new Error('Booking response was not an array.');
  }

  return payload.filter((booking) => (
    booking
    && booking.id
    && booking.guestName
    && booking.roomNumber
    && booking.roomType
    && booking.checkIn
    && booking.checkOut
    && booking.status
    && booking.source
  ));
}

export function applyFilters(bookings, filters) {
  return bookings.filter((booking) => {
    const roomTypeMatch = filters.roomType === 'all' || booking.roomType === filters.roomType;
    const sourceMatch = filters.source === 'all' || booking.source === filters.source;
    const statusMatch = filters.status === 'all' || booking.status === filters.status;
    return roomTypeMatch && sourceMatch && statusMatch;
  });
}

export function getFilterOptions(bookings) {
  const unique = (field) => [...new Set(bookings.map((booking) => booking[field]))].sort();
  return {
    roomTypes: unique('roomType'),
    sources: unique('source'),
    statuses: unique('status'),
  };
}
