import React from 'react';
import Modal from './Modal';

const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={true} onClose={onCancel} title="Confirm Action" size="sm">
            <div className="flex items-center justify-center mb-4">
                <div className="text-yellow-500">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
            </div>
            <p className="text-center text-gray-700 mb-6">{message}</p>
            <div className="flex justify-center space-x-4">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                    Delete
                </button>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
