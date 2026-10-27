import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import Alert from './Alert.jsx';

const TN_DISTRICTS = [
  'Coimbatore', 'Erode', 'Salem', 'Madurai', 'Thanjavur', 'Tiruchirappalli',
  'Chennai', 'Tiruppur', 'Vellore', 'Tirunelveli', 'Dindigul', 'Cuddalore',
  'Thoothukudi', 'Namakkal', 'Karur', 'Sivaganga'
];

const LANGUAGES = ['English', 'Tamil', 'Hindi', 'Telugu', 'Kannada', 'Malayalam'];
const USER_TYPES = ['Farmer', 'Researcher', 'Student', 'Government Official', 'Other'];

const initialForm = {
  name: '', email: '', mobile: '', password: '', confirmPassword: '',
  state: 'Tamil Nadu', district: '', village: '', language: 'English', userType: 'Farmer'
};

export default function RegisterModal({ onClose, onSwitchToLogin }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.district) {
      setError('Please select a district. District is mandatory.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await registerUser(form);
      login(data.token, data.user);
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Your AgriAI Account</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <Alert type="error" message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" required value={form.name} onChange={update('name')} placeholder="e.g. Ramesh Kumar" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" required value={form.email} onChange={update('email')} placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input className="form-input" required value={form.mobile} onChange={update('mobile')} placeholder="10-digit mobile" maxLength={10} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" required value={form.password} onChange={update('password')} placeholder="Min 6 characters" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-input" required value={form.confirmPassword} onChange={update('confirmPassword')} placeholder="Re-enter password" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">State</label>
              <input className="form-input" value={form.state} onChange={update('state')} />
            </div>
            <div className="form-group">
              <label className="form-label">District <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <select className="form-select" required value={form.district} onChange={update('district')}>
                <option value="">Select District</option>
                {TN_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Village / Town</label>
              <input className="form-input" value={form.village} onChange={update('village')} placeholder="e.g. Pollachi" />
            </div>
            <div className="form-group">
              <label className="form-label">Preferred Language</label>
              <select className="form-select" value={form.language} onChange={update('language')}>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">User Type</label>
            <select className="form-select" value={form.userType} onChange={update('userType')}>
              {USER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? <span className="spinner"></span> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin}>Login here</button>
        </p>
      </div>
    </div>
  );
}
