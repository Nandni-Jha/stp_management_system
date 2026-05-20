import React, { useState, useEffect } from 'react';
import moment from 'moment';

const AssignmentForm = ({
    assignment,
    assets,
    operators,
    projects,
    onSubmit,
    onCancel,
    loading,
}) => {
    const [formData, setFormData] = useState({
        asset_id: '',
        operator_id: '',
        project_id: '',
        assigned_from: '',
        assigned_to: '',
        usage_type: 'full_day',
    });

    useEffect(() => {
        if (assignment) {
            setFormData({
                asset_id: assignment.asset_id || '',
                operator_id: assignment.operator_id || '',
                project_id: assignment.project_id || '',
                assigned_from: assignment.assigned_from
                    ? moment(assignment.assigned_from).format('YYYY-MM-DDTHH:mm')
                    : '',
                assigned_to: assignment.assigned_to
                    ? moment(assignment.assigned_to).format('YYYY-MM-DDTHH:mm')
                    : '',
                usage_type: assignment.usage_type || 'full_day',
            });
        } else {
            // Reset form for new assignment
            setFormData({
                asset_id: '',
                operator_id: '',
                project_id: '',
                assigned_from: '',
                assigned_to: '',
                usage_type: 'full_day',
            });
        }
    }, [assignment]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Convert datetime-local to datetime format for API
        const submitData = {
            ...formData,
            assigned_from: formData.assigned_from
                ? new Date(formData.assigned_from).toISOString()
                : null,
            assigned_to: formData.assigned_to ? new Date(formData.assigned_to).toISOString() : null,
        };

        // Remove assigned_to if empty (ongoing assignment)
        if (!formData.assigned_to) {
            delete submitData.assigned_to;
        }

        onSubmit(submitData);
    };

    // Preview date difference
    const calculateDuration = () => {
        if (formData.assigned_from && formData.assigned_to) {
            const start = moment(formData.assigned_from);
            const end = moment(formData.assigned_to);
            const hours = end.diff(start, 'hours');
            const days = Math.floor(hours / 24);
            const remainingHours = hours % 24;

            if (days > 0) {
                return `${days} day${days > 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
            } else {
                return `${hours} hour${hours !== 1 ? 's' : ''}`;
            }
        }
        return '';
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
                <div className="mt-3">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                        {assignment ? 'Edit Assignment' : 'Create New Assignment'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Asset Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                Assign Asset to Operator
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Asset *
                                    </label>
                                    <select
                                        name="asset_id"
                                        value={formData.asset_id}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        required
                                    >
                                        <option value="">Select Asset</option>
                                        {assets.map((asset) => (
                                            <option key={asset.id} value={asset.id}>
                                                {asset.asset_code} - {asset.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Operator *
                                    </label>
                                    <select
                                        name="operator_id"
                                        value={formData.operator_id}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        required
                                    >
                                        <option value="">Select Operator</option>
                                        {operators.map((operator) => (
                                            <option key={operator.id} value={operator.id}>
                                                {operator.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Project & Timeline */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                Project & Timeline
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Project *
                                    </label>
                                    <select
                                        name="project_id"
                                        value={formData.project_id}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        required
                                    >
                                        <option value="">Select Project</option>
                                        {projects.map((project) => (
                                            <option key={project.id} value={project.id}>
                                                {project.name} - {project.client_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Assigned From (Date & Time) *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="assigned_from"
                                            value={formData.assigned_from}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Assigned To (Date & Time)
                                            <span className="text-xs text-gray-500 ml-1">
                                                (Leave empty for ongoing assignments)
                                            </span>
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="assigned_to"
                                            value={formData.assigned_to}
                                            onChange={handleChange}
                                            min={formData.assigned_from || undefined}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>

                                {/* Duration preview */}
                                {formData.assigned_from && formData.assigned_to && (
                                    <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                                        <div className="flex items-center">
                                            <svg
                                                className="w-5 h-5 text-blue-500 mr-2"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="text-sm font-medium text-blue-700">
                                                Assignment Duration: {calculateDuration()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Usage Type */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                Usage Details
                            </h4>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Usage Type *
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            name="usage_type"
                                            value="full_day"
                                            checked={formData.usage_type === 'full_day'}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                        />
                                        <label className="ml-2 block text-sm text-gray-900">
                                            Full Day Assignment
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            name="usage_type"
                                            value="hourly"
                                            checked={formData.usage_type === 'hourly'}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                        />
                                        <label className="ml-2 block text-sm text-gray-900">
                                            Hourly Assignment
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading
                                    ? 'Saving...'
                                    : assignment
                                      ? 'Update Assignment'
                                      : 'Create Assignment'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AssignmentForm;
