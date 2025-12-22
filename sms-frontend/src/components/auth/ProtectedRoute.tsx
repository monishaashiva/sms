import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role || '')) {
    // Redirect to appropriate dashboard based on user role
    const roleRedirects: Record<string, string> = {
      admin: '/admin',
      teacher: '/teacher',
      parent: '/parent',
    };
    
    return <Navigate to={roleRedirects[user.role || ''] || '/login'} replace />;
  }

  return <>{children}</>;
}