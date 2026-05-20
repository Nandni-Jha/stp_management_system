import { lazy } from 'react';
import { ROUTES } from '../constants';

// Lazy load components for better performance
const Login = lazy(() => import('../pages/auth/Login'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const Assets = lazy(() => import('../pages/assets/Assets'));
const Operators = lazy(() => import('../pages/operators/Operators'));
const Projects = lazy(() => import('../pages/projects/Projects'));
const Assignments = lazy(() => import('../pages/assignments/Assignments'));
const Locations = lazy(() => import('../pages/locations/Locations'));
const FuelLogs = lazy(() => import('../pages/fuel-logs/FuelLogs'));
const Customers = lazy(() => import('../pages/customers/Customers'));
const Vendors = lazy(() => import('../pages/vendors/Vendors'));
const Labors = lazy(() => import('../pages/labors/LaborList'));
const Users = lazy(() => import('../pages/users/Users'));
const Profile = lazy(() => import('../pages/users/Profile'));
const Settings = lazy(() => import('../pages/users/Settings'));

/**
 * Route configuration
 * @property {string} path - Route path
 * @property {React.Component} element - Component to render
 * @property {boolean} isProtected - Whether route requires authentication
 * @property {string} title - Page title (optional)
 */
export const routesConfig = [
    {
        path: ROUTES.LOGIN,
        element: Login,
        isProtected: false,
        title: 'Login',
    },
    {
        path: ROUTES.DASHBOARD,
        element: Dashboard,
        isProtected: true,
        title: 'Dashboard',
    },
    {
        path: ROUTES.ASSETS,
        element: Assets,
        isProtected: true,
        title: 'Assets Management',
    },
    {
        path: ROUTES.OPERATORS,
        element: Operators,
        isProtected: true,
        title: 'Operators Management',
    },
    {
        path: ROUTES.PROJECTS,
        element: Projects,
        isProtected: true,
        title: 'Projects Management',
    },
    {
        path: '/projects/:projectId/milestones',
        element: Projects,
        isProtected: true,
        title: 'Project Milestones',
    },
    {
        path: ROUTES.ASSIGNMENTS,
        element: Assignments,
        isProtected: true,
        title: 'Assignments Management',
    },
    {
        path: ROUTES.LOCATIONS,
        element: Locations,
        isProtected: true,
        title: 'Locations Management',
    },
    {
        path: ROUTES.FUEL_LOGS,
        element: FuelLogs,
        isProtected: true,
        title: 'Fuel Logs',
    },
    {
        path: ROUTES.CUSTOMERS,
        element: Customers,
        isProtected: true,
        title: 'Customer Management',
    },
    {
        path: ROUTES.VENDORS,
        element: Vendors,
        isProtected: true,
        title: 'Vendor Management',
    },
    {
        path: ROUTES.LABORS,
        element: Labors,
        isProtected: true,
        title: 'Labor Management',
    },
    {
        path: ROUTES.USERS,
        element: Users,
        isProtected: true,
        title: 'User Management',
    },
    {
        path: ROUTES.PROFILE,
        element: Profile,
        isProtected: true,
        title: 'Profile',
    },
    {
        path: ROUTES.SETTINGS,
        element: Settings,
        isProtected: true,
        title: 'Settings',
    },
];

// Default redirect routes
export const defaultRoutes = {
    home: ROUTES.DASHBOARD,
    notFound: ROUTES.DASHBOARD,
};
