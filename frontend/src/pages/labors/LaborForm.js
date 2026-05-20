import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import apiService from '../../services/api.service';
import { showError } from '../../components/alert.service';
import Modal from '../../components/Modal';

const LaborForm = ({ labor, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        category_id: '',
        name: '',
    });
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (labor) {
            setFormData({
                category_id: labor.category_id || '',
                name: labor.name || '',
            });
        }
        fetchCategories();
    }, [labor]);

    const fetchCategories = async () => {
        try {
            const response = await apiService.get('/labor-categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

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
                [name]: '',
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.category_id) {
            newErrors.category_id = 'Category is required';
        }

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const data = {
                ...formData,
            };

            if (labor) {
                await onSubmit(data);
            } else {
                await onSubmit(data);
            }
        } catch (error) {
            console.error('Submit error:', error);
            if (error.errors) {
                setErrors(error.errors);
            } else {
                showError(error.message || 'An error occurred');
            }
        }
    };

    return (
        <Modal
            title={labor ? 'Edit Labor' : 'Add New Labor'}
            isOpen={true}
            onClose={onCancel}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                    </label>
                    <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all ${
                            errors.category_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    {errors.category_id && (
                        <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
                    )}
                </div>

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter labor name"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Rate Information */}
                {formData.category_id && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Rate Information
                        </label>
                        {(() => {
                            const selectedCategory = categories.find(
                                (cat) => cat.id === parseInt(formData.category_id)
                            );
                            if (selectedCategory) {
                                return (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">
                                                Per Hour Rate
                                            </label>
                                            <div className="px-3 py-2.5 bg-white border border-gray-300 rounded-lg">
                                                ₹{selectedCategory.hour_rate || '0.00'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">
                                                Per Day Rate
                                            </label>
                                            <div className="px-3 py-2.5 bg-white border border-gray-300 rounded-lg">
                                                ₹{selectedCategory.day_rate || '0.00'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                    >
                        <span>Cancel</span>
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FontAwesomeIcon icon={faSave} className="w-4 h-4 mr-2" />
                        <span>{loading ? 'Saving...' : 'Save Labor'}</span>
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default LaborForm;
