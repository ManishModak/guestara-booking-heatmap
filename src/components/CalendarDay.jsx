export default function CalendarDay({ day, onMouseDown, onMouseEnter, onMouseUp }) {
  const classes = [
    'calendar-day',
    !day.isCurrentMonth && 'outside-month',
    day.isToday && 'today',
    day.isSelected && 'selected',
    day.isSelectionStart && 'selection-start',
    day.isSelectionEnd && 'selection-end',
    day.isPreviewedDuringDrag && 'previewed',
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classes}
      data-heat={day.heatLevel}
      onMouseDown={(event) => onMouseDown(event, day)}
      onMouseEnter={() => onMouseEnter(day)}
      onMouseUp={() => onMouseUp(day)}
      aria-label={`${day.dateKey}, ${day.occupancyCount} of 10 rooms occupied`}
    >
      <span className="date-number">{day.dayOfMonth}</span>
      <span className="occupancy-count">{day.occupancyCount}/10</span>
    </button>
  );
}
