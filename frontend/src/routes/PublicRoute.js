import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants';

/**
 * PublicRoute - Wrapper for public routes
 * Redirects authenticated users to dashboard
 * @param {React.ReactNode} children - Child components to render
 * @param {string} redirectTo - Path to redirect authenticated users (default: dashboard)
 */
const PublicRoute = ({ children, redirectTo = ROUTES.DASHBOARD }) => {
    const { isAuthenticated, loading } = useAuth();

    // Show nothing while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    return children;
};

export default PublicRoute;
