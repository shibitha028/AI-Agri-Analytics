import AdminDataBrowser from './AdminDataBrowser.jsx';

const columns = [
  { key: 'year', label: 'Year' },
  { key: 'district', label: 'District' },
  { key: 'soilType', label: 'Soil Type' },
  { key: 'nitrogen', label: 'Nitrogen' },
  { key: 'phosphorus', label: 'Phosphorus' },
  { key: 'potassium', label: 'Potassium' },
  { key: 'ph', label: 'pH' },
  { key: 'source', label: 'Source' }
];

export default function SoilDataAdmin() {
  return (
    <AdminDataBrowser
      title="Soil Data"
      description="Browse all soil composition records stored in MongoDB."
      columns={columns}
    />
  );
}
