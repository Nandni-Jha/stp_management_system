import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Layout from '../../components/Layout';
import dashboardService from '../../services/dashboard.service';

const Dashboard = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await dashboardService.getDashboardData();
            if (response.success) {
                setDashboardData(response.data);
            } else {
                setError(response.message || 'Failed to load dashboard data');
            }
        } catch (err) {
            setError(err.message || 'An error occurred while loading dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const isOperator = user?.type === 'operator';
    const operatorInfo = dashboardData?.operator;
    const stats = dashboardData?.stats;
    const assignedProjects = dashboardData?.assigned_projects || [];

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="text-center py-10">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* Welcome Section */}
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold text-gray-800 mb-2">
                        {isOperator ? 'Operator Dashboard' : 'Dashboard Overview'}
                    </h2>
                    <p className="text-gray-600">Welcome back, {user?.name}!</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* User/Operator Profile Card */}
                    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-200 flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                className="w-7 h-7 text-white"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-500 mb-2">
                                {isOperator ? 'Operator Profile' : 'User Profile'}
                            </h3>
                            <p className="text-2xl font-bold text-gray-800 mb-1">{user?.name}</p>
                            <p className="text-sm text-gray-400">{user?.email}</p>
                            {isOperator && operatorInfo?.job_title && (
                                <p className="text-sm text-primary-500">{operatorInfo.job_title}</p>
                            )}
                        </div>
                    </div>

                    {/* Status Card */}
                    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-200 flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                className="w-7 h-7 text-white"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                            <p className="text-2xl font-bold text-gray-800 mb-1">
                                {isOperator ? operatorInfo?.status || 'Active' : 'Active'}
                            </p>
                            <p className="text-sm text-gray-400">Account is verified</p>
                        </div>
                    </div>

                    {/* Assignments Card */}
                    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-200 flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                className="w-7 h-7 text-white"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Assignments</h3>
                            <p className="text-2xl font-bold text-gray-800 mb-1">
                                {stats?.active_assignments || 0}
                            </p>
                            <p className="text-sm text-gray-400">
                                {stats?.total_assignments || 0} total assignments
                            </p>
                        </div>
                    </div>
                </div>

                {/* Operator Additional Info */}
                {isOperator && operatorInfo && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {operatorInfo.employee_id && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">
                                    Employee ID
                                </h3>
                                <p className="text-lg font-bold text-gray-800">
                                    {operatorInfo.employee_id}
                                </p>
                            </div>
                        )}
                        {operatorInfo.department && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">
                                    Department
                                </h3>
                                <p className="text-lg font-bold text-gray-800">
                                    {operatorInfo.department}
                                </p>
                            </div>
                        )}
                        {operatorInfo.phone && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Phone</h3>
                                <p className="text-lg font-bold text-gray-800">
                                    {operatorInfo.phone}
                                </p>
                            </div>
                        )}
                        {operatorInfo.license_number && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">License</h3>
                                <p className="text-lg font-bold text-gray-800">
                                    {operatorInfo.license_number}
                                </p>
                                <p className="text-sm text-gray-400">{operatorInfo.license_type}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Assigned Projects Section (For Operators) */}
                {isOperator && (
                    <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Assigned Projects</h3>

                        {assignedProjects.length === 0 ? (
                            <div className="text-center py-8">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    className="w-16 h-16 text-gray-300 mx-auto mb-4"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                                <p className="text-gray-500">No active project assignments</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Project
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Client
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Asset
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Assigned Date
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {assignedProjects.map((assignment) => (
                                            <tr key={assignment.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {assignment.project?.name || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {assignment.project?.client_name || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {assignment.asset?.name || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {assignment.asset?.asset_code}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            assignment.project?.status === 'active'
                                                                ? 'bg-green-100 text-green-800'
                                                                : assignment.project?.status ===
                                                                    'completed'
                                                                  ? 'bg-blue-100 text-blue-800'
                                                                  : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                    >
                                                        {assignment.project?.status || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {assignment.assigned_from
                                                        ? new Date(
                                                              assignment.assigned_from
                                                          ).toLocaleDateString()
                                                        : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Non-operator dashboard content */}
                {!isOperator && (
                    <div className="bg-white rounded-xl shadow-md p-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Getting Started</h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            This is your main dashboard. You can add more features, widgets, and
                            functionality based on your application requirements.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <span className="text-primary-500 font-bold mt-0.5">✓</span>
                                <span className="text-gray-700">View and manage your profile</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-primary-500 font-bold mt-0.5">✓</span>
                                <span className="text-gray-700">Access application features</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-primary-500 font-bold mt-0.5">✓</span>
                                <span className="text-gray-700">Monitor your activities</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-primary-500 font-bold mt-0.5">✓</span>
                                <span className="text-gray-700">Customize your experience</span>
                            </li>
                        </ul>
                    </div>
                )}
            </main>
        </Layout>
    );
};

export default Dashboard;
