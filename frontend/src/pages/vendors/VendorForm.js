import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { showSuccess, showError } from '../../components/alert.service';

const VendorForm = ({ vendor, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        name: vendor?.name || '',
        type: vendor?.type || '',
        contact_details: vendor?.contact_details || '',
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Vendor name is required';
        } else if (formData.name.length > 255) {
            newErrors.name = 'Vendor name cannot exceed 255 characters';
        }

        if (formData.type && formData.type.length > 100) {
            newErrors.type = 'Vendor type cannot exceed 100 characters';
        }

        if (formData.contact_details && formData.contact_details.length > 1000) {
            newErrors.contact_details = 'Contact details cannot exceed 1000 characters';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            await onSubmit(formData);
            if (!vendor) {
                showSuccess('Vendor created successfully.');
                setFormData({
                    name: '',
                    type: '',
                    contact_details: '',
                });
            }
        } catch (error) {
            if (error.errors) {
                setErrors(error.errors);
            } else {
                showError(
                    error.message ||
                        (vendor ? 'Failed to update vendor' : 'Failed to create vendor')
                );
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 mr-4">
                                <FontAwesomeIcon
                                    icon={vendor ? faSave : faSave}
                                    className="w-8 h-8 text-blue-600"
                                />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {vendor ? 'Edit Vendor' : 'Add New Vendor'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {vendor ? 'Update vendor information' : 'Create a new vendor'}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all duration-200"
                            title="Close"
                        >
                            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Vendor Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vendor Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Enter vendor name"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* Vendor Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vendor Type
                            </label>
                            <input
                                type="text"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all ${
                                    errors.type ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="e.g., Fuel Supplier, Maintenance Provider"
                            />
                            {errors.type && (
                                <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Optional: Specify the type of vendor (max 100 characters)
                            </p>
                        </div>

                        {/* Contact Details */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Details
                            </label>
                            <textarea
                                name="contact_details"
                                value={formData.contact_details}
                                onChange={handleChange}
                                rows={4}
                                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all ${
                                    errors.contact_details ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Enter contact details (phone, email, address, etc.)"
                            />
                            {errors.contact_details && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.contact_details}
                                </p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Optional: Contact information including phone, email, address (max
                                1000 characters)
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FontAwesomeIcon icon={faSave} className="mr-2" />
                                {loading ? 'Saving...' : vendor ? 'Update Vendor' : 'Create Vendor'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VendorForm;
