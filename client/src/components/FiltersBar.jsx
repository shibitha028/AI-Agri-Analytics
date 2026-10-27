// Generic filter bar: State / District / Year / Crop / Season
export default function FiltersBar({ filters, onChange, options = {}, fields }) {
  const activeFields = fields || ['district', 'year', 'crop', 'season'];

  const fieldConfig = {
    state: { label: 'State', options: options.states || ['Tamil Nadu'] },
    district: { label: 'District', options: options.districts || [] },
    year: { label: 'Year', options: options.years || [] },
    crop: { label: 'Crop', options: options.crops || [] },
    season: { label: 'Season', options: options.seasons || ['Kharif', 'Rabi', 'Whole Year', 'Summer', 'Winter'] }
  };

  return (
    <div className="filters-bar">
      {activeFields.map((field) => (
        <div className="form-group" key={field}>
          <label className="form-label">{fieldConfig[field].label}</label>
          <select
            className="form-select"
            value={filters[field] || ''}
            onChange={(e) => onChange({ ...filters, [field]: e.target.value })}
          >
            <option value="">All</option>
            {fieldConfig[field].options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      ))}
      <button className="btn btn-secondary btn-sm" onClick={() => onChange({})}>
        Clear Filters
      </button>
    </div>
  );
}
