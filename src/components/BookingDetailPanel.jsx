import { Download } from 'lucide-react';
import { formatDisplayDate, getNights } from '../utils/date.js';
import { formatCurrency, titleCase } from '../utils/format.js';

export default function BookingDetailPanel({ range, bookings, onExport }) {
  const title = range ? (
    range.start === range.end
      ? formatDisplayDate(range.start)
      : `${formatDisplayDate(range.start)} - ${formatDisplayDate(range.end)}`
  ) : 'Select dates';

  return (
    <aside className="detail-panel" aria-label="Booking details">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Selected range</p>
          <h2>{title}</h2>
        </div>
        <button className="icon-text-button" type="button" onClick={onExport} disabled={!range || bookings.length === 0}>
          <Download size={16} />
          CSV
        </button>
      </div>

      {!range && (
        <div className="empty-panel">
          Click or drag across calendar days to inspect booking overlap for those nights.
        </div>
      )}

      {range && bookings.length === 0 && (
        <div className="empty-panel">No bookings overlap this selected night range.</div>
      )}

      <div className="booking-list">
        {bookings.map((booking) => (
          <article className="booking-card" key={booking.id}>
            <div className="booking-card-header">
              <div>
                <h3>{booking.guestName}</h3>
                <p>Room {booking.roomNumber} · {booking.roomType}</p>
              </div>
              <span className={`status-pill status-${booking.status}`}>{titleCase(booking.status)}</span>
            </div>
            <dl className="booking-meta">
              <div>
                <dt>Check-in</dt>
                <dd>{formatDisplayDate(booking.checkIn)}</dd>
              </div>
              <div>
                <dt>Check-out</dt>
                <dd>{formatDisplayDate(booking.checkOut)}</dd>
              </div>
              <div>
                <dt>Nights</dt>
                <dd>{getNights(booking.checkIn, booking.checkOut)}</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>{booking.source}</dd>
              </div>
              <div>
                <dt>Guests</dt>
                <dd>{booking.guests}</dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd>{formatCurrency(booking.totalAmount, booking.currency)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </aside>
  );
}
