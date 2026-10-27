import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginAdmin } from '../services/authService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import Alert from '../components/Alert.jsx';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please enter admin email and password.');
      return;
    }
    setSubmitting(true);
    try {
      const data = await loginAdmin(form);
      login(data.token, data.user);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-visual" style={{ background: 'linear-gradient(160deg, rgba(10,30,20,0.88), rgba(12,45,23,0.85)), url(https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=60) center/cover' }}>
        <div className="brand"><span>🌱</span> AgriAI · Admin</div>
        <div className="tagline">
          <h2>Manage agricultural datasets and platform operations.</h2>
          <p>Upload, validate, and import historical datasets that power district-level analytics for every registered user.</p>
        </div>
        <div className="footnote">Restricted access · Administrators only</div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-toggle">
            <Link to="/login">Login as User</Link>
            <a className="active">Login as Admin</a>
          </div>

          <h1>Admin Login 🔐</h1>
          <p className="subtitle">Restricted access for platform administrators.</p>

          <Alert type="error" message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Admin Email</label>
              <input
                type="email"
                className="form-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@agriai.com"
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
                placeholder="Enter admin password"
                required
              />
            </div>

            <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
              {submitting ? <span className="spinner"></span> : 'Login as Admin'}
            </button>
          </form>

          <p className="auth-footer-text">
            Not an admin? <Link to="/login">Go to user login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
