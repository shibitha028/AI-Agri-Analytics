import { useAuth } from '../context/AuthContext.jsx';

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const initials = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'A';

  return (
    <header className="topbar">
      <div className="flex-gap">
        <button className="hamburger" onClick={onMenuClick} aria-label="Open menu">☰</button>
        <div>
          <div className="topbar-greeting">
            Hello, {user?.name || (user?.role === 'admin' ? 'Admin' : 'User')} 👋
          </div>
          {user?.role !== 'admin' && (
            <div className="topbar-district">
              District: {user?.district || 'Not set'}{user?.state ? `, ${user.state}` : ''}
            </div>
          )}
          {user?.role === 'admin' && <div className="topbar-district">Administrator Console</div>}
        </div>
      </div>
      <div className="avatar-circle">{initials}</div>
    </header>
  );
}
