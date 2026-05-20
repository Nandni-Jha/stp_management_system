import React, { useState, useEffect } from 'react';

const LocationForm = ({ location, onSubmit, onCancel, loading }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        type: 'site',
        address: '',
        latitude: '',
        longitude: '',
    });

    useEffect(() => {
        if (location) {
            setFormData({
                name: location.name || '',
                type: location.type || 'site',
                address: location.address || '',
                latitude: location.latitude || '',
                longitude: location.longitude || '',
            });
        } else {
            // Reset form for new location
            setFormData({
                name: '',
                type: 'site',
                address: '',
                latitude: '',
                longitude: '',
            });
        }
    }, [location]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === 'address') {
            searchAddress(value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate coordinate values if provided
        if (formData.latitude && (formData.latitude < -90 || formData.latitude > 90)) {
            alert('Latitude must be between -90 and 90 degrees');
            return;
        }
        if (formData.longitude && (formData.longitude < -180 || formData.longitude > 180)) {
            alert('Longitude must be between -180 and 180 degrees');
            return;
        }

        onSubmit(formData);
    };

    const searchAddress = async (query) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            setIsSearching(true);

            const res = await fetch(
                `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`
            );

            const data = await res.json();
            setSuggestions(data.features || []);
        } catch (err) {
            console.error('Photon search error', err);
        } finally {
            setIsSearching(false);
        }
    };

    const selectAddress = (feature) => {
        const { coordinates } = feature.geometry;
        const props = feature.properties;

        setFormData((prev) => ({
            ...prev,
            address:
                props.name +
                (props.city ? `, ${props.city}` : '') +
                (props.country ? `, ${props.country}` : ''),
            latitude: coordinates[1].toFixed(6),
            longitude: coordinates[0].toFixed(6),
        }));

        setSuggestions([]);
    };

    const locationTypes = [
        { value: 'site', label: 'Job Site', description: 'Temporary construction sites, projects' },
        { value: 'yard', label: 'Yard', description: 'Storage or equipment yards' },
        { value: 'warehouse', label: 'Warehouse', description: 'Storage facilities, depots' },
    ];

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-2xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
                <div className="mt-3">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                        {location ? 'Edit Location' : 'Add New Location'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Location Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                Location Information
                            </h4>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Location Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            required
                                            placeholder="Enter location name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Location Type *
                                        </label>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            required
                                        >
                                            {locationTypes.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="mt-1 text-xs text-gray-500">
                                            {
                                                locationTypes.find((t) => t.value === formData.type)
                                                    ?.description
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Details */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address
                            </label>

                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Start typing address..."
                            />

                            {/* Suggestions Dropdown */}
                            {suggestions.length > 0 && (
                                <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                                    {suggestions.map((item, index) => (
                                        <li
                                            key={index}
                                            onClick={() => selectAddress(item)}
                                            className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                                        >
                                            <div className="font-medium">
                                                {item.properties.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {[
                                                    item.properties.city,
                                                    item.properties.state,
                                                    item.properties.country,
                                                ]
                                                    .filter(Boolean)
                                                    .join(', ')}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {isSearching && (
                                <div className="text-xs text-gray-400 mt-1">Searching address…</div>
                            )}
                        </div>

                        {/* Coordinates */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                GPS Coordinates (Optional)
                            </h4>
                            <div className="space-y-4">
                                <div className="text-sm text-gray-600">
                                    For tracking and mapping purposes. Leave blank if unavailable.
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Latitude
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="latitude"
                                                value={formData.latitude}
                                                onChange={handleChange}
                                                step="0.000001"
                                                min="-90"
                                                max="90"
                                                className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                placeholder="e.g., 40.7128"
                                            />
                                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 sm:text-sm">
                                                °N
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Longitude
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="longitude"
                                                value={formData.longitude}
                                                onChange={handleChange}
                                                step="0.000001"
                                                min="-180"
                                                max="180"
                                                className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                placeholder="e.g., -74.0060"
                                            />
                                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 sm:text-sm">
                                                °E
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Coordinate Preview */}
                                {formData.latitude && formData.longitude && (
                                    <div className="p-3 bg-green-50 rounded-md border border-green-200">
                                        <div className="flex items-center">
                                            <svg
                                                className="w-5 h-5 text-green-500 mr-2"
                                                fill="currentColor"
                                                viewBox="0 0 23 23"
                                            >
                                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm font-medium text-green-700">
                                                Coordinates ready for mapping
                                            </span>
                                        </div>
                                        <div className="mt-1 text-xs text-green-600 font-mono">
                                            {parseFloat(formData.latitude).toFixed(6)}°,{' '}
                                            {parseFloat(formData.longitude).toFixed(6)}°
                                        </div>
                                    </div>
                                )}
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
                                {loading
                                    ? 'Saving...'
                                    : location
                                      ? 'Update Location'
                                      : 'Create Location'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LocationForm;
