import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PublicOnlyHomeRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <p className="py-10 text-center">Loading...</p>;
  }

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'seller' ? '/dashboard' : '/marketplace'} replace />;
  }

  return children;
};