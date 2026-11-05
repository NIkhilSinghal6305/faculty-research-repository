import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// UI convenience only - the backend enforces the real permissions.
function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="state">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <p className="alert alert-error">You do not have permission to view this page.</p>;
  }
  return <Outlet />;
}

export default ProtectedRoute;
