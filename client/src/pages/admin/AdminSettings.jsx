import { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import Alert from '../../components/Alert.jsx';

export default function AdminSettings() {
  const [maxUploadMB, setMaxUploadMB] = useState(15);
  const [saved, setSaved] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setSaved('Settings saved locally for this session (demo scope).');
    setTimeout(() => setSaved(''), 3000);
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Platform configuration.</p>
        </div>
      </div>

      <Alert type="success" message={saved} onClose={() => setSaved('')} />

      <div className="card" style={{ maxWidth: 480 }}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Max Upload File Size (MB)</label>
            <input type="number" className="form-input" value={maxUploadMB} onChange={(e) => setMaxUploadMB(e.target.value)} />
          </div>
          <button className="btn btn-primary" type="submit">Save Settings</button>
        </form>
      </div>
    </DashboardLayout>
  );
}
