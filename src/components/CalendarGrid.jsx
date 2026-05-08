import { WEEKDAYS } from '../utils/date.js';
import CalendarDay from './CalendarDay.jsx';

export default function CalendarGrid({ days, onMouseDown, onMouseEnter, onMouseUp }) {
  return (
    <section className="calendar-shell" aria-label="Month calendar">
      <div className="weekday-grid" aria-hidden="true">
        {WEEKDAYS.map((day) => <div key={day}>{day}</div>)}
      </div>
      <div className="calendar-grid" onMouseLeave={() => {}}>
        {days.map((day) => (
          <CalendarDay
            day={day}
            key={day.dateKey}
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
            onMouseUp={onMouseUp}
          />
        ))}
      </div>
    </section>
  );
}
