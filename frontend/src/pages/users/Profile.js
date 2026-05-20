import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/api.service';
import ImageCropUploader from '../../components/ImageCropUploader';
import { STORAGE_KEYS } from '../../constants';
import Layout from '../../components/Layout';
import { getImageUrl } from '../../utils/imageHelper';
import { showSuccess, showError } from '../../components/alert.service';

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        about_me: '',
    });
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                about_me: user.about_me || '',
            });
            setProfileImagePreview(getImageUrl(user.profile_image));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageCropped = (file, previewUrl) => {
        setProfileImageFile(file);
        setProfileImagePreview(previewUrl);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let submitData;
            let isMultipart = false;

            // Create FormData if there's an image file to upload
            if (profileImageFile) {
                submitData = new FormData();
                submitData.append('name', formData.name);
                submitData.append('email', formData.email);
                submitData.append('about_me', formData.about_me || '');
                submitData.append('profile_image', profileImageFile);
                submitData.append('_method', 'PUT');
                isMultipart = true;
            } else {
                submitData = {
                    name: formData.name,
                    email: formData.email,
                    about_me: formData.about_me || '',
                };
            }

            const config = isMultipart
                ? {
                      headers: {
                          'Content-Type': 'multipart/form-data',
                      },
                  }
                : {};

            const response = isMultipart
                ? await apiService.post('/profile', submitData, config)
                : await apiService.put('/profile', submitData, config);

            if (response.success) {
                showSuccess('Profile updated successfully!');

                // Update user data in localStorage and context
                const updatedUser = response.data.user;
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

                // Update the auth context by triggering a re-login with the new data
                // This is a workaround since we don't have a direct method to update user in context
                window.location.reload(); // Simple reload to reflect changes

                setProfileImageFile(null);
            }
        } catch (err) {
            showError(err.message || 'Failed to update profile', err.errors);
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
                            <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Update your personal information and profile picture
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
                            <div>
                                <ImageCropUploader
                                    onImageCropped={handleImageCropped}
                                    currentImage={profileImagePreview}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    About Me
                                </label>
                                <textarea
                                    name="about_me"
                                    value={formData.about_me}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="submit"
                                    className="px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
