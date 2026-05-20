import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import FuelLogForm from './FuelLogForm';
import apiService from '../../services/api.service';
import { DataTable } from 'mantine-datatable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faEdit, faTrash, faEye, faGasPump } from '@fortawesome/free-solid-svg-icons';
import Dropdown from '../../components/Dropdown';
import sortBy from 'lodash/sortBy';
import { confirmDelete, showSuccess, showError } from '../../components/alert.service';
import moment from 'moment';

const FuelLogs = () => {
    const [fuelLogs, setFuelLogs] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editingFuelLog, setEditingFuelLog] = useState(null);
    const [viewingFuelLog, setViewingFuelLog] = useState(null);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [assetFilter, setAssetFilter] = useState('');
    const [fuelTypeFilter, setFuelTypeFilter] = useState('');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [sortStatus, setSortStatus] = useState({
        columnAccessor: 'date',
        direction: 'desc',
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
        { accessor: 'asset', title: 'Asset' },
        { accessor: 'date', title: 'Date' },
        { accessor: 'fuel_type', title: 'Fuel Type' },
        { accessor: 'quantity', title: 'Quantity' },
        { accessor: 'cost', title: 'Cost' },
        { accessor: 'meter_reading', title: 'Meter Reading' },
        { accessor: 'vendor', title: 'Vendor' },
        { accessor: 'actions', title: 'Actions' },
    ];

    useEffect(() => {
        fetchFuelLogs();
        fetchAssets();
    }, []);

    const fetchFuelLogs = async () => {
        try {
            let url = '/fuel-logs';
            const params = new URLSearchParams();

            if (assetFilter) params.append('asset_id', assetFilter);
            if (fuelTypeFilter) params.append('fuel_type', fuelTypeFilter);
            if (dateFromFilter) params.append('date_from', dateFromFilter);
            if (dateToFilter) params.append('date_to', dateToFilter);

            if (params.toString()) {
                url += '?' + params.toString();
            }

            const response = await apiService.get(url);
            setFuelLogs(response.data);
        } catch (error) {
            showError(error.message || 'Failed to fetch fuel logs', error.errors);
            console.error('Fetch fuel logs error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssets = async () => {
        try {
            const response = await apiService.get('/assets');
            setAssets(response.data);
        } catch (error) {
            console.error('Fetch assets error:', error);
        }
    };

    useEffect(() => {
        fetchFuelLogs();
    }, [assetFilter, fuelTypeFilter, dateFromFilter, dateToFilter]);

    const handleAdd = () => {
        setEditingFuelLog(null);
        setModalOpen(true);
    };

    const handleEdit = (fuelLog) => {
        setEditingFuelLog(fuelLog);
        setModalOpen(true);
    };

    const handleView = async (fuelLog) => {
        try {
            const response = await apiService.get(`/fuel-logs/${fuelLog.id}`);
            setViewingFuelLog(response.data);
            setViewModalOpen(true);
        } catch (error) {
            showError('Failed to fetch fuel log details', error.errors);
        }
    };

    const handleDelete = async (id) => {
        const result = await confirmDelete('Please click on confirm to delete this fuel log.');
        if (result.isConfirmed) {
            try {
                await apiService.delete(`/fuel-logs/${id}`);
                setFuelLogs(fuelLogs.filter((l) => l.id !== id));
                showSuccess('Fuel log deleted successfully.');
            } catch (error) {
                console.error('Delete fuel log error:', error);
            }
        }
    };

    const handleSubmit = async (formData) => {
        setSaving(true);
        try {
            if (editingFuelLog) {
                const response = await apiService.put(`/fuel-logs/${editingFuelLog.id}`, formData);
                setFuelLogs(fuelLogs.map((l) => (l.id === editingFuelLog.id ? response.data : l)));
            } else {
                const response = await apiService.post('/fuel-logs', formData);
                setFuelLogs([response.data, ...fuelLogs]);
            }
            setModalOpen(false);
            showSuccess(
                editingFuelLog ? 'Fuel log updated successfully.' : 'Fuel log created successfully.'
            );
        } catch (error) {
            showError(
                error.message ||
                    (editingFuelLog ? 'Failed to update fuel log' : 'Failed to create fuel log'),
                error.errors
            );
            console.error('Submit fuel log error:', error);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [search, assetFilter, fuelTypeFilter, dateFromFilter, dateToFilter]);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    const getFilteredFuelLogs = () => {
        let filtered = fuelLogs;

        if (search) {
            const query = search.toLowerCase();
            filtered = filtered.filter((fuelLog) => {
                return (
                    fuelLog.asset?.name?.toLowerCase().includes(query) ||
                    fuelLog.asset?.asset_code?.toLowerCase().includes(query) ||
                    fuelLog.fuel_type?.toLowerCase().includes(query) ||
                    fuelLog.vendor?.toLowerCase().includes(query) ||
                    fuelLog.quantity?.toString().includes(query) ||
                    fuelLog.cost?.toString().includes(query)
                );
            });
        }

        return filtered;
    };

    const sortedRecords = sortBy(getFilteredFuelLogs(), sortStatus.columnAccessor);
    if (sortStatus.direction === 'desc') {
        sortedRecords.reverse();
    }

    const totalRecords = sortedRecords.length;
    const paginatedRecords = sortedRecords.slice((page - 1) * pageSize, page * pageSize);

    // Calculate fuel efficiency metrics
    const totalCost = paginatedRecords.reduce((sum, log) => sum + parseFloat(log.cost || 0), 0);
    const totalQuantity = paginatedRecords.reduce(
        (sum, log) => sum + parseFloat(log.quantity || 0),
        0
    );
    const averageCostPerLiter = totalQuantity > 0 ? totalCost / totalQuantity : 0;

    // Fuel types for filter
    const fuelTypes = ['Diesel', 'Petrol', 'CNG', 'Electricity', 'Hydrogen', 'Other'];

    const columns = [
        {
            accessor: 'asset',
            title: 'Asset',
            sortable: true,
            render: ({ asset }) => (
                <div className="flex items-center">
                    <FontAwesomeIcon icon={faGasPump} className="w-5 h-5 mr-3 text-green-500" />
                    <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-gray-900">
                            {asset?.name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">{asset?.asset_code}</div>
                    </div>
                </div>
            ),
            hidden: hiddenColumns.includes('asset'),
        },
        {
            accessor: 'date',
            title: 'Date',
            sortable: true,
            render: ({ date }) => (
                <span className="text-sm text-gray-700 font-medium">
                    {moment(date).format('MMM DD, YYYY')}
                </span>
            ),
            hidden: hiddenColumns.includes('date'),
        },
        {
            accessor: 'fuel_type',
            title: 'Fuel Type',
            sortable: true,
            render: ({ fuel_type }) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {fuel_type}
                </span>
            ),
            hidden: hiddenColumns.includes('fuel_type'),
        },
        {
            accessor: 'quantity',
            title: 'Quantity (L)',
            sortable: true,
            render: ({ quantity }) => (
                <div className="text-sm text-gray-700">
                    <div className="font-medium">{parseFloat(quantity).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">liters</div>
                </div>
            ),
            hidden: hiddenColumns.includes('quantity'),
        },
        {
            accessor: 'cost',
            title: 'Cost',
            sortable: true,
            render: ({ cost, quantity }) => {
                const costPerLiter = parseFloat(cost) / parseFloat(quantity);
                return (
                    <div className="text-sm text-gray-700">
                        <div className="font-medium">${parseFloat(cost).toFixed(2)}</div>
                        <div className="text-xs text-gray-500">${costPerLiter.toFixed(2)}/L</div>
                    </div>
                );
            },
            hidden: hiddenColumns.includes('cost'),
        },
        {
            accessor: 'meter_reading',
            title: 'Meter Reading',
            sortable: true,
            render: ({ meter_reading }) => (
                <span className="text-sm font-mono text-gray-700 font-medium">
                    {meter_reading ? parseFloat(meter_reading).toLocaleString() : 'N/A'}
                </span>
            ),
            hidden: hiddenColumns.includes('meter_reading'),
        },
        {
            accessor: 'vendor',
            title: 'Vendor',
            sortable: true,
            render: ({ vendor }) => (
                <span className="text-sm text-gray-700 font-medium">{vendor || 'N/A'}</span>
            ),
            hidden: hiddenColumns.includes('vendor'),
        },
        {
            accessor: 'actions',
            title: 'Actions',
            sortable: false,
            textAlignment: 'center',
            render: (fuelLog) => (
                <div className="flex gap-2 justify-center">
                    <button
                        className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={() => handleView(fuelLog)}
                        title="View fuel log details"
                    >
                        <FontAwesomeIcon icon={faEye} className="text-xs" />
                    </button>
                    <button
                        className="w-9 h-9 rounded-full bg-gray-700 hover:bg-gray-800 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        onClick={() => handleEdit(fuelLog)}
                        title="Edit fuel log"
                    >
                        <FontAwesomeIcon icon={faEdit} className="text-xs" />
                    </button>
                    <button
                        className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        onClick={() => handleDelete(fuelLog.id)}
                        title="Delete fuel log"
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 rounded-full bg-green-100">
                                <FontAwesomeIcon
                                    icon={faGasPump}
                                    className="w-6 h-6 text-green-600"
                                />
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-500">
                                    Total Fuel Cost
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                    $
                                    {totalCost.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 rounded-full bg-blue-100">
                                <svg
                                    className="w-6 h-6 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012-2m-6 6h2"
                                    />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-500">
                                    Total Fuel Quantity
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {totalQuantity.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}{' '}
                                    L
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 rounded-full bg-purple-100">
                                <svg
                                    className="w-6 h-6 text-purple-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-500">
                                    Average Cost/Liter
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                    ${averageCostPerLiter.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

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
                                            placeholder="Search fuel logs..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Asset Filter */}
                                <select
                                    value={assetFilter}
                                    onChange={(e) => setAssetFilter(e.target.value)}
                                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white"
                                >
                                    <option value="">All Assets</option>
                                    {assets.map((asset) => (
                                        <option key={asset.id} value={asset.id}>
                                            {asset.asset_code} - {asset.name}
                                        </option>
                                    ))}
                                </select>

                                {/* Fuel Type Filter */}
                                <select
                                    value={fuelTypeFilter}
                                    onChange={(e) => setFuelTypeFilter(e.target.value)}
                                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white"
                                >
                                    <option value="">All Fuel Types</option>
                                    {fuelTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>

                                {/* Date Filters */}
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        placeholder="From Date"
                                        value={dateFromFilter}
                                        onChange={(e) => setDateFromFilter(e.target.value)}
                                        className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white"
                                    />
                                    <input
                                        type="date"
                                        placeholder="To Date"
                                        value={dateToFilter}
                                        onChange={(e) => setDateToFilter(e.target.value)}
                                        className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white"
                                    />
                                </div>
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
                                    <span className="hidden sm:inline">Add Fuel Log</span>
                                    <span className="sm:hidden">Add</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="overflow-x-auto">
                        <DataTable
                            fetching={loading}
                            noRecordsText="No fuel logs found"
                            highlightOnHover
                            className="datatable-custom min-w-[1000px]"
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
                                `Showing ${from} to ${to} of ${totalRecords} fuel logs`
                            }
                        />
                    </div>
                </div>
            </div>

            {modalOpen && (
                <FuelLogForm
                    fuelLog={editingFuelLog}
                    assets={assets}
                    onSubmit={handleSubmit}
                    onCancel={() => setModalOpen(false)}
                    loading={saving}
                />
            )}
        </Layout>
    );
};

export default FuelLogs;

<environment_details>
    <error></error>
</environment_details>;
