import React, { useState, useEffect } from 'react';
import ImageCropUploader from '../../components/ImageCropUploader';

const UserForm = ({ user, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        profile_image: '',
        type: 'user',
        status: true,
    });
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                profile_image: user.profile_image || '',
                type: user.type || 'user',
                status: user.status ?? true,
            });
            setProfileImagePreview(user.profile_image_url || null);
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleImageCropped = (file, previewUrl) => {
        setProfileImageFile(file);
        setProfileImagePreview(previewUrl);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Create FormData if there's an image file to upload
        if (profileImageFile) {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('email', formData.email);
            if (formData.password) {
                submitData.append('password', formData.password);
            }
            submitData.append('type', formData.type);
            submitData.append('status', formData.status ? '1' : '0');
            submitData.append('profile_image', profileImageFile);

            // Pass FormData with multipart config
            onSubmit(submitData, true);
        } else {
            // Remove profile_image field if it's empty to avoid validation errors
            const submitData = { ...formData };
            if (!submitData.profile_image) {
                delete submitData.profile_image;
            }
            onSubmit(submitData, false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">
                        {user ? 'Edit User' : 'Add New User'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <ImageCropUploader
                                onImageCropped={handleImageCropped}
                                currentImage={profileImagePreview}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password {user ? '(leave blank to keep existing)' : '*'}
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required={!user}
                                minLength={8}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type *
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="manager">Manager</option>
                            </select>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="status"
                                checked={formData.status}
                                onChange={handleChange}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                                Active Status
                            </label>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : user ? 'Update User' : 'Add User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserForm;
