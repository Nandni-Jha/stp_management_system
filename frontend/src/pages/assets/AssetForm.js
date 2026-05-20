import React, { useState, useEffect } from 'react';
import moment from 'moment';

const AssetForm = ({
    asset,
    assetTypes,
    assetCategories,
    locations,
    onSubmit,
    onCancel,
    loading,
}) => {
    const [formData, setFormData] = useState({
        asset_code: '',
        asset_type_id: '',
        category_id: '',
        name: '',
        brand: '',
        model: '',
        year: '',
        serial_number: '',
        registration_number: '',
        purchase_date: '',
        purchase_cost: '',
        status: 'active',
        current_location_id: '',
        engine_type: '',
        engine_capacity: '',
        fuel_capacity: '',
        load_capacity: '',
    });

    const [filteredCategories, setFilteredCategories] = useState([]);

    useEffect(() => {
        if (asset) {
            setFormData({
                asset_code: asset.asset_code || '',
                asset_type_id: asset.asset_type_id || '',
                category_id: asset.category_id || '',
                name: asset.name || '',
                brand: asset.brand || '',
                model: asset.model || '',
                year: asset.year || '',
                serial_number: asset.serial_number || '',
                registration_number: asset.registration_number || '',
                purchase_date: asset.purchase_date
                    ? moment(asset.purchase_date).format('YYYY-MM-DD')
                    : '',
                purchase_cost: asset.purchase_cost || '',
                status: asset.status || 'active',
                current_location_id: asset.current_location_id || '',
                engine_type: asset.engine_type || '',
                engine_capacity: asset.engine_capacity || '',
                fuel_capacity: asset.fuel_capacity || '',
                load_capacity: asset.load_capacity || '',
            });
        } else {
            // Reset form for new asset
            setFormData({
                asset_code: '',
                asset_type_id: '',
                category_id: '',
                name: '',
                brand: '',
                model: '',
                year: '',
                serial_number: '',
                registration_number: '',
                purchase_date: '',
                purchase_cost: '',
                status: 'active',
                current_location_id: '',
                engine_type: '',
                engine_capacity: '',
                fuel_capacity: '',
                load_capacity: '',
            });
        }
    }, [asset]);

    // Filter categories based on selected asset type
    useEffect(() => {
        if (formData.asset_type_id) {
            const categories = assetCategories.filter(
                (category) => category.asset_type_id == formData.asset_type_id
            );
            setFilteredCategories(categories);
        } else {
            setFilteredCategories([]);
        }
    }, [formData.asset_type_id, assetCategories]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Reset category when asset type changes
        if (name === 'asset_type_id') {
            setFormData((prev) => ({
                ...prev,
                category_id: '',
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Convert empty strings to null for numeric fields
        const submitData = {
            ...formData,
            year: formData.year || null,
            purchase_cost: formData.purchase_cost || null,
            current_location_id: formData.current_location_id || null,
        };

        onSubmit(submitData);
    };

    const generateAssetCode = () => {
        const type = assetTypes.find((t) => t.id == formData.asset_type_id);
        const category = assetCategories.find((c) => c.id == formData.category_id);

        if (type && category) {
            const typePrefix = type.name.charAt(0).toUpperCase(); // V for vehicle, E for equipment
            const categoryPrefix = category.name.substring(0, 3).toUpperCase();
            const timestamp = Date.now().toString().slice(-6);
            const code = `${typePrefix}${categoryPrefix}${timestamp}`;
            setFormData((prev) => ({ ...prev, asset_code: code }));
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-4 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-2/3 max-h-[90vh] overflow-y-auto shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                        {asset ? 'Edit Asset' : 'Add New Asset'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Classification */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                Classification
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type *
                                    </label>
                                    <select
                                        name="asset_type_id"
                                        value={formData.asset_type_id}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        {assetTypes.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.name.charAt(0).toUpperCase() +
                                                    type.name.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category *
                                    </label>
                                    <select
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        required
                                        disabled={!formData.asset_type_id}
                                    >
                                        <option value="">Select Category</option>
                                        {filteredCategories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name.charAt(0).toUpperCase() +
                                                    category.name.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                Basic Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-2">
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
                                        Code *
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name="asset_code"
                                            value={formData.asset_code}
                                            onChange={handleChange}
                                            readOnly={!!asset}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-100"
                                            required
                                        />
                                        {!asset && (
                                            <button
                                                type="button"
                                                onClick={generateAssetCode}
                                                className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                                                title="Auto-generate asset code"
                                            >
                                                Gen
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Specifications */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                Specifications
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Brand
                                    </label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Model
                                    </label>
                                    <input
                                        type="text"
                                        name="model"
                                        value={formData.model}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Year
                                    </label>
                                    <input
                                        type="number"
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        min="1900"
                                        max={new Date().getFullYear() + 1}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Serial Number
                                    </label>
                                    <input
                                        type="text"
                                        name="serial_number"
                                        value={formData.serial_number}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Technical Specifications */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                Technical Specifications
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Engine Type
                                    </label>
                                    <select
                                        name="engine_type"
                                        value={formData.engine_type}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Select Engine Type</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Petrol">Petrol</option>
                                        <option value="Electric">Electric</option>
                                        <option value="Hybrid">Hybrid</option>
                                        <option value="CNG">CNG</option>
                                        <option value="LPG">LPG</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Engine Capacity
                                    </label>
                                    <input
                                        type="text"
                                        name="engine_capacity"
                                        value={formData.engine_capacity}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="e.g. 2.5L, 150HP, etc."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fuel Capacity
                                    </label>
                                    <input
                                        type="text"
                                        name="fuel_capacity"
                                        value={formData.fuel_capacity}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="Liters/Gallons"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Load Capacity
                                    </label>
                                    <input
                                        type="text"
                                        name="load_capacity"
                                        value={formData.load_capacity}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="Kg/Tons"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Registration & Purchase */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                Registration & Purchase
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Registration Number
                                    </label>
                                    <input
                                        type="text"
                                        name="registration_number"
                                        value={formData.registration_number}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Purchase Date
                                    </label>
                                    <input
                                        type="date"
                                        name="purchase_date"
                                        value={formData.purchase_date}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Purchase Cost
                                    </label>
                                    <input
                                        type="number"
                                        name="purchase_cost"
                                        value={formData.purchase_cost}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Location
                                    </label>
                                    <select
                                        name="current_location_id"
                                        value={formData.current_location_id}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Select Location</option>
                                        {locations.map((location) => (
                                            <option key={location.id} value={location.id}>
                                                {location.name} ({location.type})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Status</h4>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status *
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required
                                >
                                    <option value="active">Active</option>
                                    <option value="idle">Idle</option>
                                    <option value="under_maintenance">Under Maintenance</option>
                                    <option value="retired">Retired</option>
                                </select>
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
                                {loading ? 'Saving...' : asset ? 'Update Asset' : 'Create Asset'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AssetForm;
