import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants';
import { getImageUrl } from '../utils/imageHelper';

const TopNav = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate(ROUTES.LOGIN);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const menuItems = [
        { label: 'Profile', action: () => navigate(ROUTES.PROFILE) },
        { label: 'Settings', action: () => navigate(ROUTES.SETTINGS) },
        { label: 'Logout', action: handleLogout },
    ];

    return (
        <nav className="hidden md:block bg-white shadow-sm sticky top-0 z-40 md:z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-3">
                <div className="flex justify-end items-center">
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
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center space-x-3 focus:outline-none"
                        >
                            {user?.profile_image ? (
                                <img
                                    src={getImageUrl(user.profile_image)}
                                    alt={user?.name || 'User'}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium text-sm">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                            )}
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setDropdownOpen(false)}
                                ></div>
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5">
                                    {menuItems.map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                item.action();
                                                setDropdownOpen(false);
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
        </nav>
    );
};

export default TopNav;
