import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { routesConfig, defaultRoutes } from './routes.config';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import { ROUTES } from '../constants';

/**
 * Loading Spinner Component
 * Displayed while lazy-loaded components are loading
 */
const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
);

/**
 * Renders a single route with appropriate wrapper based on protection status
 * @param {Object} route - Route configuration object
 */
const renderRoute = (route) => {
    const { path, element: Element, isProtected, isPublicOnly } = route;

    if (isProtected) {
        return (
            <Route
                key={path}
                path={path}
                element={
                    <PrivateRoute>
                        <Element />
                    </PrivateRoute>
                }
            />
        );
    }

    // Public routes that should redirect if already authenticated (like login)
    if (isPublicOnly !== false && !isProtected) {
        return (
            <Route
                key={path}
                path={path}
                element={
                    <PublicRoute>
                        <Element />
                    </PublicRoute>
                }
            />
        );
    }

    // Regular public routes accessible to everyone
    return <Route key={path} path={path} element={<Element />} />;
};

/**
 * AppRouter - Main routing component
 * Handles all application routing with lazy loading support
 */
const AppRouter = () => {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <Routes>
                {/* Render all configured routes */}
                {routesConfig.map(renderRoute)}

                {/* Home redirect */}
                <Route path={ROUTES.HOME} element={<Navigate to={defaultRoutes.home} replace />} />

                {/* 404 - Catch all unmatched routes */}
                <Route path="*" element={<Navigate to={defaultRoutes.notFound} replace />} />
            </Routes>
        </Suspense>
    );
};

// Export components for external use
export { PrivateRoute, PublicRoute, routesConfig, defaultRoutes };
export default AppRouter;
