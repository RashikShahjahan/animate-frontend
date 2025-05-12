import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface UnprotectedRouteProps {
  children: React.ReactNode;
}

const UnprotectedRoute = ({ children }: UnprotectedRouteProps) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    // Redirect to home page if already authenticated
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

export default UnprotectedRoute; 