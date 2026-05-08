import { useCallback, useEffect, useMemo, useState } from 'react';
import BookingDetailPanel from './components/BookingDetailPanel.jsx';
import CalendarGrid from './components/CalendarGrid.jsx';
import CalendarHeader from './components/CalendarHeader.jsx';
import ErrorState from './components/ErrorState.jsx';
import FilterBar from './components/FilterBar.jsx';
import LoadingState from './components/LoadingState.jsx';
import StatsStrip from './components/StatsStrip.jsx';
import { applyFilters, EMPTY_FILTERS, getFilterOptions, validateBookings } from './data/bookingTransforms.js';
import { addMonths, formatDateKey, getCalendarDays, getNights, isDateInRange, normalizeRange, parseDate } from './utils/date.js';
import { bookingOverlapsRange, buildOccupancyMap, getMonthStats, TOTAL_ROOMS } from './utils/occupancy.js';

const STORAGE_KEY = 'guestara-heatmap-state-v1';

function getInitialState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      visibleMonth: stored.visibleMonth ? parseDate(stored.visibleMonth) : parseDate('2026-01-01'),
      filters: { ...EMPTY_FILTERS, ...(stored.filters || {}) },
    };
  } catch {
    return {
      visibleMonth: parseDate('2026-01-01'),
      filters: EMPTY_FILTERS,
    };
  }
}

export default function App() {
  const initialState = useMemo(getInitialState, []);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleMonth, setVisibleMonth] = useState(initialState.visibleMonth);
  const [filters, setFilters] = useState(initialState.filters);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [dragAnchor, setDragAnchor] = useState(null);
  const [dragPreview, setDragPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/bookings.json');
      if (!response.ok) throw new Error(`Request failed with ${response.status}`);
      const payload = await response.json();
      setBookings(validateBookings(payload));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      filters,
      visibleMonth: formatDateKey(visibleMonth),
    }));
  }, [filters, visibleMonth]);

  useEffect(() => {
    const handleWindowMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      setDragAnchor(null);
      setDragPreview(null);
    };
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => window.removeEventListener('mouseup', handleWindowMouseUp);
  }, [isDragging]);

  const filteredBookings = useMemo(() => applyFilters(bookings, filters), [bookings, filters]);
  const filterOptions = useMemo(() => getFilterOptions(bookings), [bookings]);
  const occupancyMap = useMemo(() => buildOccupancyMap(filteredBookings), [filteredBookings]);
  const selectedRange = useMemo(() => normalizeRange(selectionStart, selectionEnd), [selectionStart, selectionEnd]);
  const previewRange = useMemo(() => normalizeRange(dragAnchor, dragPreview), [dragAnchor, dragPreview]);
  const activeRange = isDragging && previewRange ? previewRange : selectedRange;
  const selectedBookings = useMemo(
    () => selectedRange
      ? filteredBookings.filter((booking) => bookingOverlapsRange(booking, selectedRange))
      : [],
    [filteredBookings, selectedRange],
  );
  const monthStats = useMemo(() => getMonthStats(filteredBookings, visibleMonth), [filteredBookings, visibleMonth]);

  const days = useMemo(() => getCalendarDays(visibleMonth).map((day) => {
    const occupancyCount = Math.min(occupancyMap.get(day.dateKey) || 0, TOTAL_ROOMS);
    const occupancyPercent = Math.round((occupancyCount / TOTAL_ROOMS) * 100);
    return {
      ...day,
      occupancyCount,
      occupancyPercent,
      heatLevel: getHeatLevel(occupancyPercent),
      isSelected: selectedRange ? isDateInRange(day.dateKey, selectedRange.start, selectedRange.end) : false,
      isSelectionStart: selectedRange?.start === day.dateKey,
      isSelectionEnd: selectedRange?.end === day.dateKey,
      isPreviewedDuringDrag: isDragging && activeRange ? isDateInRange(day.dateKey, activeRange.start, activeRange.end) : false,
    };
  }), [activeRange, isDragging, occupancyMap, selectedRange, visibleMonth]);

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleMouseDown = (event, day) => {
    event.preventDefault();
    setIsDragging(true);
    setDragAnchor(day.dateKey);
    setDragPreview(day.dateKey);
    setSelectionStart(day.dateKey);
    setSelectionEnd(day.dateKey);
  };

  const handleMouseEnter = (day) => {
    if (!isDragging) return;
    setDragPreview(day.dateKey);
  };

  const handleMouseUp = (day) => {
    const range = normalizeRange(dragAnchor || day.dateKey, day.dateKey);
    if (range) {
      setSelectionStart(range.start);
      setSelectionEnd(range.end);
    }
    setIsDragging(false);
    setDragAnchor(null);
    setDragPreview(null);
  };

  const exportSelectedBookings = () => {
    if (!selectedRange || selectedBookings.length === 0) return;
    const header = ['id', 'guestName', 'roomNumber', 'roomType', 'checkIn', 'checkOut', 'nights', 'status', 'source', 'totalAmount'];
    const rows = selectedBookings.map((booking) => [
      booking.id,
      booking.guestName,
      booking.roomNumber,
      booking.roomType,
      booking.checkIn,
      booking.checkOut,
      getNights(booking.checkIn, booking.checkOut),
      booking.status,
      booking.source,
      booking.totalAmount,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `guestara-bookings-${selectedRange.start}-to-${selectedRange.end}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={loadBookings} />;

  return (
    <main className="app-shell">
      <CalendarHeader
        visibleMonth={visibleMonth}
        onPrevious={() => setVisibleMonth((current) => addMonths(current, -1))}
        onNext={() => setVisibleMonth((current) => addMonths(current, 1))}
        onToday={() => setVisibleMonth(new Date())}
      />
      <StatsStrip stats={monthStats} />
      <FilterBar
        filters={filters}
        options={filterOptions}
        onChange={handleFilterChange}
        onClear={() => setFilters(EMPTY_FILTERS)}
      />
      {bookings.length === 0 && <div className="empty-banner">No valid bookings were found in the data file.</div>}
      <div className="workspace">
        <CalendarGrid
          days={days}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
          onMouseUp={handleMouseUp}
        />
        <BookingDetailPanel
          range={selectedRange}
          bookings={selectedBookings}
          onExport={exportSelectedBookings}
        />
      </div>
    </main>
  );
}

function getHeatLevel(percent) {
  if (percent === 0) return '0';
  if (percent <= 30) return '1';
  if (percent <= 60) return '2';
  if (percent <= 90) return '3';
  return '4';
}
