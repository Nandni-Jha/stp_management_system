import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import VendorForm from './VendorForm';
import apiService from '../../services/api.service';
import { DataTable } from 'mantine-datatable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faEdit, faTrash, faBuilding } from '@fortawesome/free-solid-svg-icons';
import Dropdown from '../../components/Dropdown';
import sortBy from 'lodash/sortBy';
import { confirmDelete, showSuccess, showError } from '../../components/alert.service';

const Vendors = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
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
        { accessor: 'name', title: 'Vendor Name' },
        { accessor: 'type', title: 'Type' },
        { accessor: 'contact_details', title: 'Contact Details' },
        { accessor: 'actions', title: 'Actions' },
    ];

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const response = await apiService.get('/vendors');
            setVendors(response.data);
        } catch (error) {
            showError(error.message || 'Failed to fetch vendors', error.errors);
            console.error('Fetch vendors error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingVendor(null);
        setModalOpen(true);
    };

    const handleEdit = (vendor) => {
        setEditingVendor(vendor);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        const result = await confirmDelete('Please click on confirm to delete this vendor.');
        if (result.isConfirmed) {
            try {
                await apiService.delete(`/vendors/${id}`);
                setVendors(vendors.filter((v) => v.id !== id));
                showSuccess('Vendor deleted successfully.');
            } catch (error) {
                console.error('Delete vendor error:', error);
            }
        }
    };

    const handleSubmit = async (formData) => {
        setSaving(true);
        try {
            if (editingVendor) {
                const response = await apiService.put(`/vendors/${editingVendor.id}`, formData);
                setVendors(vendors.map((v) => (v.id === editingVendor.id ? response.data : v)));
            } else {
                const response = await apiService.post('/vendors', formData);
                setVendors([response.data, ...vendors]);
            }
            setModalOpen(false);
            showSuccess(
                editingVendor ? 'Vendor updated successfully.' : 'Vendor created successfully.'
            );
        } catch (error) {
            showError(
                error.message ||
                    (editingVendor ? 'Failed to update vendor' : 'Failed to create vendor'),
                error.errors
            );
            console.error('Submit vendor error:', error);
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

    const getFilteredVendors = () => {
        let filtered = vendors;

        if (search) {
            const query = search.toLowerCase();
            filtered = filtered.filter((vendor) => {
                return (
                    vendor.name?.toLowerCase().includes(query) ||
                    vendor.type?.toLowerCase().includes(query) ||
                    vendor.contact_details?.toLowerCase().includes(query)
                );
            });
        }

        if (typeFilter) {
            filtered = filtered.filter((vendor) => vendor.type === typeFilter);
        }

        return filtered;
    };

    const sortedRecords = sortBy(getFilteredVendors(), sortStatus.columnAccessor);
    if (sortStatus.direction === 'desc') {
        sortedRecords.reverse();
    }

    const totalRecords = sortedRecords.length;
    const paginatedRecords = sortedRecords.slice((page - 1) * pageSize, page * pageSize);

    const getVendorTypeColor = (type) => {
        if (!type) return 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20';

        const typeLower = type.toLowerCase();
        if (typeLower.includes('fuel') || typeLower.includes('petrol')) {
            return 'bg-orange-100 text-orange-800 ring-1 ring-orange-600/20';
        } else if (typeLower.includes('maintenance') || typeLower.includes('service')) {
            return 'bg-blue-100 text-blue-800 ring-1 ring-blue-600/20';
        } else if (typeLower.includes('parts') || typeLower.includes('spare')) {
            return 'bg-green-100 text-green-800 ring-1 ring-green-600/20';
        } else {
            return 'bg-purple-100 text-purple-800 ring-1 ring-purple-600/20';
        }
    };

    const columns = [
        {
            accessor: 'name',
            title: 'Vendor Name',
            sortable: true,
            render: ({ name }) => (
                <div className="flex items-center">
                    <FontAwesomeIcon icon={faBuilding} className="w-5 h-5 mr-3 text-gray-400" />
                    <div>
                        <div className="text-sm font-semibold text-gray-900">{name}</div>
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
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${
                        type
                            ? getVendorTypeColor(type)
                            : 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20'
                    }`}
                >
                    {type || 'Not specified'}
                </span>
            ),
            hidden: hiddenColumns.includes('type'),
        },
        {
            accessor: 'contact_details',
            title: 'Contact Details',
            sortable: false,
            render: ({ contact_details }) => (
                <div className="text-sm text-gray-700">
                    {contact_details ? (
                        <div className="max-w-xs truncate" title={contact_details}>
                            {contact_details}
                        </div>
                    ) : (
                        <span className="text-gray-400 italic">No contact details</span>
                    )}
                </div>
            ),
            hidden: hiddenColumns.includes('contact_details'),
        },
        {
            accessor: 'actions',
            title: 'Actions',
            sortable: false,
            textAlignment: 'center',
            render: (vendor) => (
                <div className="flex gap-2 justify-center">
                    <button
                        className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={() => handleEdit(vendor)}
                        title="Edit vendor"
                    >
                        <FontAwesomeIcon icon={faEdit} className="text-xs" />
                    </button>
                    <button
                        className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        onClick={() => handleDelete(vendor.id)}
                        title="Delete vendor"
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
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                            placeholder="Search vendors..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Type Filter */}
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                                >
                                    <option value="">All Types</option>
                                    <option value="Fuel Supplier">Fuel Supplier</option>
                                    <option value="Maintenance Provider">
                                        Maintenance Provider
                                    </option>
                                    <option value="Parts Supplier">Parts Supplier</option>
                                    <option value="Service Provider">Service Provider</option>
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                <div className="dropdown">
                                    <Dropdown
                                        placement="bottom-end"
                                        btnClassName="inline-flex items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
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
                                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
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
                                    className="inline-flex items-center px-4 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleAdd}
                                >
                                    <FontAwesomeIcon icon={faAdd} className="mr-2" />
                                    <span className="hidden sm:inline">Add Vendor</span>
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
                                `Showing ${from} to ${to} of ${totalRecords} entries`
                            }
                        />
                    </div>
                </div>
            </div>

            {modalOpen && (
                <VendorForm
                    vendor={editingVendor}
                    onSubmit={handleSubmit}
                    onCancel={() => setModalOpen(false)}
                    loading={saving}
                />
            )}
        </Layout>
    );
};

export default Vendors;
