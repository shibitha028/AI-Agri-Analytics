import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import Alert from '../components/Alert.jsx';

export default function Settings() {
  const { user } = useAuth();
  const [language, setLanguage] = useState(user?.language || 'English');
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    // Demo-scope: settings are not persisted to the backend in this build.
    setSaved('Preferences saved locally for this session.');
    setTimeout(() => setSaved(''), 3000);
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your display preferences.</p>
        </div>
      </div>

      <Alert type="success" message={saved} onClose={() => setSaved('')} />

      <div className="card" style={{ maxWidth: 480 }}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Preferred Language</label>
            <select className="form-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
              {['English', 'Tamil', 'Hindi', 'Telugu', 'Kannada', 'Malayalam'].map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>

          <div className="form-checkbox-row">
            <label>
              <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
              Email notifications for new insights
            </label>
          </div>

          <button className="btn btn-primary" type="submit">Save Preferences</button>
        </form>
      </div>
    </DashboardLayout>
  );
}
