import React, { useState, useEffect } from 'react';
import moment from 'moment';

const FuelLogForm = ({ fuelLog, assets, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        asset_id: '',
        date: '',
        quantity: '',
        fuel_type: 'Diesel',
        cost: '',
        vendor: '',
        meter_reading: '',
    });

    useEffect(() => {
        if (fuelLog) {
            setFormData({
                asset_id: fuelLog.asset_id || '',
                date: fuelLog.date ? moment(fuelLog.date).format('YYYY-MM-DD') : '',
                quantity: fuelLog.quantity || '',
                fuel_type: fuelLog.fuel_type || 'Diesel',
                cost: fuelLog.cost || '',
                vendor: fuelLog.vendor || '',
                meter_reading: fuelLog.meter_reading || '',
            });
        } else {
            // Reset form for new fuel log
            setFormData({
                asset_id: '',
                date: moment().format('YYYY-MM-DD'), // Default to today
                quantity: '',
                fuel_type: 'Diesel',
                cost: '',
                vendor: '',
                meter_reading: '',
            });
        }
    }, [fuelLog]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                name === 'fuel_type' && value === 'Electricity'
                    ? { ...prev, vendor: 'Electric Utility' }
                    : { ...prev, [name]: value },
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate numeric fields
        if (parseFloat(formData.quantity) <= 0 || parseFloat(formData.cost) < 0) {
            alert('Please enter valid positive numbers for quantity and cost');
            return;
        }

        // Calculate cost per liter if both fields are filled
        const costPerLiter =
            formData.quantity && formData.cost
                ? (parseFloat(formData.cost) / parseFloat(formData.quantity)).toFixed(2)
                : null;

        onSubmit(formData, costPerLiter);
    };

    const calculateCostPerLiter = () => {
        if (formData.quantity && formData.cost) {
            const quantity = parseFloat(formData.quantity);
            const cost = parseFloat(formData.cost);
            return quantity > 0 ? (cost / quantity).toFixed(2) : 0;
        }
        return 0;
    };

    const fuelTypes = ['Diesel', 'Petrol', 'CNG', 'Electricity', 'Hydrogen', 'Other'];

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
                <div className="mt-3">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                        {fuelLog ? 'Edit Fuel Log' : 'Add New Fuel Log'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Fuel Details */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Fuel Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Asset *
                                    </label>
                                    <select
                                        name="asset_id"
                                        value={formData.asset_id}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        required
                                    >
                                        <option value="">Select Asset</option>
                                        {assets.map((asset) => (
                                            <option key={asset.id} value={asset.id}>
                                                {asset.asset_code} - {asset.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fuel Type *
                                    </label>
                                    <select
                                        name="fuel_type"
                                        value={formData.fuel_type}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        required
                                    >
                                        {fuelTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    max={moment().format('YYYY-MM-DD')} // Don't allow future dates
                                    className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required
                                />
                            </div>
                        </div>

                        {/* Quantity & Cost */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                Quantity & Cost
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Quantity (Liters) *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            min="0.01"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            required
                                        />
                                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 sm:text-sm">
                                            L
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Total Cost *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 sm:text-sm">
                                            $
                                        </span>
                                        <input
                                            type="number"
                                            name="cost"
                                            value={formData.cost}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cost per Liter
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 sm:text-sm">
                                            $
                                        </span>
                                        <input
                                            type="text"
                                            value={calculateCostPerLiter()}
                                            readOnly
                                            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700 font-medium"
                                            placeholder="Auto calculated"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Meter Reading & Vendor */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                Meter Reading & Vendor
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Meter Reading
                                    </label>
                                    <input
                                        type="number"
                                        name="meter_reading"
                                        value={formData.meter_reading}
                                        onChange={handleChange}
                                        min="0"
                                        placeholder="odometer reading"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        title="Current odometer or meter reading"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Vendor/Fuel Station
                                    </label>
                                    <input
                                        type="text"
                                        name="vendor"
                                        value={formData.vendor}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="Petro station name or vendor"
                                        readOnly={formData.fuel_type === 'Electricity'} // Auto-filled for electricity
                                    />
                                </div>
                            </div>

                            {/* Fuel Efficiency Preview */}
                            {formData.quantity && formData.cost && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <svg
                                                className="w-5 h-5 text-blue-500 mr-2"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm font-medium text-blue-700">
                                                Fuel Efficiency Summary
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-blue-900">
                                            ${calculateCostPerLiter()}/L
                                        </span>
                                    </div>
                                </div>
                            )}
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
                                    : fuelLog
                                      ? 'Update Fuel Log'
                                      : 'Add Fuel Log'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FuelLogForm;
