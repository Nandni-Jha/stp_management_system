import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LocationForm from './LocationForm';
import apiService from '../../services/api.service';
import { DataTable } from 'mantine-datatable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAdd,
    faEdit,
    faTrash,
    faEye,
    faMapMarkerAlt,
    faWarehouse,
} from '@fortawesome/free-solid-svg-icons';
import Dropdown from '../../components/Dropdown';
import sortBy from 'lodash/sortBy';
import { confirmDelete, showSuccess, showError } from '../../components/alert.service';

const Locations = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);
    const [viewingLocation, setViewingLocation] = useState(null);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [sortStatus, setSortStatus] = useState({
        columnAccessor: 'name',
        direction: 'asc',
    });
    const [hiddenColumns, setHiddenColumns] = useState([]);

    const toggleColumnVisibility = (columnAccessor) => {
        setHiddenColumns((prev) =>
            prev.includes(columnAccessor)
                ? prev.filter((col) => col !== columnAccessor)
                : [...prev, columnAccessor]
        );
    };

    const allColumns = [
        { accessor: 'name', title: 'Location Name' },
        { accessor: 'type', title: 'Type' },
        { accessor: 'address', title: 'Address' },
        { accessor: 'coordinates', title: 'Coordinates' },
        { accessor: 'assets_count', title: 'Assets' },
        { accessor: 'actions', title: 'Actions' },
    ];

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const response = await apiService.get('/locations');
            setLocations(response.data);
        } catch (error) {
            showError(error.message || 'Failed to fetch locations', error.errors);
            console.error('Fetch locations error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingLocation(null);
        setModalOpen(true);
    };

    const handleEdit = (location) => {
        setEditingLocation(location);
        setModalOpen(true);
    };

    const handleView = async (location) => {
        try {
            const response = await apiService.get(`/locations/${location.id}`);
            setViewingLocation({
                ...response.data,
                assets_count: response.data.assets?.length || 0,
                projects_count: response.data.projects?.length || 0,
            });
            setViewModalOpen(true);
        } catch (error) {
            showError('Failed to fetch location details', error.errors);
        }
    };

    const handleDelete = async (id) => {
        const result = await confirmDelete(
            'Please click on confirm to delete this location. Note: This will also remove all associated assets and projects.'
        );
        if (result.isConfirmed) {
            try {
                await apiService.delete(`/locations/${id}`);
                setLocations(locations.filter((l) => l.id !== id));
                showSuccess('Location deleted successfully.');
            } catch (error) {
                console.error('Delete location error:', error);
            }
        }
    };

    const handleSubmit = async (formData) => {
        setSaving(true);
        try {
            if (editingLocation) {
                const response = await apiService.put(`/locations/${editingLocation.id}`, formData);
                setLocations(
                    locations.map((l) => (l.id === editingLocation.id ? response.data : l))
                );
            } else {
                const response = await apiService.post('/locations', formData);
                setLocations([response.data, ...locations]);
            }
            setModalOpen(false);
            showSuccess(
                editingLocation
                    ? 'Location updated successfully.'
                    : 'Location created successfully.'
            );
        } catch (error) {
            showError(
                error.message ||
                    (editingLocation ? 'Failed to update location' : 'Failed to create location'),
                error.errors
            );
            console.error('Submit location error:', error);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [search, typeFilter]);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    const getFilteredLocations = () => {
        let filtered = locations;

        if (search) {
            const query = search.toLowerCase();
            filtered = filtered.filter((location) => {
                return (
                    location.name?.toLowerCase().includes(query) ||
                    location.type?.toLowerCase().includes(query) ||
                    location.address?.toLowerCase().includes(query)
                );
            });
        }

        if (typeFilter) {
            filtered = filtered.filter((location) => location.type === typeFilter);
        }

        return filtered;
    };

    const sortedRecords = sortBy(getFilteredLocations(), sortStatus.columnAccessor);
    if (sortStatus.direction === 'desc') {
        sortedRecords.reverse();
    }

    const totalRecords = sortedRecords.length;
    const paginatedRecords = sortedRecords.slice((page - 1) * pageSize, page * pageSize);

    const getTypeColor = (type) => {
        switch (type) {
            case 'site':
                return 'bg-blue-100 text-blue-800 ring-1 ring-blue-600/20';
            case 'yard':
                return 'bg-green-100 text-green-800 ring-1 ring-green-600/20';
            case 'warehouse':
                return 'bg-amber-100 text-amber-800 ring-1 ring-amber-600/20';
            default:
                return 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20';
        }
    };

    const locationTypes = [
        { value: 'site', label: 'Job Site', icon: faMapMarkerAlt },
        { value: 'yard', label: 'Yard', icon: faWarehouse },
        { value: 'warehouse', label: 'Warehouse', icon: faWarehouse },
    ];

    const columns = [
        {
            accessor: 'name',
            title: 'Location Name',
            sortable: true,
            render: ({ name, type }) => (
                <div className="flex items-center">
                    {locationTypes.find((lt) => lt.value === type) && (
                        <FontAwesomeIcon
                            icon={locationTypes.find((lt) => lt.value === type).icon}
                            className="w-5 h-5 mr-3 text-gray-400"
                        />
                    )}
                    <div>
                        <div className="text-sm font-semibold text-gray-900">{name}</div>
                        <div className="text-xs text-gray-500 capitalize">{type}</div>
                    </div>
                </div>
            ),
            hidden: hiddenColumns.includes('name'),
        },
        {
            accessor: 'type',
            title: 'Type',
            sortable: true,
            render: ({ type }) => (
                <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${getTypeColor(
                        type
                    )}`}
                >
                    {type?.replace('_', ' ').toUpperCase()}
                </span>
            ),
            hidden: hiddenColumns.includes('type'),
        },
        {
            accessor: 'address',
            title: 'Address',
            sortable: true,
            render: ({ address }) => (
                <div className="max-w-xs">
                    <div className="text-sm text-gray-700 truncate" title={address || 'N/A'}>
                        {address || 'N/A'}
                    </div>
                </div>
            ),
            hidden: hiddenColumns.includes('address'),
        },
        {
            accessor: 'coordinates',
            title: 'Coordinates',
            sortable: true,
            render: ({ latitude, longitude }) => (
                <div className="text-sm font-mono text-gray-700">
                    {latitude && longitude ? (
                        <>
                            <div>{parseFloat(latitude).toFixed(4)}°</div>
                            <div className="text-xs">{parseFloat(longitude).toFixed(4)}°</div>
                        </>
                    ) : (
                        <span className="text-gray-400">N/A</span>
                    )}
                </div>
            ),
            hidden: hiddenColumns.includes('coordinates'),
        },
        {
            accessor: 'assets_count',
            title: 'Assets Count',
            sortable: true,
            render: ({ id }) => {
                // Calculate assets count dynamically
                const locationData = locations.find((l) => l.id === id);
                const assetsCount = locationData?.assets?.length || 0;
                const projectsCount = locationData?.projects?.length || 0;

                return (
                    <div className="text-sm">
                        <div className="font-medium text-gray-900">{assetsCount} assets</div>
                        <div className="text-xs text-gray-500">{projectsCount} projects</div>
                    </div>
                );
            },
            hidden: hiddenColumns.includes('assets_count'),
        },
        {
            accessor: 'actions',
            title: 'Actions',
            sortable: false,
            textAlignment: 'center',
            render: (location) => (
                <div className="flex gap-2 justify-center">
                    <button
                        className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={() => handleView(location)}
                        title="View location details"
                    >
                        <FontAwesomeIcon icon={faEye} className="text-xs" />
                    </button>
                    <button
                        className="w-9 h-9 rounded-full bg-gray-700 hover:bg-gray-800 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        onClick={() => handleEdit(location)}
                        title="Edit location"
                    >
                        <FontAwesomeIcon icon={faEdit} className="text-xs" />
                    </button>
                    <button
                        className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        onClick={() => handleDelete(location.id)}
                        title="Delete location"
                    >
                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                    </button>
                </div>
            ),
            hidden: hiddenColumns.includes('actions'),
        },
    ];

    return (
        <Layout>
            <div className="p-4 sm:p-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                className="w-6 h-6 text-blue-500 mr-4"
                            />
                            <div>
                                <div className="text-sm font-medium text-gray-500">
                                    Total Locations
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {locations.length}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <svg
                                className="w-6 h-6 text-green-500 mr-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                            </svg>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Job Sites</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {locations.filter((l) => l.type === 'site').length}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <FontAwesomeIcon
                                icon={faWarehouse}
                                className="w-6 h-6 text-amber-500 mr-4"
                            />
                            <div>
                                <div className="text-sm font-medium text-gray-500">Warehouses</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {locations.filter((l) => l.type === 'warehouse').length}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <svg
                                className="w-6 h-6 text-purple-500 mr-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Yards</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {locations.filter((l) => l.type === 'yard').length}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card Container */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    {/* Header Section */}
                    <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            {/* Search and Filters */}
                            <div className="flex-1 flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 max-w-md">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg
                                                className="h-5 w-5 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
                                            placeholder="Search locations..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Type Filter */}
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white"
                                >
                                    <option value="">All Types</option>
                                    {locationTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                <div className="dropdown">
                                    <Dropdown
                                        placement="bottom-end"
                                        btnClassName="inline-flex items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
                                        button={
                                            <div className="flex items-center gap-2">
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                                                    />
                                                </svg>
                                                <span>Columns</span>
                                            </div>
                                        }
                                    >
                                        <ul className="!min-w-[200px] py-1">
                                            {allColumns.map((col) => (
                                                <li key={col.accessor}>
                                                    <label className="flex items-center px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                !hiddenColumns.includes(
                                                                    col.accessor
                                                                )
                                                            }
                                                            onChange={(e) => {
                                                                toggleColumnVisibility(
                                                                    col.accessor
                                                                );
                                                                e.stopPropagation();
                                                            }}
                                                            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                                                        />
                                                        <span className="ml-3 text-sm text-gray-700 font-medium">
                                                            {col.title}
                                                        </span>
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                    </Dropdown>
                                </div>

                                <button
                                    className="inline-flex items-center px-4 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleAdd}
                                >
                                    <FontAwesomeIcon icon={faAdd} className="mr-2" />
                                    <span className="hidden sm:inline">Add Location</span>
                                    <span className="sm:hidden">Add</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="overflow-x-auto">
                        <DataTable
                            fetching={loading}
                            noRecordsText="No locations found"
                            highlightOnHover
                            className="datatable-custom min-w-[800px]"
                            records={paginatedRecords}
                            columns={columns}
                            totalRecords={totalRecords}
                            recordsPerPage={pageSize}
                            page={page}
                            onPageChange={(p) => setPage(p)}
                            recordsPerPageOptions={PAGE_SIZES}
                            onRecordsPerPageChange={setPageSize}
                            sortStatus={sortStatus}
                            onSortStatusChange={setSortStatus}
                            minHeight={200}
                            striped
                            paginationText={({ from, to, totalRecords }) =>
                                `Showing ${from} to ${to} of ${totalRecords} locations`
                            }
                        />
                    </div>
                </div>
            </div>

            {modalOpen && (
                <LocationForm
                    location={editingLocation}
                    onSubmit={handleSubmit}
                    onCancel={() => setModalOpen(false)}
                    loading={saving}
                />
            )}

            {viewModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
                        <div className="mt-3">
                            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                                Location Details: {viewingLocation?.name}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Name
                                        </label>
                                        <div className="text-sm text-gray-900 font-medium">
                                            {viewingLocation?.name}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Type
                                        </label>
                                        <div className="text-sm text-gray-900 capitalize">
                                            {viewingLocation?.type}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Address
                                        </label>
                                        <div className="text-sm text-gray-900">
                                            {viewingLocation?.address || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Coordinates
                                        </label>
                                        <div className="text-sm text-gray-900 font-mono">
                                            {viewingLocation?.latitude && viewingLocation?.longitude
                                                ? `${viewingLocation.latitude}, ${viewingLocation.longitude}`
                                                : 'N/A'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Assets
                                        </label>
                                        <div className="text-sm font-medium text-blue-600">
                                            {viewingLocation?.assets_count} assigned
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Projects
                                        </label>
                                        <div className="text-sm font-medium text-green-600">
                                            {viewingLocation?.projects_count} assigned
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setViewModalOpen(false)}
                                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Locations;
