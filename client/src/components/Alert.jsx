export default function Alert({ type = 'info', message, onClose }) {
  if (!message) return null;
  const icon = type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
  return (
    <div className={`alert alert-${type}`}>
      <span>{icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontWeight: 700 }}>
          ×
        </button>
      )}
    </div>
  );
}
