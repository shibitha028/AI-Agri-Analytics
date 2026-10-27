export default function StatCard({ icon, label, value, suffix }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">
        {value === null || value === undefined || value === '' ? '—' : value}
        {suffix && value !== null && value !== undefined && value !== '' ? ` ${suffix}` : ''}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
