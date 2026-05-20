import React, { useState, useEffect } from 'react';

const OperatorForm = ({ operator, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        job_title: '',
        department: '',
        license_number: '',
        license_type: '',
        license_issue_date: '',
        license_expiry: '',
        phone: '',
        email: '',
        password: '',
        status: 'active',
        address: '',
        emergency_contact: '',
        skills: '',
        about_me: '',
        hire_date: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (operator) {
            setFormData({
                name: operator.name || '',
                job_title: operator.job_title || '',
                department: operator.department || '',
                license_number: operator.license_number || '',
                license_type: operator.license_type || '',
                license_issue_date: operator.license_issue_date || '',
                license_expiry: operator.license_expiry || '',
                phone: operator.phone || '',
                email: operator.email || '',
                password: '',
                status: operator.status || 'active',
                address: operator.address || '',
                emergency_contact: operator.emergency_contact || '',
                skills: operator.skills || '',
                about_me: operator.about_me || '',
                hire_date: operator.hire_date || '',
            });
        } else {
            // Reset form for new operator
            setFormData({
                name: '',
                job_title: '',
                department: '',
                license_number: '',
                license_type: '',
                license_issue_date: '',
                license_expiry: '',
                phone: '',
                email: '',
                password: '',
                status: 'active',
                address: '',
                emergency_contact: '',
                skills: '',
                about_me: '',
                hire_date: '',
            });
        }
    }, [operator]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const licenseTypes = [
        'Class A - Tractor Trailer',
        'Class B - Heavy Straight Vehicle',
        'Class C - Single Vehicles Over 26,001 lbs',
        'Class D - Light Vehicle',
        'Class M - Motorcycle',
        'Class E - Two-Wheel Motorcycle',
        'Other',
    ];

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                        {operator ? 'Edit Operator' : 'Add New Operator'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                Basic Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        required
                                        placeholder="Enter full name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Job Title
                                    </label>
                                    <input
                                        type="text"
                                        name="job_title"
                                        value={formData.job_title}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="Operator"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Department
                                    </label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="Operations"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="Enter phone number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="email@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {operator
                                            ? 'New Password (leave blank to keep current)'
                                            : 'Password'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder={
                                                operator ? 'Enter new password' : 'Enter password'
                                            }
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showPassword ? (
                                                <svg
                                                    className="h-5 w-5 text-gray-400"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className="h-5 w-5 text-gray-400"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {operator
                                            ? 'Optional - leave blank to keep existing password'
                                            : 'Minimum 6 characters'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* License Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                License Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        License Number
                                    </label>
                                    <input
                                        type="text"
                                        name="license_number"
                                        value={formData.license_number}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                                        placeholder="Enter license number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        License Type
                                    </label>
                                    <select
                                        name="license_type"
                                        value={formData.license_type}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Select License Type</option>
                                        {licenseTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        License Issue Date
                                    </label>
                                    <input
                                        type="date"
                                        name="license_issue_date"
                                        value={formData.license_issue_date}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        License Expiry Date
                                    </label>
                                    <input
                                        type="date"
                                        name="license_expiry"
                                        value={formData.license_expiry}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                Additional Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="Enter full address"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Hire Date
                                    </label>
                                    <input
                                        type="date"
                                        name="hire_date"
                                        value={formData.hire_date}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Emergency Contact
                                    </label>
                                    <input
                                        type="text"
                                        name="emergency_contact"
                                        value={formData.emergency_contact}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="Emergency contact name"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Skills/Certifications
                                    </label>
                                    <textarea
                                        name="skills"
                                        value={formData.skills}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="List relevant skills and certifications"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        About Me
                                    </label>
                                    <textarea
                                        name="about_me"
                                        value={formData.about_me}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="Additional notes about the operator"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Status</h4>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Employment Status *
                                </label>
                                <div className="flex items-center space-x-6">
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="active"
                                            checked={formData.status === 'active'}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                        />
                                        <label className="ml-2 block text-sm text-gray-900">
                                            Active
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="inactive"
                                            checked={formData.status === 'inactive'}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                        />
                                        <label className="ml-2 block text-sm text-gray-900">
                                            Inactive
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
                                    : operator
                                      ? 'Update Operator'
                                      : 'Create Operator'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OperatorForm;
