import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../helpers/useMockAuth';

interface MockProtectedRouteProps {
  children: React.ReactNode;
}

export const MockProtectedRoute = ({ children }: MockProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};