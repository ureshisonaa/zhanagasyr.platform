import { Navigate, Outlet } from 'react-router-dom';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';
import { useAuthStore } from '../../store/authStore';

export function ProtectedRoute(): JSX.Element {
  const status = useAuthStore((state) => state.status);

  if (status === 'idle' || status === 'loading') {
    return <LoadingSpinner />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
