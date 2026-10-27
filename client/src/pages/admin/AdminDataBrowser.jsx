import { useEffect, useState } from 'react';
import { getFilterOptions, getAgriculturalData } from '../../services/agriService';
import { getErrorMessage } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import FiltersBar from '../../components/FiltersBar.jsx';
import Loader from '../../components/Loader.jsx';
import Alert from '../../components/Alert.jsx';
import EmptyState from '../../components/EmptyState.jsx';

// Generic admin dataset browser, parameterized by title and visible columns.
// Used for the Rainfall Data / Soil Data / Crop Data admin pages, which are
// all views over the same AgriculturalData collection.
export default function AdminDataBrowser({ title, description, columns }) {
  const [filters, setFilters] = useState({});
  const [options, setOptions] = useState({});
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getFilterOptions().then(setOptions).catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getAgriculturalData({ ...filters, limit: 100 })
      .then((res) => { if (mounted) { setRecords(res.data); setTotal(res.total); } })
      .catch((err) => mounted && setError(getErrorMessage(err)))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [filters]);

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>

      <FiltersBar filters={filters} onChange={setFilters} options={options} fields={['district', 'year', 'crop', 'season']} />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {loading ? (
        <Loader />
      ) : !records.length ? (
        <EmptyState title="No records match these filters" />
      ) : (
        <div className="card">
          <div className="card-title">Showing {records.length} of {total} records</div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    {columns.map((c) => <td key={c.key}>{r[c.key] ?? '—'}</td>)}
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
