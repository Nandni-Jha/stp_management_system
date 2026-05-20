import React, { useState } from 'react';
import apiService from '../../services/api.service';
import Layout from '../../components/Layout';
import { showSuccess, showError } from '../../components/alert.service';

const Settings = () => {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        label: '',
        color: '',
    });

    const calculatePasswordStrength = (password) => {
        if (!password) {
            return { score: 0, label: '', color: '' };
        }

        let score = 0;
        let label = '';
        let color = '';

        // Length check
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;

        // Character variety checks
        if (/[a-z]/.test(password)) score += 1; // lowercase
        if (/[A-Z]/.test(password)) score += 1; // uppercase
        if (/[0-9]/.test(password)) score += 1; // numbers
        if (/[^a-zA-Z0-9]/.test(password)) score += 1; // special characters

        // Determine label and color based on score
        if (score <= 2) {
            label = 'Weak';
            color = 'bg-red-500';
        } else if (score <= 4) {
            label = 'Fair';
            color = 'bg-yellow-500';
        } else if (score <= 5) {
            label = 'Good';
            color = 'bg-blue-500';
        } else {
            label = 'Strong';
            color = 'bg-green-500';
        }

        return { score, label, color };
    };

    const generatePassword = () => {
        const length = 16;
        const charset =
            'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        let password = '';

        // Ensure at least one of each required character type
        password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
        password += '0123456789'[Math.floor(Math.random() * 10)]; // number
        password += '!@#$%^&*()_+-='[Math.floor(Math.random() * 14)]; // special char

        // Fill the rest randomly
        for (let i = password.length; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }

        // Shuffle the password
        password = password
            .split('')
            .sort(() => Math.random() - 0.5)
            .join('');

        setFormData((prev) => ({
            ...prev,
            new_password: password,
            confirm_password: password,
        }));

        setPasswordStrength(calculatePasswordStrength(password));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Calculate password strength for new password
        if (name === 'new_password') {
            setPasswordStrength(calculatePasswordStrength(value));
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation
        if (formData.new_password !== formData.confirm_password) {
            showError('New password and confirm password do not match');
            setLoading(false);
            return;
        }

        if (formData.new_password.length < 8) {
            showError('Password must be at least 8 characters long');
            setLoading(false);
            return;
        }

        try {
            const response = await apiService.put('/profile/password', {
                current_password: formData.current_password,
                new_password: formData.new_password,
                confirm_password: formData.confirm_password,
            });

            if (response.success) {
                showSuccess('Password updated successfully!');
                setFormData({
                    current_password: '',
                    new_password: '',
                    confirm_password: '',
                });
                setPasswordStrength({ score: 0, label: '', color: '' });
            }
        } catch (err) {
            showError(err.message || 'Failed to update password', err.errors);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-5 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Update your password to keep your account secure
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword.current ? 'text' : 'password'}
                                        name="current_password"
                                        value={formData.current_password}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('current')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword.current ? (
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
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
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        New Password *
                                    </label>
                                    <button
                                        type="button"
                                        onClick={generatePassword}
                                        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        Generate Password
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword.new ? 'text' : 'password'}
                                        name="new_password"
                                        value={formData.new_password}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('new')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword.new ? (
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
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
                                        )}
                                    </button>
                                </div>

                                {formData.new_password && (
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-gray-600">
                                                Password Strength:
                                            </span>
                                            <span className="text-xs font-medium text-gray-700">
                                                {passwordStrength.label}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`${passwordStrength.color} h-2 rounded-full transition-all duration-300`}
                                                style={{
                                                    width: `${(passwordStrength.score / 6) * 100}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            <p>Password should contain:</p>
                                            <ul className="list-disc list-inside mt-1 space-y-0.5">
                                                <li
                                                    className={
                                                        formData.new_password.length >= 8
                                                            ? 'text-green-600'
                                                            : ''
                                                    }
                                                >
                                                    At least 8 characters
                                                </li>
                                                <li
                                                    className={
                                                        /[a-z]/.test(formData.new_password) &&
                                                        /[A-Z]/.test(formData.new_password)
                                                            ? 'text-green-600'
                                                            : ''
                                                    }
                                                >
                                                    Uppercase and lowercase letters
                                                </li>
                                                <li
                                                    className={
                                                        /[0-9]/.test(formData.new_password)
                                                            ? 'text-green-600'
                                                            : ''
                                                    }
                                                >
                                                    Numbers
                                                </li>
                                                <li
                                                    className={
                                                        /[^a-zA-Z0-9]/.test(formData.new_password)
                                                            ? 'text-green-600'
                                                            : ''
                                                    }
                                                >
                                                    Special characters
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword.confirm ? 'text' : 'password'}
                                        name="confirm_password"
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('confirm')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword.confirm ? (
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
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
                                        )}
                                    </button>
                                </div>
                                {formData.confirm_password && (
                                    <p
                                        className={`mt-1 text-xs ${
                                            formData.new_password === formData.confirm_password
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        }`}
                                    >
                                        {formData.new_password === formData.confirm_password
                                            ? 'Passwords match'
                                            : 'Passwords do not match'}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="submit"
                                    className="px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Settings;
