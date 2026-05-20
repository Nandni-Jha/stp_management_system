import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import AssetForm from './AssetForm';
import AssetPreview from './AssetPreview';
import AssetDocumentsModal from './AssetDocumentsModal';
import apiService from '../../services/api.service';
import { DataTable } from 'mantine-datatable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faEdit, faTrash, faEye, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import Dropdown from '../../components/Dropdown';
import sortBy from 'lodash/sortBy';
import { confirmDelete, showSuccess, showError } from '../../components/alert.service';
import moment from 'moment';

const Assets = () => {
    const [assets, setAssets] = useState([]);
    const [assetTypes, setAssetTypes] = useState([]);
    const [assetCategories, setAssetCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);
    const [viewingAsset, setViewingAsset] = useState(null);
    const [documentsAsset, setDocumentsAsset] = useState(null);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [sortStatus, setSortStatus] = useState({
        columnAccessor: 'asset_code',
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
        { accessor: 'asset_code', title: 'Asset Code' },
        { accessor: 'name', title: 'Name' },
        { accessor: 'category', title: 'Category' },
        { accessor: 'brand', title: 'Brand/Model' },
        { accessor: 'location', title: 'Location' },
        { accessor: 'status', title: 'Status' },
        { accessor: 'purchase_date', title: 'Purchase Date' },
        { accessor: 'actions', title: 'Actions' },
    ];

    useEffect(() => {
        fetchAssets();
        fetchLookupData();
    }, []);

    const fetchAssets = async () => {
        try {
            let url = '/assets';
            const params = new URLSearchParams();

            if (statusFilter) params.append('status', statusFilter);
            if (typeFilter) params.append('asset_type_id', typeFilter);
            if (categoryFilter) params.append('category_id', categoryFilter);

            if (params.toString()) {
                url += '?' + params.toString();
            }

            const response = await apiService.get(url);
            setAssets(response.data);
        } catch (error) {
            showError(error.message || 'Failed to fetch assets', error.errors);
            console.error('Fetch assets error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLookupData = async () => {
        try {
            const [assetTypesRes, assetCategoriesRes, locationsRes] = await Promise.all([
                apiService.get('/asset-types'),
                apiService.get('/asset-categories'),
                apiService.get('/locations'),
            ]);

            setAssetTypes(assetTypesRes.data);
            setAssetCategories(assetCategoriesRes.data);
            setLocations(locationsRes.data);
        } catch (error) {
            console.error('Fetch lookup data error:', error);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, [statusFilter, typeFilter, categoryFilter]);

    const handleAdd = () => {
        setEditingAsset(null);
        setModalOpen(true);
    };

    const handleEdit = (asset) => {
        setEditingAsset(asset);
        setModalOpen(true);
    };

    const handleView = async (asset) => {
        try {
            const response = await apiService.get(`/assets/${asset.id}`);
            setViewingAsset(response.data);
            setViewModalOpen(true);
        } catch (error) {
            showError('Failed to fetch asset details', error.errors);
        }
    };

    const handleDelete = async (id) => {
        const result = await confirmDelete('Please click on confirm to delete this asset.');
        if (result.isConfirmed) {
            try {
                await apiService.delete(`/assets/${id}`);
                setAssets(assets.filter((a) => a.id !== id));
                showSuccess('Asset deleted successfully.');
            } catch (error) {
                console.error('Delete asset error:', error);
            }
        }
    };

    const handleDocuments = (asset) => {
        setDocumentsAsset(asset);
        setDocumentsModalOpen(true);
    };

    const handleSubmit = async (formData) => {
        setSaving(true);
        try {
            if (editingAsset) {
                const response = await apiService.put(`/assets/${editingAsset.id}`, formData);
                setAssets(assets.map((a) => (a.id === editingAsset.id ? response.data : a)));
            } else {
                const response = await apiService.post('/assets', formData);
                setAssets([response.data, ...assets]);
            }
            setModalOpen(false);
            showSuccess(
                editingAsset ? 'Asset updated successfully.' : 'Asset created successfully.'
            );
        } catch (error) {
            showError(
                error.message ||
                    (editingAsset ? 'Failed to update asset' : 'Failed to create asset'),
                error.errors
            );
            console.error('Submit asset error:', error);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [search, statusFilter, typeFilter, categoryFilter]);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    const getFilteredAssets = () => {
        let filtered = assets;

        if (search) {
            const query = search.toLowerCase();
            filtered = filtered.filter((asset) => {
                return (
                    asset.asset_code?.toLowerCase().includes(query) ||
                    asset.name?.toLowerCase().includes(query) ||
                    asset.category?.name?.toLowerCase().includes(query) ||
                    asset.brand?.toLowerCase().includes(query) ||
                    asset.model?.toLowerCase().includes(query) ||
                    asset.status?.toLowerCase().includes(query)
                );
            });
        }

        return filtered;
    };

    const sortedRecords = sortBy(getFilteredAssets(), sortStatus.columnAccessor);
    if (sortStatus.direction === 'desc') {
        sortedRecords.reverse();
    }

    const totalRecords = sortedRecords.length;
    const paginatedRecords = sortedRecords.slice((page - 1) * pageSize, page * pageSize);

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-600/20';
            case 'idle':
                return 'bg-blue-100 text-blue-800 ring-1 ring-blue-600/20';
            case 'under_maintenance':
                return 'bg-amber-100 text-amber-800 ring-1 ring-amber-600/20';
            case 'retired':
                return 'bg-red-100 text-red-800 ring-1 ring-red-600/20';
            default:
                return 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20';
        }
    };

    const columns = [
        {
            accessor: 'asset_code',
            title: 'Asset Code',
            sortable: true,
            render: ({ asset_code }) => (
                <span className="text-sm font-mono text-gray-900 font-semibold">{asset_code}</span>
            ),
            hidden: hiddenColumns.includes('asset_code'),
        },
        {
            accessor: 'name',
            title: 'Name',
            sortable: true,
            render: ({ name, asset_code }) => (
                <div className="items-center">
                    <div className="text-sm font-semibold text-gray-900">{name}</div>
                    <div className="text-xs text-gray-500 font-mono">{asset_code}</div>
                </div>
            ),
            hidden: hiddenColumns.includes('name'),
        },
        {
            accessor: 'category',
            title: 'Category',
            sortable: true,
            render: ({ category }) => (
                <span className="text-sm text-gray-700 capitalize font-medium">
                    {category?.name || 'N/A'}
                </span>
            ),
            hidden: hiddenColumns.includes('category'),
        },
        {
            accessor: 'brand',
            title: 'Brand/Model',
            sortable: true,
            render: ({ brand, model, year }) => (
                <div className="text-sm text-gray-700">
                    <div className="font-medium">
                        {brand} {model}
                    </div>
                    {year && <div className="text-xs text-gray-500">Year: {year}</div>}
                </div>
            ),
            hidden: hiddenColumns.includes('brand'),
        },
        {
            accessor: 'location',
            title: 'Location',
            sortable: true,
            render: ({ current_location }) => (
                <span className="text-sm text-gray-700 font-medium">
                    {current_location?.name || 'N/A'}
                </span>
            ),
            hidden: hiddenColumns.includes('location'),
        },
        {
            accessor: 'status',
            title: 'Status',
            sortable: true,
            render: ({ status }) => (
                <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${getStatusColor(status)}`}
                >
                    {status?.replace('_', ' ').toUpperCase()}
                </span>
            ),
            hidden: hiddenColumns.includes('status'),
        },
        {
            accessor: 'purchase_date',
            title: 'Purchase Date',
            sortable: true,
            render: ({ purchase_date }) => (
                <span className="text-sm text-gray-700 font-medium">
                    {purchase_date ? moment(purchase_date).format('YYYY-MM-DD') : 'N/A'}
                </span>
            ),
            hidden: hiddenColumns.includes('purchase_date'),
        },
        {
            accessor: 'actions',
            title: 'Actions',
            sortable: false,
            textAlignment: 'center',
            render: (asset) => (
                <div className="flex gap-2 justify-center">
                    <button
                        className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={() => handleView(asset)}
                        title="View asset details"
                    >
                        <FontAwesomeIcon icon={faEye} className="text-xs" />
                    </button>
                    <button
                        className="w-9 h-9 rounded-full bg-gray-700 hover:bg-gray-800 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        onClick={() => handleEdit(asset)}
                        title="Edit asset"
                    >
                        <FontAwesomeIcon icon={faEdit} className="text-xs" />
                    </button>
                    <button
                        className="w-9 h-9 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        onClick={() => handleDocuments(asset)}
                        title="Manage documents"
                    >
                        <FontAwesomeIcon icon={faFileAlt} className="text-xs" />
                    </button>
                    <button
                        className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        onClick={() => handleDelete(asset.id)}
                        title="Delete asset"
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
                {/* Card Container */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    {/* Header Section */}
                    <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-5">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
                                            placeholder="Search assets..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Status Filter */}
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="idle">Idle</option>
                                    <option value="under_maintenance">Under Maintenance</option>
                                    <option value="retired">Retired</option>
                                </select>

                                {/* Type Filter */}
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white"
                                >
                                    <option value="">All Types</option>
                                    {assetTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>

                                {/* Category Filter */}
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white"
                                >
                                    <option value="">All Categories</option>
                                    {assetCategories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
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
                                    <span className="hidden sm:inline">Add Asset</span>
                                    <span className="sm:hidden">Add</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="overflow-x-auto">
                        <DataTable
                            fetching={loading}
                            noRecordsText="No results match your search query"
                            highlightOnHover
                            className="datatable-custom min-w-[900px]"
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
                                `Showing ${from} to ${to} of ${totalRecords} entries`
                            }
                        />
                    </div>
                </div>
            </div>

            {modalOpen && (
                <AssetForm
                    asset={editingAsset}
                    assetTypes={assetTypes}
                    assetCategories={assetCategories}
                    locations={locations}
                    onSubmit={handleSubmit}
                    onCancel={() => setModalOpen(false)}
                    loading={saving}
                />
            )}

            {viewModalOpen && (
                <AssetPreview asset={viewingAsset} onClose={() => setViewModalOpen(false)} />
            )}

            {documentsModalOpen && (
                <AssetDocumentsModal
                    asset={documentsAsset}
                    onClose={() => setDocumentsModalOpen(false)}
                />
            )}
        </Layout>
    );
};

export default Assets;
