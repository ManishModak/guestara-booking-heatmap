export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function parseDate(value) {
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 12);
  }

  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

export function formatDateKey(date) {
  const localDate = parseDate(date);
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateOrKey, options = {}) {
  const date = typeof dateOrKey === 'string' ? parseDate(dateOrKey) : dateOrKey;
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: options.year === false ? undefined : 'numeric',
  }).format(date);
}

export function formatMonthYear(date) {
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function startOfMonth(date) {
  const localDate = parseDate(date);
  return new Date(localDate.getFullYear(), localDate.getMonth(), 1, 12);
}

export function endOfMonth(date) {
  const localDate = parseDate(date);
  return new Date(localDate.getFullYear(), localDate.getMonth() + 1, 0, 12);
}

export function addDays(dateOrKey, count) {
  const date = typeof dateOrKey === 'string' ? parseDate(dateOrKey) : parseDate(dateOrKey);
  date.setDate(date.getDate() + count);
  return date;
}

export function addMonths(date, count) {
  const localDate = parseDate(date);
  return new Date(localDate.getFullYear(), localDate.getMonth() + count, 1, 12);
}

export function isSameDay(a, b) {
  return formatDateKey(a) === formatDateKey(b);
}

export function compareDateKeys(a, b) {
  return a.localeCompare(b);
}

export function normalizeRange(startKey, endKey) {
  if (!startKey || !endKey) return null;
  return compareDateKeys(startKey, endKey) <= 0
    ? { start: startKey, end: endKey }
    : { start: endKey, end: startKey };
}

export function isDateInRange(dateKey, startKey, endKey) {
  if (!startKey || !endKey) return false;
  const range = normalizeRange(startKey, endKey);
  return compareDateKeys(dateKey, range.start) >= 0 && compareDateKeys(dateKey, range.end) <= 0;
}

export function getNights(checkIn, checkOut) {
  const start = parseDate(checkIn);
  const end = parseDate(checkOut);
  return Math.max(0, Math.round((end - start) / 86400000));
}

export function getCalendarDays(visibleMonth) {
  const monthStart = startOfMonth(visibleMonth);
  const monthEnd = endOfMonth(visibleMonth);
  const gridStart = addDays(monthStart, -monthStart.getDay());
  const gridEnd = addDays(monthEnd, 6 - monthEnd.getDay());
  const days = [];

  for (let cursor = gridStart; cursor <= gridEnd; cursor = addDays(cursor, 1)) {
    const date = parseDate(cursor);
    days.push({
      date,
      dateKey: formatDateKey(date),
      dayOfMonth: date.getDate(),
      isCurrentMonth: date.getMonth() === monthStart.getMonth(),
      isToday: isSameDay(date, new Date()),
    });
  }

  return days;
}

export function getMonthBounds(visibleMonth) {
  const start = formatDateKey(startOfMonth(visibleMonth));
  const end = formatDateKey(endOfMonth(visibleMonth));
  return { start, end, endExclusive: formatDateKey(addDays(end, 1)) };
}
