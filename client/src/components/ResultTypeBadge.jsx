// Clearly labels analytics outputs so nothing is mistaken for an ML prediction.
export default function ResultTypeBadge({ type }) {
  const map = {
    'Historical Yield': 'badge-historical',
    'Analytics-Based Estimate': 'badge-estimate',
    'Scenario Simulation': 'badge-simulation'
  };
  const cls = map[type] || 'badge-estimate';
  return <span className={`badge ${cls}`}>{type}</span>;
}
