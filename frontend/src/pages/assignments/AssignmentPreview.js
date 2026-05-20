import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLink,
    faEye,
    faCalendarAlt,
    faClock,
    faUser,
    faTruckPickup,
    faProjectDiagram,
} from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

const AssignmentPreview = ({ assignment, onClose }) => {
    if (!assignment) return null;

    const isCurrentlyAssigned = () => {
        const now = moment();
        const fromDate = moment(assignment.assigned_from);
        const toDate = assignment.assigned_to ? moment(assignment.assigned_to) : null;

        if (toDate) {
            return now.isBetween(fromDate, toDate, null, '[]');
        } else {
            return now.isAfter(fromDate);
        }
    };

    const calculateDuration = () => {
        const fromDate = moment(assignment.assigned_from);
        const toDate = assignment.assigned_to ? moment(assignment.assigned_to) : null;

        if (toDate) {
            const hours = toDate.diff(fromDate, 'hours');
            const days = Math.floor(hours / 24);
            const remainingHours = hours % 24;

            if (days > 0) {
                return `${days} day${days > 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
            } else {
                return `${hours} hour${hours !== 1 ? 's' : ''}`;
            }
        } else {
            const hoursElapsed = moment().diff(fromDate, 'hours');
            return `${hoursElapsed} hour${hoursElapsed !== 1 ? 's' : ''} elapsed (ongoing)`;
        }
    };

    const getUsageTypeColor = (type) => {
        return type === 'full_day'
            ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-600/20'
            : 'bg-purple-100 text-purple-800 ring-1 ring-purple-600/20';
    };

    const getAssignmentStatusColor = () => {
        if (assignment.assigned_to) {
            // Check if assignment has ended
            const endDate = moment(assignment.assigned_to);
            const now = moment();
            return now.isAfter(endDate)
                ? 'bg-gray-100 text-gray-800'
                : 'bg-green-100 text-green-800';
        } else {
            // Ongoing assignment
            return 'bg-blue-100 text-blue-800';
        }
    };

    const getAssignmentStatusText = () => {
        if (assignment.assigned_to) {
            const endDate = moment(assignment.assigned_to);
            const now = moment();
            return now.isAfter(endDate) ? 'COMPLETED' : 'ACTIVE';
        } else {
            return 'ONGOING';
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
                <div className="mt-3">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-primary-100 mr-4">
                                <FontAwesomeIcon
                                    icon={faLink}
                                    className="w-8 h-8 text-primary-600"
                                />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    Asset-Operator Assignment
                                </h3>
                                <p className="text-sm text-gray-600">ID: {assignment.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span
                                className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full shadow-sm ${getAssignmentStatusColor()}`}
                            >
                                {getAssignmentStatusText()}
                            </span>
                            {isCurrentlyAssigned() && (
                                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full animate-pulse">
                                    CURRENTLY ACTIVE
                                </span>
                            )}
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

                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">
                                        Assignment Duration
                                    </p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {calculateDuration()}
                                    </p>
                                </div>
                                <div className="p-2 rounded-full bg-blue-100">
                                    <FontAwesomeIcon
                                        icon={faClock}
                                        className="w-5 h-5 text-blue-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Usage Type</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {assignment.usage_type?.replace('_', ' ').toUpperCase()}
                                    </p>
                                </div>
                                <div className="p-2 rounded-full bg-green-100">
                                    <FontAwesomeIcon
                                        icon={faCalendarAlt}
                                        className="w-5 h-5 text-green-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">
                                        Asset Status
                                    </p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {assignment.asset?.status
                                            ?.replace('_', ' ')
                                            .toUpperCase() || 'UNKNOWN'}
                                    </p>
                                </div>
                                <div className="p-2 rounded-full bg-purple-100">
                                    <FontAwesomeIcon
                                        icon={faTruckPickup}
                                        className="w-5 h-5 text-purple-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">
                                        Operator Status
                                    </p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {assignment.operator?.status?.toUpperCase() || 'UNKNOWN'}
                                    </p>
                                </div>
                                <div className="p-2 rounded-full bg-amber-100">
                                    <FontAwesomeIcon
                                        icon={faUser}
                                        className="w-5 h-5 text-amber-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Asset Information */}
                        <div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <FontAwesomeIcon
                                    icon={faTruckPickup}
                                    className="w-5 h-5 mr-2 text-gray-500"
                                />
                                Asset Details
                            </h4>
                            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                                        <FontAwesomeIcon
                                            icon={faTruckPickup}
                                            className="w-6 h-6 text-orange-600"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h5 className="text-lg font-medium text-gray-900 truncate">
                                            {assignment.asset?.name || 'N/A'}
                                        </h5>
                                        <p className="text-sm text-gray-600 font-mono">
                                            {assignment.asset?.asset_code || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <hr className="border-gray-200" />

                                <div className="space-y-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Category
                                        </label>
                                        <p className="text-sm font-medium text-gray-900">
                                            {assignment.asset?.category?.name || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Type
                                        </label>
                                        <p className="text-sm font-medium text-gray-900">
                                            {assignment.asset?.asset_type?.name || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Location
                                        </label>
                                        <p className="text-sm font-medium text-gray-900">
                                            {assignment.asset?.current_location?.name || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Operator Information */}
                        <div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <FontAwesomeIcon
                                    icon={faUser}
                                    className="w-5 h-5 mr-2 text-gray-500"
                                />
                                Operator Details
                            </h4>
                            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                                        <FontAwesomeIcon
                                            icon={faUser}
                                            className="w-6 h-6 text-green-600"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h5 className="text-lg font-medium text-gray-900 truncate">
                                            {assignment.operator?.name || 'N/A'}
                                        </h5>
                                        <p className="text-sm text-gray-600">
                                            {assignment.operator?.employee_id || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <hr className="border-gray-200" />

                                <div className="space-y-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Job Title
                                        </label>
                                        <p className="text-sm font-medium text-gray-900">
                                            {assignment.operator?.job_title || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Department
                                        </label>
                                        <p className="text-sm font-medium text-gray-900">
                                            {assignment.operator?.department || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            License
                                        </label>
                                        <p className="text-sm font-medium text-gray-900">
                                            {assignment.operator?.license_number || 'N/A'}
                                            {assignment.operator?.license_expiry && (
                                                <span
                                                    className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                                                        moment(
                                                            assignment.operator.license_expiry
                                                        ).isAfter(moment())
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}
                                                >
                                                    {moment(
                                                        assignment.operator.license_expiry
                                                    ).isAfter(moment())
                                                        ? 'Valid'
                                                        : 'Expired'}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Project Information */}
                        <div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <FontAwesomeIcon
                                    icon={faProjectDiagram}
                                    className="w-5 h-5 mr-2 text-gray-500"
                                />
                                Project Details
                            </h4>
                            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                        <FontAwesomeIcon
                                            icon={faProjectDiagram}
                                            className="w-6 h-6 text-blue-600"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h5 className="text-lg font-medium text-gray-900 truncate">
                                            {assignment.project?.name || 'N/A'}
                                        </h5>
                                        <p className="text-sm text-gray-600">
                                            {assignment.project?.client_name || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <hr className="border-gray-200" />

                                <div className="space-y-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Status
                                        </label>
                                        <p className="text-sm font-medium text-gray-900 capitalize">
                                            {assignment.project?.status?.replace('_', ' ') || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Location
                                        </label>
                                        <p className="text-sm font-medium text-gray-900">
                                            {assignment.project?.location?.name || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Duration
                                        </label>
                                        <p className="text-sm font-medium text-gray-900">
                                            {assignment.project?.start_date &&
                                            assignment.project?.end_date
                                                ? `${moment(assignment.project.start_date).format('MMM DD, YYYY')} - ${
                                                      assignment.project.end_date
                                                          ? moment(
                                                                assignment.project.end_date
                                                            ).format('MMM DD, YYYY')
                                                          : 'Ongoing'
                                                  }`
                                                : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Assignment Timeline */}
                    <div className="mt-8">
                        <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <FontAwesomeIcon
                                icon={faCalendarAlt}
                                className="w-5 h-5 mr-2 text-gray-500"
                            />
                            Assignment Timeline
                        </h4>
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Date & Time
                                    </label>
                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                                        <FontAwesomeIcon
                                            icon={faCalendarAlt}
                                            className="w-5 h-5 text-blue-500"
                                        />
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {moment(assignment.assigned_from).format(
                                                    'MMM DD, YYYY'
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {moment(assignment.assigned_from).format(
                                                    'HH:mm:ss'
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Date & Time
                                    </label>
                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                                        <FontAwesomeIcon
                                            icon={faCalendarAlt}
                                            className={`w-5 h-5 ${assignment.assigned_to ? 'text-green-500' : 'text-yellow-500'}`}
                                        />
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {assignment.assigned_to
                                                    ? moment(assignment.assigned_to).format(
                                                          'MMM DD, YYYY'
                                                      )
                                                    : 'Ongoing Assignment'}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {assignment.assigned_to
                                                    ? moment(assignment.assigned_to).format(
                                                          'HH:mm:ss'
                                                      )
                                                    : 'No end date specified'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                </div>
            </div>
        </div>
    );
};

export default AssignmentPreview;
