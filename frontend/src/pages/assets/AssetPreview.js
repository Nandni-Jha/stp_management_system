import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTruckPickup,
    faEye,
    faCalendarAlt,
    faMapMarkerAlt,
    faWrench,
    faCogs,
    faTag,
} from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

const AssetPreview = ({ asset, onClose }) => {
    if (!asset) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-600/20';
            case 'idle':
                return 'bg-blue-100 text-blue-800 ring-1 ring-blue-600/20';
            case 'under_maintenance':
                return 'bg-amber-100 text-amber-800 ring-1 ring-amber-600/20';
            case 'retired':
                return 'bg-red-100 text-red-800 ring-1 ring-red-600/20';
            default:
                return 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20';
        }
    };

    const getAssetConditionColor = (condition) => {
        switch (condition?.toLowerCase()) {
            case 'excellent':
                return 'bg-green-100 text-green-800';
            case 'good':
                return 'bg-blue-100 text-blue-800';
            case 'fair':
                return 'bg-yellow-100 text-yellow-800';
            case 'poor':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
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
                                    icon={faTruckPickup}
                                    className="w-8 h-8 text-primary-600"
                                />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{asset.name}</h3>
                                <p className="text-sm text-gray-600 font-mono">
                                    {asset.asset_code}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span
                                className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full shadow-sm ${getStatusColor(asset.status)}`}
                            >
                                {asset.status?.replace('_', ' ').toUpperCase()}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Asset Type</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {asset.asset_type?.name || 'N/A'}
                                    </p>
                                </div>
                                <div className="p-2 rounded-full bg-blue-100">
                                    <FontAwesomeIcon
                                        icon={faCogs}
                                        className="w-5 h-5 text-blue-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Category</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {asset.category?.name || 'N/A'}
                                    </p>
                                </div>
                                <div className="p-2 rounded-full bg-green-100">
                                    <FontAwesomeIcon
                                        icon={faTag}
                                        className="w-5 h-5 text-green-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">
                                        Current Location
                                    </p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {asset.current_location?.name || 'N/A'}
                                    </p>
                                </div>
                                <div className="p-2 rounded-full bg-purple-100">
                                    <FontAwesomeIcon
                                        icon={faMapMarkerAlt}
                                        className="w-5 h-5 text-purple-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Basic Information */}
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <FontAwesomeIcon
                                        icon={faEye}
                                        className="w-5 h-5 mr-2 text-gray-500"
                                    />
                                    Basic Information
                                </h4>
                                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Brand
                                            </label>
                                            <div className="text-sm font-medium text-gray-900">
                                                {asset.brand || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Model
                                            </label>
                                            <div className="text-sm font-medium text-gray-900">
                                                {asset.model || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Year
                                            </label>
                                            <div className="text-sm font-medium text-gray-900">
                                                {asset.year || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Condition
                                            </label>
                                            <span
                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${getAssetConditionColor(asset.condition)}`}
                                            >
                                                {asset.condition || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                VIN/Serial Number
                                            </label>
                                            <div className="text-sm font-medium text-gray-900 font-mono">
                                                {asset.serial_number || 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    {asset.description && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Description
                                            </label>
                                            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                                                {asset.description}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <FontAwesomeIcon
                                        icon={faWrench}
                                        className="w-5 h-5 mr-2 text-gray-500"
                                    />
                                    Technical Specifications
                                </h4>
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Engine Type
                                            </label>
                                            <div className="text-sm font-medium text-gray-900">
                                                {asset.engine_type || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Engine Capacity
                                            </label>
                                            <div className="text-sm font-medium text-gray-900">
                                                {asset.engine_capacity || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Fuel Capacity
                                            </label>
                                            <div className="text-sm font-medium text-gray-900">
                                                {asset.fuel_capacity || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Load Capacity
                                            </label>
                                            <div className="text-sm font-medium text-gray-900">
                                                {asset.load_capacity || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Dimensions
                                            </label>
                                            <div className="text-sm font-medium text-gray-900">
                                                {asset.length && asset.width && asset.height
                                                    ? `${asset.length}L x ${asset.width}W x ${asset.height}H cm`
                                                    : 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Weight
                                            </label>
                                            <div className="text-sm font-medium text-gray-900">
                                                {asset.weight ? `${asset.weight} kg` : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Financial & Operational Information */}
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <FontAwesomeIcon
                                        icon={faCalendarAlt}
                                        className="w-5 h-5 mr-2 text-gray-500"
                                    />
                                    Financial & Operational Info
                                </h4>
                                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Purchase Date
                                            </label>
                                            <div className="text-sm font-medium text-gray-900">
                                                {asset.purchase_date
                                                    ? moment(asset.purchase_date).format(
                                                          'MMM DD, YYYY'
                                                      )
                                                    : 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Purchase Price
                                            </label>
                                            <div className="text-sm font-medium text-gray-900">
                                                {asset.purchase_price
                                                    ? `$${parseFloat(asset.purchase_price).toLocaleString()}`
                                                    : 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Current Value
                                            </label>
                                            <div className="text-sm font-medium text-gray-900">
                                                {asset.current_value
                                                    ? `$${parseFloat(asset.current_value).toLocaleString()}`
                                                    : 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Warranty Expires
                                            </label>
                                            <div className="text-sm font-medium text-gray-900">
                                                {asset.warranty_expires
                                                    ? moment(asset.warranty_expires).format(
                                                          'MMM DD, YYYY'
                                                      )
                                                    : 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-gray-200" />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Next Service Due
                                            </label>
                                            <div className="text-sm font-medium text-gray-900">
                                                {asset.next_service_due
                                                    ? moment(asset.next_service_due).format(
                                                          'MMM DD, YYYY'
                                                      )
                                                    : 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Insurance Expires
                                            </label>
                                            <div className="text-sm font-medium text-gray-900">
                                                {asset.insurance_expires
                                                    ? moment(asset.insurance_expires).format(
                                                          'MMM DD, YYYY'
                                                      )
                                                    : 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Registration Expires
                                            </label>
                                            <div className="text-sm font-medium text-gray-900">
                                                {asset.registration_expires
                                                    ? moment(asset.registration_expires).format(
                                                          'MMM DD, YYYY'
                                                      )
                                                    : 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Operating Hours
                                            </label>
                                            <div className="text-sm font-medium text-gray-900">
                                                {asset.operating_hours
                                                    ? `${asset.operating_hours} hours`
                                                    : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {asset.notes && (
                                <div>
                                    <h4 className="text-xl font-semibold text-gray-900 mb-4">
                                        Additional Notes
                                    </h4>
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                        <div className="text-sm text-amber-800">{asset.notes}</div>
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

export default AssetPreview;
