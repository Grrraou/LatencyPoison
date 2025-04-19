import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const PrivateRoute = ({ children }) => {
  const { user } = useUser();

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Render the protected component if authenticated
  return children;
};

export default PrivateRoute; 