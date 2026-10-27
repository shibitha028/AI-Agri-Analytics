import { useAuth } from '../context/AuthContext.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';

export default function Profile() {
  const { user } = useAuth();

  const fields = [
    ['Full Name', user?.name],
    ['Email', user?.email],
    ['Mobile Number', user?.mobile],
    ['State', user?.state],
    ['District', user?.district],
    ['Village / Town', user?.village || '—'],
    ['Preferred Language', user?.language],
    ['User Type', user?.userType],
    ['Role', user?.role]
  ];

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>Profile</h1>
          <p>Your registered account details.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <div className="flex-gap mb-3">
          <div className="avatar-circle" style={{ width: 56, height: 56, fontSize: 20 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>{user?.name}</div>
            <div className="text-muted" style={{ fontSize: 13 }}>{user?.email}</div>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <tbody>
              {fields.map(([label, value]) => (
                <tr key={label}>
                  <td style={{ fontWeight: 600, width: '40%' }}>{label}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
