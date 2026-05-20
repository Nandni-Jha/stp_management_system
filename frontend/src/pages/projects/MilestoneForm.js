import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Modal from '../../components/Modal';

const MilestoneForm = ({ milestone, project, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        target_date: '',
        actual_date: '',
        status: 'pending',
    });

    useEffect(() => {
        if (milestone) {
            setFormData({
                name: milestone.name || '',
                description: milestone.description || '',
                target_date: milestone.target_date
                    ? moment(milestone.target_date).format('YYYY-MM-DD')
                    : '',
                actual_date: milestone.actual_date
                    ? moment(milestone.actual_date).format('YYYY-MM-DD')
                    : '',
                status: milestone.status || 'pending',
            });
        } else {
            // Reset form for new milestone
            setFormData({
                name: '',
                description: '',
                target_date: '',
                actual_date: '',
                status: 'pending',
            });
        }
    }, [milestone]);

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
        const targetDate = moment(formData.target_date);
        const actualDate = formData.actual_date ? moment(formData.actual_date) : null;

        if (actualDate && actualDate.isBefore(targetDate)) {
            alert('Actual completion date cannot be before target date');
            return;
        }

        onSubmit(formData);
    };

    const calculateDaysUntil = () => {
        if (!formData.target_date) return '';
        const target = moment(formData.target_date);
        const today = moment();
        const diff = target.diff(today, 'days');

        if (diff < 0) return `Overdue by ${Math.abs(diff)} days`;
        if (diff === 0) return 'Due today';
        if (diff === 1) return 'Due tomorrow';
        return `Due in ${diff} days`;
    };

    return (
        <Modal
            isOpen={true}
            onClose={onCancel}
            title={milestone ? 'Edit Milestone' : 'Add New Milestone'}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Project Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                        Project: {project?.name || 'Unknown'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Client: {project?.client_name || 'N/A'}
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Location: {project?.location?.name || 'N/A'}
                            </label>
                        </div>
                    </div>
                </div>

                {/* Milestone Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                        Milestone Information
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Milestone Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                                placeholder="Enter milestone name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Describe this milestone..."
                            />
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Timeline</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Target Completion Date *
                            </label>
                            <input
                                type="date"
                                name="target_date"
                                value={formData.target_date}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                            />
                            {formData.target_date && (
                                <div className="mt-2 text-sm text-gray-600">
                                    {calculateDaysUntil()}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Actual Completion Date
                            </label>
                            <input
                                type="date"
                                name="actual_date"
                                value={formData.actual_date}
                                onChange={handleChange}
                                min={formData.target_date || undefined}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Status</h4>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Milestone Status *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    name="status"
                                    value="pending"
                                    checked={formData.status === 'pending'}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                />
                                <label className="ml-2 block text-sm text-gray-900">Pending</label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    name="status"
                                    value="in_progress"
                                    checked={formData.status === 'in_progress'}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    In Progress
                                </label>
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
                                    value="delayed"
                                    checked={formData.status === 'delayed'}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                />
                                <label className="ml-2 block text-sm text-gray-900">Delayed</label>
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
                            : milestone
                              ? 'Update Milestone'
                              : 'Create Milestone'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default MilestoneForm;
