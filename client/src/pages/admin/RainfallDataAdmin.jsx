import AdminDataBrowser from './AdminDataBrowser.jsx';

const columns = [
  { key: 'year', label: 'Year' },
  { key: 'state', label: 'State' },
  { key: 'district', label: 'District' },
  { key: 'season', label: 'Season' },
  { key: 'rainfall', label: 'Rainfall (mm)' },
  { key: 'temperature', label: 'Temp (°C)' },
  { key: 'humidity', label: 'Humidity (%)' },
  { key: 'source', label: 'Source' }
];

export default function RainfallDataAdmin() {
  return (
    <AdminDataBrowser
      title="Rainfall Data"
      description="Browse all rainfall records stored in MongoDB."
      columns={columns}
    />
  );
}
