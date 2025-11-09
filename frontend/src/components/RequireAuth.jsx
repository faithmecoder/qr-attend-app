import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RequireAuth({ children, role }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect them to the /login page, but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== role) {
    // Redirect them to a "not authorized" page or home
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

export default RequireAuth;