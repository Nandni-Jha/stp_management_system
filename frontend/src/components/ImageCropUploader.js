import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

const ImageCropUploader = ({ onImageCropped, currentImage }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropper, setShowCropper] = useState(false);

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const onFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result);
                setShowCropper(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (imageSrc, pixelCrop) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size to 500x500
        canvas.width = 500;
        canvas.height = 500;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            500,
            500
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.95);
        });
    };

    const handleCropSave = async () => {
        try {
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            const croppedImageFile = new File([croppedImageBlob], 'profile.jpg', {
                type: 'image/jpeg',
            });

            // Create a preview URL for display
            const previewUrl = URL.createObjectURL(croppedImageBlob);

            onImageCropped(croppedImageFile, previewUrl);
            setShowCropper(false);
            setImageSrc(null);
        } catch (e) {
            console.error('Error cropping image:', e);
        }
    };

    const handleCancel = () => {
        setShowCropper(false);
        setImageSrc(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
    };

    return (
        <div>
            {!showCropper && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profile Image
                    </label>
                    <div className="flex items-center space-x-4">
                        {currentImage && (
                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300">
                                <img
                                    src={currentImage}
                                    alt="Profile preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="flex-1">
                            <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                Choose Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={onFileChange}
                                    className="hidden"
                                />
                            </label>
                            <p className="mt-1 text-xs text-gray-500">
                                Image will be cropped to 500x500px
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {showCropper && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                Crop Profile Image
                            </h3>
                        </div>

                        <div className="relative h-96 bg-gray-900">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>

                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Zoom
                                </label>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    onChange={(e) => setZoom(e.target.value)}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCropSave}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    Save Cropped Image
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageCropUploader;
