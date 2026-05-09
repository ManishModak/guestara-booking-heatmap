import { X } from 'lucide-react';
import { EMPTY_FILTERS } from '../data/bookingTransforms.js';
import { titleCase } from '../utils/format.js';

export default function FilterBar({ filters, options, onChange, onClear }) {
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => EMPTY_FILTERS[key] !== value);

  return (
    <section className="filter-bar" aria-label="Booking filters">
      <FilterSelect
        id="roomType"
        label="Room type"
        value={filters.roomType}
        values={options.roomTypes}
        onChange={onChange}
      />
      <FilterSelect
        id="source"
        label="Source"
        value={filters.source}
        values={options.sources}
        onChange={onChange}
      />
      <FilterSelect
        id="status"
        label="Status"
        value={filters.status}
        values={options.statuses}
        onChange={onChange}
      />
      <button className="clear-button" type="button" onClick={onClear} disabled={!hasActiveFilters}>
        <X size={15} />
        Clear
      </button>
    </section>
  );
}

function FilterSelect({ id, label, value, values, onChange }) {
  return (
    <label className="filter-field" htmlFor={id}>
      <span>{label}</span>
      <select id={id} value={value} onChange={(event) => onChange(id, event.target.value)}>
        <option value="all">All</option>
        {values.map((option) => (
          <option value={option} key={option}>{titleCase(option)}</option>
        ))}
      </select>
    </label>
  );
}
