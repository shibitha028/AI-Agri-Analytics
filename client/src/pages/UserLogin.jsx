import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import Alert from '../components/Alert.jsx';
import RegisterModal from '../components/RegisterModal.jsx';

export default function UserLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: true });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please enter email and password.');
      return;
    }
    setSubmitting(true);
    try {
      const data = await loginUser({ email: form.email, password: form.password });
      login(data.token, data.user, form.rememberMe);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div className="brand"><span>🌱</span> AgriAI</div>
        <div className="tagline">
          <h2>Smarter farming decisions, powered by real agricultural data.</h2>
          <p>
            District-personalized rainfall, soil, and crop analytics for Tamil Nadu —
            built on historical data, transparent analytics, and scenario simulation.
          </p>
        </div>
        <div className="footnote">© {new Date().getFullYear()} AgriAI Analytics Platform · College Project Demo</div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-toggle">
            <a className="active">Login as User</a>
            <Link to="/admin/login">Login as Admin</Link>
          </div>

          <h1>Welcome back 👋</h1>
          <p className="subtitle">Login to view your personalized agricultural dashboard.</p>

          <Alert type="error" message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="form-checkbox-row">
              <label>
                <input
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                />
                Remember Me
              </label>
              <button type="button" onClick={() => setError('Password reset is not configured in this demo. Please contact the admin.')}>
                Forgot Password?
              </button>
            </div>

            <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
              {submitting ? <span className="spinner"></span> : 'Login as User'}
            </button>
          </form>

          <p className="auth-footer-text">
            New to AgriAI?{' '}
            <button onClick={() => setShowRegister(true)}>Register Here</button>
          </p>
        </div>
      </div>

      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      )}
    </div>
  );
}
