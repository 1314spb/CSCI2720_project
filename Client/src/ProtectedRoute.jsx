import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProtectedRoute = ({ children }) => {
  const userEmail = Cookies.get('email');

  if (!userEmail) {
    // Redirect to login if not logged in
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;