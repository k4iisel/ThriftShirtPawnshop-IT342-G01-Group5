import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import apiService from '../services/apiService';

const ProtectedRoute = () => {
    const isAuthenticated = apiService.auth.isAuthenticated();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
