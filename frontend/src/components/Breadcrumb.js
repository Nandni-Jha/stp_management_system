import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants';

const Breadcrumb = ({ pageTitle }) => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Don't show breadcrumb on dashboard
    if (location.pathname === ROUTES.DASHBOARD) {
        return null;
    }

    const breadcrumbItems = [{ path: ROUTES.DASHBOARD, label: 'Home' }];

    // Add current page
    pathnames.forEach((pathname, index) => {
        const path = `/${pathnames.slice(0, index + 1).join('/')}`;

        // Special handling for nested routes
        if (
            pathname === 'projects' &&
            pathnames[index + 1] &&
            pathnames[index + 1] === 'milestones'
        ) {
            // For projects/:projectId/milestones route, show "Project Milestones" instead of project ID
            breadcrumbItems.push({ path: pathnames.slice(0, index).join('/'), label: 'Projects' });
            breadcrumbItems.push({ path, label: 'Project Milestones' });
            return;
        }

        // Skip project ID in breadcrumb (e.g., don't show "1" in projects/1/milestones)
        if (pathname.match(/^\d+$/)) {
            return;
        }

        const label = getBreadcrumbLabel(pathname, path);
        breadcrumbItems.push({ path, label });
    });

    return (
        <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
                {/* Page Title */}
                <h1 className="text-2xl font-bold text-gray-800 mb-3">{pageTitle}</h1>

                {/* Breadcrumb Navigation */}
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2 text-sm">
                        {breadcrumbItems.map((item, index) => {
                            const isLast = index === breadcrumbItems.length - 1;

                            return (
                                <li key={item.path} className="flex items-center">
                                    {index > 0 && (
                                        <svg
                                            className="w-4 h-4 text-gray-400 mx-2"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    )}
                                    {isLast ? (
                                        <span className="text-gray-500 font-medium">
                                            {item.label}
                                        </span>
                                    ) : (
                                        <Link
                                            to={item.path}
                                            className="text-primary-600 hover:text-primary-800 font-medium transition-colors"
                                        >
                                            {item.label}
                                        </Link>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </nav>
            </div>
        </div>
    );
};

// Helper function to get proper breadcrumb labels
const getBreadcrumbLabel = (pathname, fullPath) => {
    switch (pathname) {
        case 'projects':
            return 'Projects';
        case 'milestones':
            return 'Project Milestones';
        case 'assignments':
            return 'Asset Assignments';
        case 'fuel-logs':
            return 'Fuel Logs';
        case 'maintenance':
            return 'Maintenance';
        case 'documents':
            return 'Documents';
        case 'locations':
            return 'Locations';
        case 'customers':
            return 'Customers';
        case 'vendors':
            return 'Vendors';
        case 'users':
            return 'Users';
        case 'profile':
            return 'Profile';
        case 'settings':
            return 'Settings';
        default:
            // For numeric IDs, return empty string to skip them
            if (pathname.match(/^\d+$/)) {
                return '';
            }
            // Capitalize first letter and replace hyphens with spaces
            return pathname
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
    }
};

export default Breadcrumb;
