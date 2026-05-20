import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Modal from '../../components/Modal';

const ProjectForm = ({ project, locations, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        client_name: '',
        start_date: '',
        end_date: '',
        location_id: '',
        status: 'active',
        budget: '',
        budget_currency: 'USD',
        budget_notes: '',
    });

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || '',
                client_name: project.client_name || '',
                start_date: project.start_date
                    ? moment(project.start_date).format('YYYY-MM-DD')
                    : '',
                end_date: project.end_date ? moment(project.end_date).format('YYYY-MM-DD') : '',
                location_id: project.location_id || '',
                status: project.status || 'active',
                budget: project.budget || '',
                budget_currency: project.budget_currency || 'USD',
                budget_notes: project.budget_notes || '',
            });
        } else {
            // Reset form for new project
            setFormData({
                name: '',
                client_name: '',
                start_date: '',
                end_date: '',
                location_id: '',
                status: 'active',
                budget: '',
                budget_currency: 'USD',
                budget_notes: '',
            });
        }
    }, [project]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate dates
        const startDate = moment(formData.start_date);
        const endDate = formData.end_date ? moment(formData.end_date) : null;

        if (endDate && startDate.isAfter(endDate)) {
            alert('End date cannot be before start date');
            return;
        }

        onSubmit(formData);
    };

    const calculateDuration = () => {
        if (formData.start_date && formData.end_date) {
            const start = moment(formData.start_date);
            const end = moment(formData.end_date);
            const days = end.diff(start, 'days');
            return `${days} days`;
        }
        return '';
    };

    return (
        <Modal
            isOpen={true}
            onClose={onCancel}
            title={project ? 'Edit Project' : 'Add New Project'}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Project Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Project Information</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Project Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                                placeholder="Enter project name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Client Name *
                            </label>
                            <input
                                type="text"
                                name="client_name"
                                value={formData.client_name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                                placeholder="Enter client name"
                            />
                        </div>
                    </div>
                </div>

                {/* Timeline & Location */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Timeline & Location</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date *
                            </label>
                            <input
                                type="date"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                name="end_date"
                                value={formData.end_date}
                                onChange={handleChange}
                                min={formData.start_date || undefined}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    {/* Duration preview */}
                    {formData.start_date && formData.end_date && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                            <div className="flex items-center">
                                <svg
                                    className="w-5 h-5 text-blue-500 mr-2"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="text-sm font-medium text-blue-700">
                                    Project Duration: {calculateDuration()}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location *
                        </label>
                        <select
                            name="location_id"
                            value={formData.location_id}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        >
                            <option value="">Select Location</option>
                            {locations.map((location) => (
                                <option key={location.id} value={location.id}>
                                    {location.name} ({location.type})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Budget Information */}
                <div className="bg-gray-50 rounded-lg p-4">
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
                        Budget Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Total Budget
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Currency
                            </label>
                            <select
                                name="budget_currency"
                                value={formData.budget_currency}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                                <option value="INR">INR - Indian Rupee</option>
                                <option value="JPY">JPY - Japanese Yen</option>
                                <option value="CAD">CAD - Canadian Dollar</option>
                                <option value="AUD">AUD - Australian Dollar</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Budget Notes
                        </label>
                        <textarea
                            name="budget_notes"
                            value={formData.budget_notes}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Additional notes about the project budget..."
                        />
                    </div>
                </div>

                {/* Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Status</h4>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Status *
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    name="status"
                                    value="active"
                                    checked={formData.status === 'active'}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                />
                                <label className="ml-2 block text-sm text-gray-900">Active</label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    name="status"
                                    value="completed"
                                    checked={formData.status === 'completed'}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    Completed
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    name="status"
                                    value="on_hold"
                                    checked={formData.status === 'on_hold'}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                />
                                <label className="ml-2 block text-sm text-gray-900">On Hold</label>
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
                        {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ProjectForm;
