import { useEffect, useState } from 'react';
import { getUploadHistory } from '../../services/agriService';
import { getErrorMessage } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import Loader from '../../components/Loader.jsx';
import Alert from '../../components/Alert.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const statusBadge = {
  validated: 'badge-estimate',
  imported: 'badge-historical',
  pending: 'badge-moderate',
  failed: 'badge-high'
};

export default function UploadHistoryPage() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getUploadHistory()
      .then((res) => setUploads(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>Upload History</h1>
          <p>Every dataset uploaded and imported by administrators.</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {loading ? (
        <Loader />
      ) : !uploads.length ? (
        <EmptyState icon="🕒" title="No uploads yet" description="Upload a dataset from Dataset Upload to see it appear here." />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>File Name</th><th>Uploaded By</th><th>Total</th><th>Valid</th><th>Invalid</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {uploads.map((u) => (
                  <tr key={u._id}>
                    <td>{u.fileName}</td>
                    <td>{u.uploadedBy?.name || '—'}</td>
                    <td>{u.totalRecords}</td>
                    <td>{u.validRecords}</td>
                    <td>{u.invalidRecords}</td>
                    <td><span className={`badge ${statusBadge[u.status] || 'badge-estimate'}`}>{u.status}</span></td>
                    <td>{new Date(u.createdAt).toLocaleString()}</td>
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
