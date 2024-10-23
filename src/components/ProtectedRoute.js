import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
  // Redirect to login if no token is found
    return <Navigate to="/" />;
  }

  // If token exists, render the child component
  return children;
};

export default ProtectedRoute;
