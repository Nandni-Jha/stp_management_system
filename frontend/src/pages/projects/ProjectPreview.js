import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faProjectDiagram,
    faEye,
    faCalendarAlt,
    faUser,
    faMapMarkerAlt,
    faMoneyBill,
    faPercent,
} from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import Modal from '../../components/Modal';

const ProjectPreview = ({ project, onClose }) => {
    if (!project) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-600/20';
            case 'completed':
                return 'bg-blue-100 text-blue-800 ring-1 ring-blue-600/20';
            case 'on_hold':
                return 'bg-amber-100 text-amber-800 ring-1 ring-amber-600/20';
            case 'cancelled':
                return 'bg-red-100 text-red-800 ring-1 ring-red-600/20';
            default:
                return 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20';
        }
    };

    const calculateProgress = () => {
        if (!project.start_date) return 0;
        if (project.status === 'completed') return 100;

        const start = moment(project.start_date);
        const end = project.end_date ? moment(project.end_date) : null;
        const now = moment();

        if (!end) return 0; // Ongoing project without end date

        if (now.isAfter(end)) return 100; // Project should be completed

        const totalDays = end.diff(start, 'days');
        const passedDays = now.diff(start, 'days');

        return Math.max(0, Math.min(100, Math.round((passedDays / totalDays) * 100)));
    };

    const calculateDuration = () => {
        if (!project.start_date) return 'N/A';

        const start = moment(project.start_date);
        const end = project.end_date ? moment(project.end_date) : null;

        if (!end) {
            // Ongoing project
            const daysSinceStart = moment().diff(start, 'days');
            return `${daysSinceStart} days (ongoing)`;
        }

        const days = end.diff(start, 'days');
        return `${days} days`;
    };

    const formatCurrency = (amount) => {
        return amount ? `$${parseFloat(amount).toLocaleString()}` : 'N/A';
    };

    const getTimeStatusText = () => {
        if (!project.start_date) return 'Not Started';

        const start = moment(project.start_date);
        const end = project.end_date ? moment(project.end_date) : null;
        const now = moment();

        if (now.isBefore(start)) {
            return 'Planning Phase';
        } else if (end && now.isAfter(end)) {
            return project.status === 'completed' ? 'Completed' : 'Overdue';
        } else if (!end && project.status === 'active') {
            return 'In Progress (Ongoing)';
        } else if (end && now.isBetween(start, end, null, '[]')) {
            return 'In Progress';
        } else {
            return 'Completed';
        }
    };

    const getTimeStatusColor = () => {
        const status = getTimeStatusText();

        if (status.includes('Planning')) return 'bg-blue-100 text-blue-800';
        if (status.includes('Progress')) return 'bg-green-100 text-green-800';
        if (status.includes('Completed')) return 'bg-emerald-100 text-emerald-800';
        if (status.includes('Overdue')) return 'bg-red-100 text-red-800';

        return 'bg-gray-100 text-gray-800';
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={project.name} size="xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <div className="p-3 rounded-full bg-primary-100 mr-4">
                        <FontAwesomeIcon
                            icon={faProjectDiagram}
                            className="w-8 h-8 text-primary-600"
                        />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">{project.name}</h3>
                        <p className="text-sm text-gray-600">Client: {project.client_name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span
                        className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full shadow-sm ${getStatusColor(project.status)}`}
                    >
                        {project.status?.replace('_', ' ').toUpperCase()}
                    </span>
                    <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTimeStatusColor()}`}
                    >
                        {getTimeStatusText()}
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all duration-200"
                        title="Close preview"
                    >
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
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">Project Progress</h4>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                            {calculateProgress()}%
                        </span>
                        {calculateProgress() === 100 && (
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        )}
                    </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300 text-xs text-white flex items-center justify-center font-semibold"
                        style={{ width: `${calculateProgress()}%` }}
                    >
                        {calculateProgress() > 20 &&
                            calculateProgress() < 90 &&
                            `${calculateProgress()}%`}
                    </div>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Duration</p>
                            <p className="text-lg font-bold text-gray-900">{calculateDuration()}</p>
                        </div>
                        <div className="p-2 rounded-full bg-blue-100">
                            <FontAwesomeIcon
                                icon={faCalendarAlt}
                                className="w-5 h-5 text-blue-600"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Location</p>
                            <p className="text-lg font-bold text-gray-900">
                                {project.location?.name || 'N/A'}
                            </p>
                        </div>
                        <div className="p-2 rounded-full bg-green-100">
                            <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                className="w-5 h-5 text-green-600"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Assets Used</p>
                            <p className="text-lg font-bold text-gray-900">
                                {project.assignments?.length || 0}
                            </p>
                        </div>
                        <div className="p-2 rounded-full bg-purple-100">
                            <FontAwesomeIcon
                                icon={faProjectDiagram}
                                className="w-5 h-5 text-purple-600"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Progress</p>
                            <p className="text-lg font-bold text-gray-900">
                                {calculateProgress()}%
                            </p>
                        </div>
                        <div className="p-2 rounded-full bg-amber-100">
                            <FontAwesomeIcon icon={faPercent} className="w-5 h-5 text-amber-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Project Information */}
                <div className="space-y-6">
                    <div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <FontAwesomeIcon icon={faEye} className="w-5 h-5 mr-2 text-gray-500" />
                            Project Details
                        </h4>
                        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Project Name
                                    </label>
                                    <div className="text-sm font-medium text-gray-900">
                                        {project.name}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Client
                                    </label>
                                    <div className="text-sm font-medium text-gray-900">
                                        {project.client_name || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Location
                                    </label>
                                    <div className="text-sm font-medium text-gray-900">
                                        {project.location?.name || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <span
                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status)}`}
                                    >
                                        {project.status?.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {project.description && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                                        {project.description}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <FontAwesomeIcon
                                icon={faCalendarAlt}
                                className="w-5 h-5 mr-2 text-gray-500"
                            />
                            Timeline
                        </h4>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Date
                                    </label>
                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                                        <FontAwesomeIcon
                                            icon={faCalendarAlt}
                                            className="w-5 h-5 text-blue-500"
                                        />
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {project.start_date
                                                    ? moment(project.start_date).format(
                                                          'MMM DD, YYYY'
                                                      )
                                                    : 'Not set'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Date
                                    </label>
                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                                        <FontAwesomeIcon
                                            icon={faCalendarAlt}
                                            className={`w-5 h-5 ${project.end_date ? 'text-green-500' : 'text-yellow-500'}`}
                                        />
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {project.end_date
                                                    ? moment(project.end_date).format(
                                                          'MMM DD, YYYY'
                                                      )
                                                    : 'Ongoing'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Assets & Financial Information */}
                <div className="space-y-6">
                    <div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <FontAwesomeIcon
                                icon={faMoneyBill}
                                className="w-5 h-5 mr-2 text-gray-500"
                            />
                            Financial Overview
                        </h4>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Total Budget
                                    </label>
                                    <div className="text-lg font-bold text-gray-900">
                                        {formatCurrency(project.budget)} {project.budget_currency}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Spent Amount
                                    </label>
                                    <div className="text-lg font-bold text-gray-900">
                                        {formatCurrency(project.spent_amount)}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Remaining Budget
                                    </label>
                                    <div
                                        className={`text-lg font-bold ${
                                            project.budget && project.spent_amount
                                                ? parseFloat(project.budget) -
                                                      parseFloat(project.spent_amount) >=
                                                  0
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                                : 'text-gray-900'
                                        }`}
                                    >
                                        {project.budget && project.spent_amount
                                            ? formatCurrency(
                                                  parseFloat(project.budget) -
                                                      parseFloat(project.spent_amount)
                                              )
                                            : 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {project.budget_utilization_percentage !== undefined && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Budget Utilization
                                    </label>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all duration-300 ${
                                                project.budget_utilization_percentage > 80
                                                    ? 'bg-red-500'
                                                    : project.budget_utilization_percentage > 60
                                                      ? 'bg-yellow-500'
                                                      : 'bg-green-500'
                                            }`}
                                            style={{
                                                width: `${project.budget_utilization_percentage}%`,
                                            }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                                        <span>{project.budget_utilization_percentage}% used</span>
                                        <span>
                                            {project.budget_utilization_percentage > 100
                                                ? 'Over budget'
                                                : project.budget_utilization_percentage > 80
                                                  ? 'High utilization'
                                                  : 'On track'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {project.budget_notes && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Budget Notes
                                    </label>
                                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                                        {project.budget_notes}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Assets Assigned to this Project */}
                    <div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <FontAwesomeIcon icon={faUser} className="w-5 h-5 mr-2 text-gray-500" />
                            Assets & Resources ({project.assignments?.length || 0})
                        </h4>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            {project.assignments && project.assignments.length > 0 ? (
                                <div className="space-y-3">
                                    {project.assignments.slice(0, 5).map((assignment, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                                        >
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                                    <FontAwesomeIcon
                                                        icon={
                                                            assignment.asset?.asset_code?.charAt(
                                                                0
                                                            ) || 'A'
                                                        }
                                                        className="w-4 h-4 text-orange-600"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {assignment.asset?.name}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {assignment.operator?.name ||
                                                            'No operator assigned'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {assignment.usage_type?.replace('_', ' ')}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {assignment.assigned_from
                                                        ? moment(assignment.assigned_from).format(
                                                              'MM/DD'
                                                          )
                                                        : ''}
                                                    {assignment.assigned_to
                                                        ? ` - ${moment(assignment.assigned_to).format('MM/DD')}`
                                                        : ' (ongoing)'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {project.assignments.length > 5 && (
                                        <div className="text-center text-sm text-gray-500 pt-2">
                                            +{project.assignments.length - 5} more assignments
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    <FontAwesomeIcon
                                        icon={faUser}
                                        className="w-8 h-8 text-gray-300 mb-2"
                                    />
                                    <p>No assets assigned to this project</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {project.notes && (
                        <div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-4">
                                Additional Notes
                            </h4>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="text-sm text-amber-800">{project.notes}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end space-x-3 pt-8 border-t border-gray-200 mt-8">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
                >
                    Close
                </button>
            </div>
        </Modal>
    );
};

export default ProjectPreview;
