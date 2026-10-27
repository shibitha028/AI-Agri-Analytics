import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const USER_LINKS = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/crop-analytics', icon: '🌾', label: 'Crop Analytics' },
  { to: '/historical-analytics', icon: '📈', label: 'Historical Analytics' },
  { to: '/rainfall-analytics', icon: '🌧️', label: 'Rainfall Analytics' },
  { to: '/soil-health', icon: '🧪', label: 'Soil Health' },
  { to: '/water-resources', icon: '💧', label: 'Water Resources' },
  { to: '/climate-simulator', icon: '🌡️', label: 'Climate Simulator' },
  { to: '/location', icon: '📍', label: 'My Location' },
  { to: '/ai-assistant', icon: '🤖', label: 'AI Farming Assistant' },
  { to: '/prediction-history', icon: '🕒', label: 'Prediction History' },
  { to: '/reports', icon: '📄', label: 'Reports' },
  { to: '/profile', icon: '👤', label: 'Profile' },
  { to: '/settings', icon: '⚙️', label: 'Settings' }
];

const ADMIN_LINKS = [
  { to: '/admin/dashboard', icon: '📊', label: 'Admin Dashboard' },
  { to: '/admin/users', icon: '👥', label: 'Users' },
  { to: '/admin/dataset-upload', icon: '⬆️', label: 'Dataset Upload' },
  { to: '/admin/data-validation', icon: '✅', label: 'Data Validation' },
  { to: '/admin/rainfall-data', icon: '🌧️', label: 'Rainfall Data' },
  { to: '/admin/soil-data', icon: '🧪', label: 'Soil Data' },
  { to: '/admin/crop-data', icon: '🌾', label: 'Crop Data' },
  { to: '/admin/analytics', icon: '📈', label: 'Analytics' },
  { to: '/admin/upload-history', icon: '🕒', label: 'Upload History' },
  { to: '/admin/reports', icon: '📄', label: 'Reports' },
  { to: '/admin/settings', icon: '⚙️', label: 'Settings' }
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const links = isAdmin ? ADMIN_LINKS : USER_LINKS;

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <span className="logo-dot">🌱</span>
        AgriAI
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">{isAdmin ? 'Administration' : 'Main Menu'}</div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
