export default function Loader({ label = 'Loading data...' }) {
  return (
    <div className="loading-state">
      <span className="spinner"></span>
      <p style={{ marginTop: 10 }}>{label}</p>
    </div>
  );
}
