import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <p className="py-10 text-center">Loading...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};
