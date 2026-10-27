import AdminDataBrowser from './AdminDataBrowser.jsx';

const columns = [
  { key: 'year', label: 'Year' },
  { key: 'district', label: 'District' },
  { key: 'crop', label: 'Crop' },
  { key: 'season', label: 'Season' },
  { key: 'area', label: 'Area (ha)' },
  { key: 'production', label: 'Production (t)' },
  { key: 'yield', label: 'Yield (t/ha)' },
  { key: 'source', label: 'Source' }
];

export default function CropDataAdmin() {
  return (
    <AdminDataBrowser
      title="Crop Data"
      description="Browse all crop production records stored in MongoDB."
      columns={columns}
    />
  );
}
