import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
        setGeneralError('');
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await login(formData);
            if (response.success) {
                navigate(ROUTES.DASHBOARD);
            }
        } catch (error) {
            setGeneralError(error.message || 'Login failed. Please try again.');
            if (error.errors) {
                setErrors(error.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500 px-4 py-8">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <img
                        className="mx-auto mb-3"
                        src="logo-main.webp"
                        alt="STP Investments"
                        width={280}
                    />
                    <p className="text-sm text-gray-600">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {generalError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
                            {generalError}
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                errors.email
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-gray-300 hover:border-gray-400'
                            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                            placeholder="Enter your email"
                            disabled={loading}
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                errors.password
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-gray-300 hover:border-gray-400'
                            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                            placeholder="Enter your password"
                            disabled={loading}
                        />
                        {errors.password && (
                            <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transform transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
