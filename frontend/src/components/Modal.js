import React, { useEffect, useRef } from 'react';

const Modal = ({ isOpen, onClose, children, title, size = 'md' }) => {
    const modalRef = useRef(null);
    const contentRef = useRef(null);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle click outside to close
    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            onClose();
        }
    };

    // Handle escape key
    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'w-11/12 md:w-1/3 lg:w-1/4',
        md: 'w-11/12 md:w-2/3 lg:w-1/2',
        lg: 'w-11/12 md:w-4/5 lg:w-3/4',
        xl: 'w-11/12 md:w-full lg:w-5/6',
    };

    return (
        <div
            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
            onClick={handleClickOutside}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
        >
            <div
                ref={modalRef}
                className={`relative mx-auto p-5 border shadow-lg rounded-md bg-white ${sizeClasses[size]} max-h-[90vh] flex flex-col`}
                style={{ top: '5%' }}
            >
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        <h3 id="modal-title" className="text-2xl font-semibold text-gray-900">
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            aria-label="Close modal"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Body - Scrollable Content */}
                <div
                    ref={contentRef}
                    className="overflow-y-auto flex-1"
                    style={{ maxHeight: 'calc(90vh - 120px)' }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
