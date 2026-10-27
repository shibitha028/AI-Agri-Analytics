import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Guards a route by authentication and, optionally, a required role.
// Users cannot access admin pages; admins are routed to their own dashboard.
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-state">
        <span className="spinner"></span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={role === 'admin' ? '/admin/login' : '/login'} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return children;
}
