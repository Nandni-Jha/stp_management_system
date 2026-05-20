import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import OperatorForm from './OperatorForm';
import OperatorPreview from './OperatorPreview';
import apiService from '../../services/api.service';
import { DataTable } from 'mantine-datatable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faEdit, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import Dropdown from '../../components/Dropdown';
import sortBy from 'lodash/sortBy';
import { confirmDelete, showSuccess, showError } from '../../components/alert.service';
import moment from 'moment';

const Operators = () => {
    const [operators, setOperators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editingOperator, setEditingOperator] = useState(null);
    const [viewingOperator, setViewingOperator] = useState(null);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
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
        { accessor: 'name', title: 'Name' },
        { accessor: 'license_number', title: 'License Number' },
        { accessor: 'license_type', title: 'License Type' },
        { accessor: 'phone', title: 'Phone' },
        { accessor: 'status', title: 'Status' },
        { accessor: 'actions', title: 'Actions' },
    ];

    useEffect(() => {
        fetchOperators();
    }, []);

    const fetchOperators = async () => {
        try {
            const response = await apiService.get('/operators');
            setOperators(response.data);
        } catch (error) {
            showError(error.message || 'Failed to fetch operators', error.errors);
            console.error('Fetch operators error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingOperator(null);
        setModalOpen(true);
    };

    const handleEdit = (operator) => {
        setEditingOperator(operator);
        setModalOpen(true);
    };

    const handleView = async (operator) => {
        try {
            const response = await apiService.get(`/operators/${operator.id}`);
            setViewingOperator(response.data);
            setViewModalOpen(true);
        } catch (error) {
            showError('Failed to fetch operator details', error.errors);
        }
    };

    const handleDelete = async (id) => {
        const result = await confirmDelete('Please click on confirm to delete this operator.');
        if (result.isConfirmed) {
            try {
                await apiService.delete(`/operators/${id}`);
                setOperators(operators.filter((o) => o.id !== id));
                showSuccess('Operator deleted successfully.');
            } catch (error) {
                console.error('Delete operator error:', error);
            }
        }
    };

    const handleSubmit = async (formData) => {
        setSaving(true);
        try {
            if (editingOperator) {
                const response = await apiService.put(`/operators/${editingOperator.id}`, formData);
                setOperators(
                    operators.map((o) => (o.id === editingOperator.id ? response.data : o))
                );
            } else {
                const response = await apiService.post('/operators', formData);
                setOperators([response.data, ...operators]);
            }
            setModalOpen(false);
            showSuccess(
                editingOperator
                    ? 'Operator updated successfully.'
                    : 'Operator created successfully.'
            );
        } catch (error) {
            showError(
                error.message ||
                    (editingOperator ? 'Failed to update operator' : 'Failed to create operator'),
                error.errors
            );
            console.error('Submit operator error:', error);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [search, statusFilter]);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    const getFilteredOperators = () => {
        let filtered = operators;

        if (search) {
            const query = search.toLowerCase();
            filtered = filtered.filter((operator) => {
                return (
                    operator.name?.toLowerCase().includes(query) ||
                    operator.license_number?.toLowerCase().includes(query) ||
                    operator.license_type?.toLowerCase().includes(query) ||
                    operator.phone?.toLowerCase().includes(query) ||
                    operator.status?.toLowerCase().includes(query)
                );
            });
        }

        if (statusFilter) {
            filtered = filtered.filter((operator) => operator.status === statusFilter);
        }

        return filtered;
    };

    const sortedRecords = sortBy(getFilteredOperators(), sortStatus.columnAccessor);
    if (sortStatus.direction === 'desc') {
        sortedRecords.reverse();
    }

    const totalRecords = sortedRecords.length;
    const paginatedRecords = sortedRecords.slice((page - 1) * pageSize, page * pageSize);

    const getStatusColor = (status) => {
        return status === 'active'
            ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-600/20'
            : 'bg-red-100 text-red-800 ring-1 ring-red-600/20';
    };

    const columns = [
        {
            accessor: 'name',
            title: 'Name',
            sortable: true,
            render: ({ name }) => (
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                            {name.charAt(0)}
                        </div>
                    </div>
                    <div className="ml-3">
                        <div className="text-sm font-semibold text-gray-900">{name}</div>
                    </div>
                </div>
            ),
            hidden: hiddenColumns.includes('name'),
        },
        {
            accessor: 'license_number',
            title: 'License Number',
            sortable: true,
            render: ({ license_number }) => (
                <span className="text-sm font-mono text-gray-700 font-medium">
                    {license_number || 'N/A'}
                </span>
            ),
            hidden: hiddenColumns.includes('license_number'),
        },
        {
            accessor: 'license_type',
            title: 'License Type',
            sortable: true,
            render: ({ license_type }) => (
                <span className="text-sm text-gray-700 font-medium capitalize">
                    {license_type || 'N/A'}
                </span>
            ),
            hidden: hiddenColumns.includes('license_type'),
        },
        {
            accessor: 'phone',
            title: 'Phone',
            sortable: true,
            render: ({ phone }) => (
                <span className="text-sm text-gray-700 font-medium font-mono">
                    {phone || 'N/A'}
                </span>
            ),
            hidden: hiddenColumns.includes('phone'),
        },
        {
            accessor: 'status',
            title: 'Status',
            sortable: true,
            render: ({ status }) => (
                <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${getStatusColor(status)}`}
                >
                    {status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                </span>
            ),
            hidden: hiddenColumns.includes('status'),
        },
        {
            accessor: 'actions',
            title: 'Actions',
            sortable: false,
            textAlignment: 'center',
            render: (operator) => (
                <div className="flex gap-2 justify-center">
                    <button
                        className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={() => handleView(operator)}
                        title="View operator details"
                    >
                        <FontAwesomeIcon icon={faEye} className="text-xs" />
                    </button>
                    <button
                        className="w-9 h-9 rounded-full bg-gray-700 hover:bg-gray-800 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        onClick={() => handleEdit(operator)}
                        title="Edit operator"
                    >
                        <FontAwesomeIcon icon={faEdit} className="text-xs" />
                    </button>
                    <button
                        className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        onClick={() => handleDelete(operator.id)}
                        title="Delete operator"
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
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
                                            placeholder="Search operators..."
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
                                    <option value="inactive">Inactive</option>
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
                                    <span className="hidden sm:inline">Add Operator</span>
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
                <OperatorForm
                    operator={editingOperator}
                    onSubmit={handleSubmit}
                    onCancel={() => setModalOpen(false)}
                    loading={saving}
                />
            )}

            {viewModalOpen && (
                <OperatorPreview
                    operator={viewingOperator}
                    onClose={() => setViewModalOpen(false)}
                />
            )}
        </Layout>
    );
};

export default Operators;
