export default function RiskBadge({ level }) {
  const cls = level === 'High' ? 'badge-high' : level === 'Moderate' ? 'badge-moderate' : 'badge-low';
  return <span className={`badge ${cls}`}>{level || 'Low'} Risk</span>;
}
