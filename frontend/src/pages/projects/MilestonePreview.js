import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarAlt,
    faClock,
    faCheckCircle,
    faExclamationTriangle,
    faListUl,
    faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import Modal from '../../components/Modal';

const MilestonePreview = ({ milestone, onClose }) => {
    if (!milestone) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 ring-1 ring-blue-600/20';
            case 'completed':
                return 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-600/20';
            case 'delayed':
                return 'bg-red-100 text-red-800 ring-1 ring-red-600/20';
            default:
                return 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20';
        }
    };

    const calculateDaysUntil = (targetDate) => {
        const target = moment(targetDate);
        const today = moment();
        const diff = target.diff(today, 'days');

        if (diff < 0) return `Overdue by ${Math.abs(diff)} days`;
        if (diff === 0) return 'Due today';
        if (diff === 1) return 'Due tomorrow';
        return `Due in ${diff} days`;
    };

    const calculateProgress = () => {
        if (milestone.status === 'completed') return 100;
        if (milestone.status === 'pending') return 0;

        // For in_progress, calculate based on time elapsed
        const start = moment(milestone.project?.start_date || milestone.target_date);
        const end = moment(milestone.target_date);
        const now = moment();

        if (now.isAfter(end)) return 100;

        const totalDays = end.diff(start, 'days');
        const passedDays = now.diff(start, 'days');

        return Math.max(0, Math.min(100, Math.round((passedDays / totalDays) * 100)));
    };

    const getDaysColor = (targetDate) => {
        const days = moment(targetDate).diff(moment(), 'days');
        if (days < 0) return 'text-red-600';
        if (days <= 7) return 'text-orange-600';
        return 'text-gray-600';
    };

    const getBudgetColor = (utilization) => {
        if (utilization >= 100) return 'text-red-600';
        if (utilization >= 80) return 'text-orange-600';
        return 'text-green-600';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount || 0);
    };

    const getCategoryUtilizationPercentage = (category) => {
        const budget = 0;
        const spent = 0;
        if (budget > 0) {
            return Math.round((spent / budget) * 100);
        }
        return 0;
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={milestone.name} size="xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <div
                        className={`p-3 rounded-full mr-4 ${
                            milestone.status === 'completed'
                                ? 'bg-emerald-100'
                                : milestone.status === 'in_progress'
                                  ? 'bg-blue-100'
                                  : milestone.status === 'delayed'
                                    ? 'bg-red-100'
                                    : 'bg-gray-100'
                        }`}
                    >
                        <FontAwesomeIcon
                            icon={
                                milestone.status === 'completed'
                                    ? faCheckCircle
                                    : milestone.status === 'in_progress'
                                      ? faClock
                                      : milestone.status === 'delayed'
                                        ? faExclamationTriangle
                                        : faListUl
                            }
                            className={`w-8 h-8 ${
                                milestone.status === 'completed'
                                    ? 'text-emerald-600'
                                    : milestone.status === 'in_progress'
                                      ? 'text-blue-600'
                                      : milestone.status === 'delayed'
                                        ? 'text-red-600'
                                        : 'text-gray-600'
                            }`}
                        />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">{milestone.name}</h3>
                        <p className="text-sm text-gray-600">
                            Project: {milestone.project?.name || 'Unknown'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span
                        className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full shadow-sm ${getStatusColor(milestone.status)}`}
                    >
                        {milestone.status?.replace('_', ' ').toUpperCase()}
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
                    <h4 className="text-lg font-semibold text-gray-900">Milestone Progress</h4>
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
                        className={`bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 text-xs text-white flex items-center justify-center font-semibold`}
                        style={{ width: `${calculateProgress()}%` }}
                    >
                        {calculateProgress() > 20 &&
                            calculateProgress() < 90 &&
                            `${calculateProgress()}%`}
                    </div>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Target Date</p>
                            <p className="text-lg font-bold text-gray-900">
                                {moment(milestone.target_date).format('MMM DD, YYYY')}
                            </p>
                        </div>
                        <div className="p-2 rounded-full bg-blue-100">
                            <FontAwesomeIcon
                                icon={faCalendarAlt}
                                className="w-5 h-5 text-blue-600"
                            />
                        </div>
                    </div>
                    <div className={`text-xs mt-1 ${getDaysColor(milestone.target_date)}`}>
                        {calculateDaysUntil(milestone.target_date)}
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Status</p>
                            <p className="text-lg font-bold text-gray-900">
                                {milestone.status?.replace('_', ' ').toUpperCase()}
                            </p>
                        </div>
                        <div className={`p-2 rounded-full ${getStatusColor(milestone.status)}`}>
                            <FontAwesomeIcon
                                icon={
                                    milestone.status === 'completed'
                                        ? faCheckCircle
                                        : milestone.status === 'in_progress'
                                          ? faClock
                                          : milestone.status === 'delayed'
                                            ? faExclamationTriangle
                                            : faListUl
                                }
                                className={`w-5 h-5 ${
                                    milestone.status === 'completed'
                                        ? 'text-emerald-600'
                                        : milestone.status === 'in_progress'
                                          ? 'text-blue-600'
                                          : milestone.status === 'delayed'
                                            ? 'text-red-600'
                                            : 'text-gray-600'
                                }`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Budget Categories Overview */}
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <svg
                        className="w-5 h-5 mr-2 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Budget Categories
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-600">
                                Budget Summary
                            </span>
                            <span className="text-sm text-gray-500">Total</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total Budget</span>
                                <span className="text-lg font-bold text-gray-900">
                                    {formatCurrency(0)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total Spent</span>
                                <span className="text-lg font-bold text-gray-900">
                                    {formatCurrency(0)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Remaining</span>
                                <span className={`text-lg font-bold ${getBudgetColor(0)}`}>
                                    {formatCurrency(0)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-600">Utilization</span>
                            <span className="text-sm text-gray-500">Progress</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Overall Utilization</span>
                                <span className={`text-lg font-bold ${getBudgetColor(0)}`}>0%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full ${getBudgetColor(0)}`}
                                    style={{
                                        width: `0%`,
                                    }}
                                ></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                <span>
                                    Material: {getCategoryUtilizationPercentage('Material')}%
                                </span>
                                <span>Labor: {getCategoryUtilizationPercentage('Labor')}%</span>
                                <span>
                                    Sub-Contractor:{' '}
                                    {getCategoryUtilizationPercentage('Sub-Contractor')}%
                                </span>
                                <span>
                                    Equipment: {getCategoryUtilizationPercentage('Equipment')}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Category Breakdown</h5>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-blue-600 font-medium">Material</span>
                                <span className="text-xs text-blue-800">
                                    {getCategoryUtilizationPercentage('Material')}%
                                </span>
                            </div>
                            <div className="mt-1 text-sm font-bold text-blue-900">
                                {formatCurrency(0)} / {formatCurrency(0)}
                            </div>
                            <div className="w-full bg-blue-200 rounded-full h-1.5 mt-1">
                                <div
                                    className="bg-blue-600 h-1.5 rounded-full"
                                    style={{
                                        width: `${Math.min(getCategoryUtilizationPercentage('Material'), 100)}%`,
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div className="bg-green-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-green-600 font-medium">Labor</span>
                                <span className="text-xs text-green-800">
                                    {getCategoryUtilizationPercentage('Labor')}%
                                </span>
                            </div>
                            <div className="mt-1 text-sm font-bold text-green-900">
                                {formatCurrency(0)} / {formatCurrency(0)}
                            </div>
                            <div className="w-full bg-green-200 rounded-full h-1.5 mt-1">
                                <div
                                    className="bg-green-600 h-1.5 rounded-full"
                                    style={{
                                        width: `${Math.min(getCategoryUtilizationPercentage('Labor'), 100)}%`,
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div className="bg-purple-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-purple-600 font-medium">
                                    Sub-Contractor
                                </span>
                                <span className="text-xs text-purple-800">
                                    {getCategoryUtilizationPercentage('Sub-Contractor')}%
                                </span>
                            </div>
                            <div className="mt-1 text-sm font-bold text-purple-900">
                                {formatCurrency(0)} / {formatCurrency(0)}
                            </div>
                            <div className="w-full bg-purple-200 rounded-full h-1.5 mt-1">
                                <div
                                    className="bg-purple-600 h-1.5 rounded-full"
                                    style={{
                                        width: `${Math.min(getCategoryUtilizationPercentage('Sub-Contractor'), 100)}%`,
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div className="bg-orange-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-orange-600 font-medium">
                                    Equipment
                                </span>
                                <span className="text-xs text-orange-800">
                                    {getCategoryUtilizationPercentage('Equipment')}%
                                </span>
                            </div>
                            <div className="mt-1 text-sm font-bold text-orange-900">
                                {formatCurrency(0)} / {formatCurrency(0)}
                            </div>
                            <div className="w-full bg-orange-200 rounded-full h-1.5 mt-1">
                                <div
                                    className="bg-orange-600 h-1.5 rounded-full"
                                    style={{
                                        width: `${Math.min(getCategoryUtilizationPercentage('Equipment'), 100)}%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Milestone Information */}
                <div className="space-y-6">
                    <div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <FontAwesomeIcon
                                icon={faInfoCircle}
                                className="w-5 h-5 mr-2 text-gray-500"
                            />
                            Milestone Details
                        </h4>
                        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Milestone Name
                                    </label>
                                    <div className="text-sm font-medium text-gray-900">
                                        {milestone.name}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <span
                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(milestone.status)}`}
                                    >
                                        {milestone.status?.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Project
                                    </label>
                                    <div className="text-sm font-medium text-gray-900">
                                        {milestone.project?.name || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Client
                                    </label>
                                    <div className="text-sm font-medium text-gray-900">
                                        {milestone.project?.client_name || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {milestone.description && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                                        {milestone.description}
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
                                        Target Completion
                                    </label>
                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                                        <FontAwesomeIcon
                                            icon={faCalendarAlt}
                                            className="w-5 h-5 text-blue-500"
                                        />
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {moment(milestone.target_date).format(
                                                    'MMM DD, YYYY'
                                                )}
                                            </div>
                                            <div
                                                className={`text-sm ${getDaysColor(milestone.target_date)}`}
                                            >
                                                {calculateDaysUntil(milestone.target_date)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Actual Completion
                                    </label>
                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                                        <FontAwesomeIcon
                                            icon={faCalendarAlt}
                                            className={`w-5 h-5 ${milestone.actual_date ? 'text-green-500' : 'text-yellow-500'}`}
                                        />
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {milestone.actual_date
                                                    ? moment(milestone.actual_date).format(
                                                          'MMM DD, YYYY'
                                                      )
                                                    : 'Not completed'}
                                            </div>
                                            {milestone.status === 'delayed' && (
                                                <div className="flex items-center mt-1 text-red-600">
                                                    <FontAwesomeIcon
                                                        icon={faExclamationTriangle}
                                                        className="w-3 h-3 mr-1"
                                                    />
                                                    <span className="text-xs">Delayed</span>
                                                </div>
                                            )}
                                        </div>
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
        </Modal>
    );
};

export default MilestonePreview;
