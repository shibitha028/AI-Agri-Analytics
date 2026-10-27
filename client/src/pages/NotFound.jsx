import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center', padding: 20
    }}>
      <span style={{ fontSize: 44 }}>🌾</span>
      <h1 style={{ fontFamily: 'var(--font-heading)' }}>404 — Page Not Found</h1>
      <p className="text-muted">The page you're looking for doesn't exist.</p>
      <Link className="btn btn-primary" to="/login">Go to Login</Link>
    </div>
  );
}
