import React, { useState } from 'react';
import SideNav from './SideNav';
import TopNav from './TopNav';
import Breadcrumb from './Breadcrumb';
import { useAuth } from '../hooks/useAuth';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants';
import { routesConfig } from '../routes/routes.config';

const Layout = ({ children }) => {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate(ROUTES.LOGIN);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const menuItems = [
        { label: 'Profile', action: () => console.log('Profile clicked') },
        { label: 'Settings', action: () => console.log('Settings clicked') },
        { label: 'Logout', action: handleLogout },
    ];

    // Get current page title from routes config
    const currentRoute = routesConfig.find((route) => route.path === location.pathname);
    const pageTitle = currentRoute?.title || 'Page';

    // Update document title dynamically
    useDocumentTitle(pageTitle);

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Desktop Sidebar */}
            <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:block">
                <SideNav />
            </div>

            {/* Mobile sidebar */}
            {mobileMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 z-50 w-64 md:hidden">
                        <SideNav onClose={() => setMobileMenuOpen(false)} />
                    </div>
                </>
            )}

            {/* Main Content */}
            <div className="flex-1 md:ml-64">
                {/* Mobile Header */}
                <div className="md:hidden bg-white shadow-sm px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 mr-3"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d={
                                        mobileMenuOpen
                                            ? 'M6 18L18 6M6 6l12 12'
                                            : 'M4 6h16M4 12h16M4 18h16'
                                    }
                                />
                            </svg>
                        </button>
                        <div className="text-lg font-semibold text-gray-800">STP Dashboard</div>
                    </div>

                    {/* Mobile TopNav Elements */}
                    <div className="flex items-center">
                        {/* Notifications */}
                        <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                />
                            </svg>
                        </button>

                        {/* User Profile */}
                        <div className="relative ml-3">
                            <button
                                onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                                className="flex items-center focus:outline-none"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium text-sm">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {mobileDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-55"
                                        onClick={() => setMobileDropdownOpen(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-60 ring-1 ring-black ring-opacity-5">
                                        {menuItems.map((item, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    item.action();
                                                    setMobileDropdownOpen(false);
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Top Navigation */}
                <TopNav />

                {/* Breadcrumb */}
                <Breadcrumb pageTitle={pageTitle} />

                {children}
            </div>
        </div>
    );
};

export default Layout;
