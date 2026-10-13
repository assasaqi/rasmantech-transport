import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ClientProtectedRoute = () => {
    const token = localStorage.getItem('clientToken');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ClientProtectedRoute;
