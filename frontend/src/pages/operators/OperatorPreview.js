import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHardHat,
    faEye,
    faCalendarAlt,
    faUser,
    faIdCard,
    faPhone,
    faEnvelope,
    faMapMarkerAlt,
} from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

const OperatorPreview = ({ operator, onClose }) => {
    if (!operator) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-600/20';
            case 'inactive':
                return 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20';
            case 'suspended':
                return 'bg-red-100 text-red-800 ring-1 ring-red-600/20';
            default:
                return 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20';
        }
    };

    const getLicenseStatusColor = (issueDate, expiryDate) => {
        if (!expiryDate) return 'bg-gray-100 text-gray-800';

        const now = moment();
        const expiryMoment = moment(expiryDate);
        const monthsToExpiry = expiryMoment.diff(now, 'months');

        if (monthsToExpiry < 0) {
            return 'bg-red-100 text-red-800'; // Expired
        } else if (monthsToExpiry <= 3) {
            return 'bg-amber-100 text-amber-800'; // Expiring soon
        } else {
            return 'bg-green-100 text-green-800'; // Valid
        }
    };

    const calculateExperience = (hireDate) => {
        if (!hireDate) return 'N/A';

        const years = moment().diff(moment(hireDate), 'years');
        const months = moment().diff(moment(hireDate), 'months') % 12;

        if (years > 0) {
            return `${years} yr${years > 1 ? 's' : ''} ${months} mo${months !== 1 ? 's' : ''}`;
        } else {
            return `${months} month${months !== 1 ? 's' : ''}`;
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
                                    icon={faHardHat}
                                    className="w-8 h-8 text-primary-600"
                                />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {operator.name}
                                </h3>
                                <p className="text-sm text-gray-600 font-medium">
                                    {operator.employee_id || 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span
                                className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full shadow-sm ${getStatusColor(operator.status)}`}
                            >
                                {operator.status?.toUpperCase() || 'UNKNOWN'}
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

                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Experience</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {calculateExperience(operator.hire_date)}
                                    </p>
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
                                    <p className="text-sm text-gray-600 font-medium">
                                        License Status
                                    </p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {operator.license_expiry
                                            ? moment(operator.license_expiry).isAfter(moment())
                                                ? 'Valid'
                                                : 'Expired'
                                            : 'N/A'}
                                    </p>
                                </div>
                                <div className="p-2 rounded-full bg-green-100">
                                    <FontAwesomeIcon
                                        icon={faIdCard}
                                        className="w-5 h-5 text-green-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Contact</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {operator.phone || 'N/A'}
                                    </p>
                                </div>
                                <div className="p-2 rounded-full bg-purple-100">
                                    <FontAwesomeIcon
                                        icon={faPhone}
                                        className="w-5 h-5 text-purple-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Location</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {operator.location || 'N/A'}
                                    </p>
                                </div>
                                <div className="p-2 rounded-full bg-amber-100">
                                    <FontAwesomeIcon
                                        icon={faMapMarkerAlt}
                                        className="w-5 h-5 text-amber-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Personal Information */}
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <FontAwesomeIcon
                                        icon={faUser}
                                        className="w-5 h-5 mr-2 text-gray-500"
                                    />
                                    Personal Information
                                </h4>
                                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Employee ID
                                            </label>
                                            <div className="text-sm font-medium text-gray-900 font-mono">
                                                {operator.employee_id || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Job Title
                                            </label>
                                            <div className="text-sm font-medium text-gray-900">
                                                {operator.job_title || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Department
                                            </label>
                                            <div className="text-sm font-medium text-gray-900">
                                                {operator.department || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Hire Date
                                            </label>
                                            <div className="text-sm font-medium text-gray-900">
                                                {operator.hire_date
                                                    ? moment(operator.hire_date).format(
                                                          'MMM DD, YYYY'
                                                      )
                                                    : 'N/A'}
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Full Name
                                            </label>
                                            <div className="text-sm font-medium text-gray-900">
                                                {operator.name}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address if available */}
                                    {operator.address && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Address
                                            </label>
                                            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                                                {operator.address}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <FontAwesomeIcon
                                        icon={faIdCard}
                                        className="w-5 h-5 mr-2 text-gray-500"
                                    />
                                    License Information
                                </h4>
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                License Number
                                            </label>
                                            <div className="text-sm font-medium text-gray-900 font-mono">
                                                {operator.license_number || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                License Type
                                            </label>
                                            <div className="text-sm font-medium text-gray-900">
                                                {operator.license_type || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                License Issue Date
                                            </label>
                                            <div className="text-sm font-medium text-gray-900">
                                                {operator.license_issue_date
                                                    ? moment(operator.license_issue_date).format(
                                                          'MMM DD, YYYY'
                                                      )
                                                    : 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                License Expiry Date
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {operator.license_expiry
                                                        ? moment(operator.license_expiry).format(
                                                              'MMM DD, YYYY'
                                                          )
                                                        : 'N/A'}
                                                </div>
                                                {operator.license_expiry && (
                                                    <span
                                                        className={`px-2 py-1 inline-flex text-xs leading-3 font-semibold rounded-full ${getLicenseStatusColor(
                                                            operator.license_issue_date,
                                                            operator.license_expiry
                                                        )}`}
                                                    >
                                                        {moment(operator.license_expiry).isAfter(
                                                            moment()
                                                        )
                                                            ? 'VALID'
                                                            : 'EXPIRED'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Contact & Additional Information */}
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <FontAwesomeIcon
                                        icon={faEnvelope}
                                        className="w-5 h-5 mr-2 text-gray-500"
                                    />
                                    Contact Information
                                </h4>
                                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number
                                            </label>
                                            <div className="text-sm font-medium text-gray-900 flex items-center">
                                                {operator.phone ? (
                                                    <>
                                                        <FontAwesomeIcon
                                                            icon={faPhone}
                                                            className="w-4 h-4 mr-2 text-green-500"
                                                        />
                                                        {operator.phone}
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 italic">
                                                        No phone number provided
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email Address
                                            </label>
                                            <div className="text-sm font-medium text-gray-900 flex items-center">
                                                {operator.email ? (
                                                    <>
                                                        <FontAwesomeIcon
                                                            icon={faEnvelope}
                                                            className="w-4 h-4 mr-2 text-blue-500"
                                                        />
                                                        {operator.email}
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 italic">
                                                        No email provided
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Emergency Contact
                                            </label>
                                            <div className="text-sm font-medium text-gray-900">
                                                {operator.emergency_contact || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Skills & Certifications */}
                            {operator.skills && (
                                <div>
                                    <h4 className="text-xl font-semibold text-gray-900 mb-4">
                                        Skills & Certifications
                                    </h4>
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="text-sm text-gray-700">
                                            {operator.skills}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {operator.notes && (
                                <div>
                                    <h4 className="text-xl font-semibold text-gray-900 mb-4">
                                        Additional Notes
                                    </h4>
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                        <div className="text-sm text-amber-800">
                                            {operator.notes}
                                        </div>
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
                </div>
            </div>
        </div>
    );
};

export default OperatorPreview;
