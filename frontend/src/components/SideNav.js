import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faGauge,
    faUsers,
    faUserGear,
    faTruckPickup,
    faHardHat,
    faMapMarkerAlt,
    faGasPump,
    faLink,
    faProjectDiagram,
    faBuilding,
} from '@fortawesome/free-solid-svg-icons';

const SideNav = ({ onClose }) => {
    const fleetManagementItems = [
        {
            path: ROUTES.PROJECTS,
            label: 'Projects',
            icon: <FontAwesomeIcon icon={faProjectDiagram} className="w-5 h-5" />,
        },
        {
            path: ROUTES.ASSIGNMENTS,
            label: 'Assignments',
            icon: <FontAwesomeIcon icon={faLink} className="w-5 h-5" />,
        },
        {
            path: ROUTES.ASSETS,
            label: 'Assets',
            icon: <FontAwesomeIcon icon={faTruckPickup} className="w-5 h-5" />,
        },
        {
            path: ROUTES.OPERATORS,
            label: 'Operators',
            icon: <FontAwesomeIcon icon={faHardHat} className="w-5 h-5" />,
        },
        {
            path: ROUTES.LOCATIONS,
            label: 'Locations',
            icon: <FontAwesomeIcon icon={faMapMarkerAlt} className="w-5 h-5" />,
        },
        {
            path: ROUTES.FUEL_LOGS,
            label: 'Fuel Logs',
            icon: <FontAwesomeIcon icon={faGasPump} className="w-5 h-5" />,
        },
    ];

    const systemManagementItems = [
        {
            path: ROUTES.CUSTOMERS,
            label: 'Customers',
            icon: <FontAwesomeIcon icon={faUsers} className="w-5 h-5" />,
        },
        {
            path: ROUTES.VENDORS,
            label: 'Vendors',
            icon: <FontAwesomeIcon icon={faBuilding} className="w-5 h-5" />,
        },
        {
            path: ROUTES.LABORS,
            label: 'Labors',
            icon: <FontAwesomeIcon icon={faHardHat} className="w-5 h-5" />,
        },
        {
            path: ROUTES.USERS,
            label: 'Users',
            icon: <FontAwesomeIcon icon={faUserGear} className="w-5 h-5" />,
        },
    ];

    return (
        <div className="w-64 bg-white shadow-lg min-h-screen flex flex-col">
            {/* Logo/Brand */}
            <div className="px-6 py-4 border-b border-gray-200">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                    STP Dashboard
                </h1>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-4 py-6">
                <div className="space-y-4">
                    {/* Dashboard */}
                    <ul className="space-y-2">
                        <li>
                            <NavLink
                                to={ROUTES.DASHBOARD}
                                onClick={() => onClose && onClose()}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 rounded-lg transition-all duration-200 hover:bg-primary-50 hover:text-primary-600 ${
                                        isActive ? 'bg-primary-500 text-white' : 'text-gray-700'
                                    }`
                                }
                            >
                                <FontAwesomeIcon icon={faGauge} className="w-5 h-5 mr-3" />
                                <span className="font-medium">Dashboard</span>
                            </NavLink>
                        </li>
                    </ul>

                    {/* Fleet Management Section */}
                    <div>
                        <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Fleet Management
                        </h3>
                        <ul className="mt-2 space-y-1">
                            {fleetManagementItems.map((item) => (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        onClick={() => onClose && onClose()}
                                        className={({ isActive }) =>
                                            `flex items-center px-4 py-3 rounded-lg transition-all duration-200 hover:bg-primary-50 hover:text-primary-600 ${
                                                isActive
                                                    ? 'bg-primary-500 text-white'
                                                    : 'text-gray-700'
                                            }`
                                        }
                                    >
                                        <span className="mr-3">{item.icon}</span>
                                        <span className="font-medium">{item.label}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* System Management Section */}
                    <div>
                        <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            System Management
                        </h3>
                        <ul className="mt-2 space-y-1">
                            {systemManagementItems.map((item) => (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        onClick={() => onClose && onClose()}
                                        className={({ isActive }) =>
                                            `flex items-center px-4 py-3 rounded-lg transition-all duration-200 hover:bg-primary-50 hover:text-primary-600 ${
                                                isActive
                                                    ? 'bg-primary-500 text-white'
                                                    : 'text-gray-700'
                                            }`
                                        }
                                    >
                                        <span className="mr-3">{item.icon}</span>
                                        <span className="font-medium">{item.label}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Bottom section can be used for user profile or logout if needed */}
        </div>
    );
};

export default SideNav;
