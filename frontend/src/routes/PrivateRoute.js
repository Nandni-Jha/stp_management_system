import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants';

/**
 * PrivateRoute - Wrapper for protected routes
 * Redirects unauthenticated users to login
 * @param {React.ReactNode} children - Child components to render
 * @param {string} redirectTo - Path to redirect unauthenticated users (default: login)
 */
const PrivateRoute = ({ children, redirectTo = ROUTES.LOGIN }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    // Save current location to redirect back after login
    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    return children;
};

export default PrivateRoute;
