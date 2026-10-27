export default function EmptyState({ icon = '📭', title = 'No data found', description }) {
  return (
    <div className="empty-state">
      <span className="icon">{icon}</span>
      <h3>{title}</h3>
      {description && <p className="mt-1">{description}</p>}
    </div>
  );
}
