import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { formatMonthYear } from '../utils/date.js';

export default function CalendarHeader({ visibleMonth, onPrevious, onNext, onToday }) {
  return (
    <header className="calendar-header">
      <div>
        <p className="eyebrow">Guestara Front Desk</p>
        <h1>Booking Calendar Heatmap</h1>
      </div>
      <div className="month-controls" aria-label="Calendar navigation">
        <button className="icon-button" type="button" onClick={onPrevious} aria-label="Previous month">
          <ChevronLeft size={18} />
        </button>
        <div className="month-title" aria-live="polite">{formatMonthYear(visibleMonth)}</div>
        <button className="icon-button" type="button" onClick={onNext} aria-label="Next month">
          <ChevronRight size={18} />
        </button>
        <button className="today-button" type="button" onClick={onToday}>
          <RotateCcw size={16} />
          Today
        </button>
      </div>
    </header>
  );
}
