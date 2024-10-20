import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    // Store the intended path in localStorage before redirecting
    const currentPath = location.pathname + location.search;
    console.log('Setting intendedPath in ProtectedRoute:', currentPath);
    localStorage.setItem('intendedPath', currentPath);

    // Redirect to login if no token is found
    return <Navigate to="/login" />;
  }

  // If token exists, render the child component
  return children;
};

export default ProtectedRoute;
