import { Activity, BedDouble, CalendarDays, IndianRupee, TrendingUp } from 'lucide-react';
import { formatDisplayDate } from '../utils/date.js';
import { formatCurrency } from '../utils/format.js';

export default function StatsStrip({ stats }) {
  const items = [
    { icon: Activity, label: 'Avg occupancy', value: `${stats.averageOccupancy}%` },
    { icon: TrendingUp, label: 'Peak day', value: `${formatDisplayDate(stats.peak.dateKey)} · ${stats.peak.count}/10` },
    { icon: IndianRupee, label: 'Revenue', value: formatCurrency(stats.totalRevenue) },
    { icon: CalendarDays, label: 'Active bookings', value: stats.activeBookings },
    { icon: BedDouble, label: 'Top room type', value: stats.mostBookedRoomType },
  ];

  return (
    <section className="stats-strip" aria-label="Month statistics">
      {items.map(({ icon: Icon, label, value }) => (
        <div className="stat-item" key={label}>
          <Icon size={18} aria-hidden="true" />
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </section>
  );
}
