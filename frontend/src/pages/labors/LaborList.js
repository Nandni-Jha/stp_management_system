import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faEdit,
    faTrash,
    faHardHat,
    faTag,
    faDollarSign,
} from '@fortawesome/free-solid-svg-icons';
import { DataTable } from 'mantine-datatable';
import apiService from '../../services/api.service';
import LaborForm from './LaborForm';
import { confirmDelete, showSuccess, showError } from '../../components/alert.service';
import { Tooltip } from '@mantine/core';
import Layout from '../../components/Layout';

const LaborList = () => {
    const [labors, setLabors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingLabor, setEditingLabor] = useState(null);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [5, 10, 15, 20];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

    useEffect(() => {
        fetchLabors();
    }, []);

    const fetchLabors = async () => {
        try {
            setLoading(true);
            const response = await apiService.get('/labors');
            setLabors(response.data);
        } catch (error) {
            showError('Failed to fetch labors', error.errors);
            console.error('Fetch labors error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingLabor(null);
        setModalOpen(true);
    };

    const handleEdit = (labor) => {
        setEditingLabor(labor);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        const result = await confirmDelete('Please click on confirm to delete this labor.');
        if (result.isConfirmed) {
            try {
                await apiService.delete(`/labors/${id}`);
                setLabors(labors.filter((l) => l.id !== id));
                showSuccess('Labor deleted successfully.');
            } catch (error) {
                console.error('Delete labor error:', error);
            }
        }
    };

    const handleSubmit = async (formData) => {
        setSaving(true);
        try {
            if (editingLabor) {
                const response = await apiService.put(`/labors/${editingLabor.id}`, formData);
                setLabors(labors.map((l) => (l.id === editingLabor.id ? response.data : l)));
            } else {
                const response = await apiService.post('/labors', formData);
                setLabors([response.data, ...labors]);
            }
            setModalOpen(false);
            showSuccess(
                editingLabor ? 'Labor updated successfully.' : 'Labor created successfully.'
            );
        } catch (error) {
            showError(
                error.message ||
                    (editingLabor ? 'Failed to update labor' : 'Failed to create labor'),
                error.errors
            );
            console.error('Submit labor error:', error);
        } finally {
            setSaving(false);
        }
    };

    const getFilteredLabors = () => {
        let filtered = labors;

        if (search) {
            const query = search.toLowerCase();
            filtered = filtered.filter((labor) => {
                return (
                    labor.name?.toLowerCase().includes(query) ||
                    labor.category?.name?.toLowerCase().includes(query)
                );
            });
        }

        if (categoryFilter) {
            filtered = filtered.filter((labor) => labor.category_id === parseInt(categoryFilter));
        }

        return filtered;
    };

    const sortedRecords = getFilteredLabors().sort((a, b) => a.name.localeCompare(b.name));
    const totalRecords = sortedRecords.length;
    const paginatedRecords = sortedRecords.slice((page - 1) * pageSize, page * pageSize);

    const columns = [
        {
            accessor: 'category.name',
            title: 'Category',
            sortable: true,
            render: ({ category }) => (
                <div className="flex items-center">
                    <FontAwesomeIcon icon={faTag} className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                        {category?.name || 'N/A'}
                    </span>
                </div>
            ),
        },
        {
            accessor: 'name',
            title: 'Labor Name',
            sortable: true,
            render: ({ name, category }) => (
                <div className="flex items-center">
                    <FontAwesomeIcon icon={faHardHat} className="w-5 h-5 text-blue-500 mr-3" />
                    <div>
                        <div className="font-semibold text-gray-900">{name}</div>
                        <div className="text-sm text-gray-500">
                            {category?.name || 'No Category'}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            accessor: 'hour_rate',
            title: 'Per Hour Rate',
            sortable: true,
            render: ({ category }) => (
                <div className="flex items-center">
                    <div>
                        <div className="font-medium text-gray-900">
                            $ {category?.hour_rate || '0.00'}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            accessor: 'day_rate',
            title: 'Per Day Rate',
            sortable: true,
            render: ({ category }) => (
                <div className="flex items-center">
                    <div>
                        <div className="font-medium text-gray-900">
                            $ {category?.day_rate || '0.00'}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            accessor: 'actions',
            title: 'Actions',
            sortable: false,
            textAlignment: 'center',
            render: (labor) => (
                <div className="flex gap-2 justify-center">
                    <Tooltip label="Edit labor" position="bottom" withArrow>
                        <button
                            className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            onClick={() => handleEdit(labor)}
                        >
                            <FontAwesomeIcon icon={faEdit} className="text-xs" />
                        </button>
                    </Tooltip>
                    <Tooltip label="Delete labor" position="bottom" withArrow>
                        <button
                            className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            onClick={() => handleDelete(labor.id)}
                        >
                            <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        </button>
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <Layout>
            <div className="p-4 sm:p-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    {/* Header Section */}
                    <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                                        placeholder="Search labors..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white"
                                >
                                    <option value="">All Categories</option>
                                    {Array.from(new Set(labors.map((l) => l.category_id))).map(
                                        (categoryId) => {
                                            const category = labors.find(
                                                (l) => l.category_id === categoryId
                                            )?.category;
                                            return (
                                                <option key={categoryId} value={categoryId}>
                                                    {category?.name || 'Unknown'}
                                                </option>
                                            );
                                        }
                                    )}
                                </select>

                                <button
                                    className="inline-flex items-center px-4 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
                                    onClick={handleAdd}
                                >
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                    <span className="hidden sm:inline">Add Labor</span>
                                    <span className="sm:hidden">Add</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    {labors.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-600 font-medium">
                                            Total Labors
                                        </p>
                                        <p className="text-2xl font-bold text-blue-900">
                                            {labors.length}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-blue-500 rounded-full">
                                        <FontAwesomeIcon
                                            icon={faHardHat}
                                            className="w-6 h-6 text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-green-600 font-medium">
                                            Categories
                                        </p>
                                        <p className="text-2xl font-bold text-green-900">
                                            {new Set(labors.map((l) => l.category_id)).size}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-500 rounded-full">
                                        <FontAwesomeIcon
                                            icon={faTag}
                                            className="w-6 h-6 text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-purple-600 font-medium">
                                            Avg. Hour Rate
                                        </p>
                                        <p className="text-2xl font-bold text-purple-900">
                                            $
                                            {labors.length > 0
                                                ? (
                                                      labors.reduce(
                                                          (sum, l) =>
                                                              sum +
                                                              parseFloat(
                                                                  l.category?.hour_rate || 0
                                                              ),
                                                          0
                                                      ) / labors.length
                                                  ).toFixed(2)
                                                : '0.00'}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-purple-500 rounded-full">
                                        <FontAwesomeIcon
                                            icon={faDollarSign}
                                            className="w-6 h-6 text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-orange-600 font-medium">
                                            Avg. Day Rate
                                        </p>
                                        <p className="text-2xl font-bold text-orange-900">
                                            $
                                            {labors.length > 0
                                                ? (
                                                      labors.reduce(
                                                          (sum, l) =>
                                                              sum +
                                                              parseFloat(l.category?.day_rate || 0),
                                                          0
                                                      ) / labors.length
                                                  ).toFixed(2)
                                                : '0.00'}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-orange-500 rounded-full">
                                        <FontAwesomeIcon
                                            icon={faDollarSign}
                                            className="w-6 h-6 text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Labors Table */}
                    <div className="overflow-x-auto">
                        <DataTable
                            fetching={loading}
                            noRecordsText="No labors found"
                            highlightOnHover
                            className="datatable-custom"
                            records={paginatedRecords}
                            columns={columns}
                            totalRecords={totalRecords}
                            recordsPerPage={pageSize}
                            page={page}
                            onPageChange={(p) => setPage(p)}
                            recordsPerPageOptions={PAGE_SIZES}
                            onRecordsPerPageChange={setPageSize}
                            minHeight={200}
                            striped
                            paginationText={({ from, to, totalRecords }) =>
                                `Showing ${from} to ${to} of ${totalRecords} labors`
                            }
                        />
                    </div>

                    {/* Modals */}
                    {modalOpen && (
                        <LaborForm
                            labor={editingLabor}
                            onSubmit={handleSubmit}
                            onCancel={() => setModalOpen(false)}
                            loading={saving}
                        />
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default LaborList;
