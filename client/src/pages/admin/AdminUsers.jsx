import { useEffect, useState } from 'react';
import { getUsers } from '../../services/agriService';
import { getErrorMessage } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import Loader from '../../components/Loader.jsx';
import Alert from '../../components/Alert.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getUsers()
      .then((res) => setUsers(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) =>
    `${u.name} ${u.email} ${u.district}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p>All registered platform users (role: user).</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="filters-bar">
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Search</label>
          <input className="form-input" placeholder="Search by name, email or district..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : !filtered.length ? (
        <EmptyState title="No users found" />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Mobile</th><th>District</th><th>Village</th><th>User Type</th><th>Registered</th></tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.mobile}</td>
                    <td>{u.district}</td>
                    <td>{u.village || '—'}</td>
                    <td>{u.userType}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
