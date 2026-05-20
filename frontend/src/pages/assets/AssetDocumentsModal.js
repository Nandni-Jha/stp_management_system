import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTimes,
    faTrash,
    faEye,
    faDownload,
    faPlus,
    faFileAlt,
    faIdCard,
    faShieldAlt,
    faCertificate,
} from '@fortawesome/free-solid-svg-icons';
import apiService from '../../services/api.service';
import { confirmDelete, showSuccess, showError } from '../../components/alert.service';
import moment from 'moment';

const AssetDocumentsModal = ({ asset, onClose }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        asset_id: asset?.id || '',
        document_type: '',
        document_number: '',
        expiry_date: '',
        file: null,
    });
    const [saving, setSaving] = useState(false);

    const documentTypes = [
        { value: 'registration', label: 'Registration Document', icon: faIdCard },
        { value: 'insurance', label: 'Insurance Certificate', icon: faShieldAlt },
        { value: 'maintenance', label: 'Maintenance Record', icon: faFileAlt },
        { value: 'warranty', label: 'Warranty Certificate', icon: faCertificate },
        { value: 'other', label: 'Other Document', icon: faFileAlt },
    ];

    useEffect(() => {
        if (asset?.id) {
            fetchDocuments();
        }
        setFormData((prev) => ({ ...prev, asset_id: asset?.id || '' }));
    }, [asset]);

    const fetchDocuments = async () => {
        try {
            const response = await apiService.get('/asset-documents');
            setDocuments(response.data.filter((doc) => doc.asset_id === asset.id));
        } catch (error) {
            console.error('Fetch documents error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, file }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('asset_id', formData.asset_id);
            formDataToSend.append('document_type', formData.document_type);
            formDataToSend.append('document_number', formData.document_number);
            if (formData.expiry_date) {
                formDataToSend.append('expiry_date', formData.expiry_date);
            }
            if (formData.file) {
                formDataToSend.append('file', formData.file);
            }

            await apiService.post('/asset-documents', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            showSuccess('Document uploaded successfully');

            resetForm();
            fetchDocuments();
        } catch (error) {
            showError(error.message || 'Failed to save document', error.errors);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await confirmDelete('Are you sure you want to delete this document?');
        if (result.isConfirmed) {
            try {
                await apiService.delete(`/asset-documents/${id}`);
                setDocuments(documents.filter((doc) => doc.id !== id));
                showSuccess('Document deleted successfully');
            } catch (error) {
                showError('Failed to delete document', error.errors);
            }
        }
    };

    const handleDownload = async (doc) => {
        try {
            const response = await apiService.get(`/asset-documents/${doc.id}/download`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.file_path.split('/').pop());
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            showError('Failed to download document', error.errors);
        }
    };

    const resetForm = () => {
        setFormData({
            asset_id: asset?.id || '',
            document_type: '',
            document_number: '',
            expiry_date: '',
            file: null,
        });
    };

    const getDocumentTypeIcon = (documentType) => {
        const docType = documentTypes.find((t) => t.value === documentType);
        return docType ? docType.icon : faFileAlt;
    };

    const getDocumentTypeLabel = (documentType) => {
        const docType = documentTypes.find((t) => t.value === documentType);
        return docType ? docType.label : 'Document';
    };

    const getStatusColor = (expiryDate) => {
        if (!expiryDate) return 'text-gray-500';

        const now = moment();
        const expiry = moment(expiryDate);
        const daysToExpiry = expiry.diff(now, 'days');

        if (daysToExpiry < 0) {
            return 'text-red-600 font-semibold'; // Expired
        } else if (daysToExpiry <= 30) {
            return 'text-amber-600 font-semibold'; // Expiring soon
        } else {
            return 'text-green-600'; // Valid
        }
    };

    const getStatusText = (expiryDate) => {
        if (!expiryDate) return '';

        const now = moment();
        const expiry = moment(expiryDate);
        const daysToExpiry = expiry.diff(now, 'days');

        if (daysToExpiry < 0) {
            return ' (Expired)';
        } else if (daysToExpiry <= 30) {
            return ` (Expires in ${daysToExpiry} days)`;
        } else {
            return ' (Valid)';
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
                <div className="mt-3">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100 mr-4">
                                <FontAwesomeIcon
                                    icon={faFileAlt}
                                    className="w-6 h-6 text-green-600"
                                />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    Document Management
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {asset?.name} ({asset?.asset_code})
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all duration-200"
                            title="Close modal"
                        >
                            <FontAwesomeIcon icon={faTimes} className="text-sm" />
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Documents List */}
                        <div className="lg:col-span-2">
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                    Asset Documents ({documents.length})
                                </h4>
                                <div className="space-y-4">
                                    {loading ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                                            <p className="text-gray-500 mt-2">
                                                Loading documents...
                                            </p>
                                        </div>
                                    ) : documents.length === 0 ? (
                                        <div className="text-center py-8">
                                            <FontAwesomeIcon
                                                icon={faFileAlt}
                                                className="w-12 h-12 text-gray-300 mx-auto mb-4"
                                            />
                                            <p className="text-gray-500">
                                                No documents uploaded yet
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                Use the form to add documents
                                            </p>
                                        </div>
                                    ) : (
                                        documents.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="p-2 rounded-full bg-white">
                                                            <FontAwesomeIcon
                                                                icon={getDocumentTypeIcon(
                                                                    doc.document_type
                                                                )}
                                                                className="w-4 h-4 text-primary-600"
                                                            />
                                                        </div>
                                                        <div>
                                                            <h5 className="font-medium text-gray-900">
                                                                {getDocumentTypeLabel(
                                                                    doc.document_type
                                                                )}
                                                            </h5>
                                                            <p className="text-sm text-gray-600">
                                                                #{doc.document_number}
                                                                {doc.expiry_date && (
                                                                    <span
                                                                        className={getStatusColor(
                                                                            doc.expiry_date
                                                                        )}
                                                                    >
                                                                        {getStatusText(
                                                                            doc.expiry_date
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Added{' '}
                                                                {moment(doc.created_at).format(
                                                                    'MMM DD, YYYY'
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleDownload(doc)}
                                                            className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors"
                                                            title="Download"
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={faDownload}
                                                                className="w-3 h-3 text-blue-600"
                                                            />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(doc.id)}
                                                            className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
                                                            title="Delete"
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={faTrash}
                                                                className="w-3 h-3 text-red-600"
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Upload Form */}
                        <div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                    Upload Document
                                </h4>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Document Type *
                                        </label>
                                        <select
                                            name="document_type"
                                            value={formData.document_type}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            required
                                        >
                                            <option value="">Select Type</option>
                                            {documentTypes.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Document Number *
                                        </label>
                                        <input
                                            type="text"
                                            name="document_number"
                                            value={formData.document_number}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            required
                                            placeholder="REG-001, INS-123, etc."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Expiry Date
                                        </label>
                                        <input
                                            type="date"
                                            name="expiry_date"
                                            value={formData.expiry_date}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Document File *
                                        </label>
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            required
                                        />
                                        {formData.file && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Selected: {formData.file.name}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Supported formats: PDF, JPG, PNG, DOC, DOCX
                                        </p>
                                    </div>

                                    <div className="flex space-x-3 pt-4">
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                                            disabled={saving}
                                        >
                                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                            {saving ? 'Uploading...' : 'Upload Document'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end space-x-3 pt-8 border-t border-gray-200 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssetDocumentsModal;
