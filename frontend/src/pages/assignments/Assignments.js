import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import AssignmentForm from './AssignmentForm';
import AssignmentPreview from './AssignmentPreview';
import apiService from '../../services/api.service';
import { DataTable } from 'mantine-datatable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faEdit, faTrash, faEye, faLink } from '@fortawesome/free-solid-svg-icons';
import Dropdown from '../../components/Dropdown';
import sortBy from 'lodash/sortBy';
import { confirmDelete, showSuccess, showError } from '../../components/alert.service';
import moment from 'moment';

const Assignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [assets, setAssets] = useState([]);
    const [operators, setOperators] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [viewingAssignment, setViewingAssignment] = useState(null);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [usageTypeFilter, setUsageTypeFilter] = useState('');
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [sortStatus, setSortStatus] = useState({
        columnAccessor: 'assigned_from',
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
        { accessor: 'operator', title: 'Operator' },
        { accessor: 'project', title: 'Project' },
        { accessor: 'assigned_from', title: 'Assigned From' },
        { accessor: 'assigned_to', title: 'Assigned To' },
        { accessor: 'usage_type', title: 'Usage Type' },
        { accessor: 'actions', title: 'Actions' },
    ];

    useEffect(() => {
        fetchAssignments();
        fetchLookupData();
    }, []);

    const fetchAssignments = async () => {
        try {
            const response = await apiService.get('/asset-assignments');
            setAssignments(response.data);
        } catch (error) {
            showError(error.message || 'Failed to fetch assignments', error.errors);
            console.error('Fetch assignments error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLookupData = async () => {
        try {
            const [assetsRes, operatorsRes, projectsRes] = await Promise.all([
                apiService.get('/assets'),
                apiService.get('/operators'),
                apiService.get('/projects'),
            ]);

            setAssets(assetsRes.data);
            setOperators(operatorsRes.data);
            setProjects(projectsRes.data);
        } catch (error) {
            console.error('Fetch lookup data error:', error);
        }
    };

    const handleAdd = () => {
        setEditingAssignment(null);
        setModalOpen(true);
    };

    const handleEdit = (assignment) => {
        setEditingAssignment(assignment);
        setModalOpen(true);
    };

    const handleView = async (assignment) => {
        try {
            const response = await apiService.get(`/asset-assignments/${assignment.id}`);
            setViewingAssignment(response.data);
            setViewModalOpen(true);
        } catch (error) {
            showError('Failed to fetch assignment details', error.errors);
        }
    };

    const handleDelete = async (id) => {
        const result = await confirmDelete('Please click on confirm to delete this assignment.');
        if (result.isConfirmed) {
            try {
                await apiService.delete(`/asset-assignments/${id}`);
                setAssignments(assignments.filter((a) => a.id !== id));
                showSuccess('Assignment deleted successfully.');
            } catch (error) {
                console.error('Delete assignment error:', error);
            }
        }
    };

    const handleSubmit = async (formData) => {
        setSaving(true);
        try {
            if (editingAssignment) {
                const response = await apiService.put(
                    `/asset-assignments/${editingAssignment.id}`,
                    formData
                );
                setAssignments(
                    assignments.map((a) => (a.id === editingAssignment.id ? response.data : a))
                );
            } else {
                const response = await apiService.post('/asset-assignments', formData);
                setAssignments([response.data, ...assignments]);
            }
            setModalOpen(false);
            showSuccess(
                editingAssignment
                    ? 'Assignment updated successfully.'
                    : 'Assignment created successfully.'
            );
        } catch (error) {
            showError(
                error.message ||
                    (editingAssignment
                        ? 'Failed to update assignment'
                        : 'Failed to create assignment'),
                error.errors
            );
            console.error('Submit assignment error:', error);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [search, usageTypeFilter]);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    const getFilteredAssignments = () => {
        let filtered = assignments;

        if (search) {
            const query = search.toLowerCase();
            filtered = filtered.filter((assignment) => {
                return (
                    assignment.asset?.name?.toLowerCase().includes(query) ||
                    assignment.operator?.name?.toLowerCase().includes(query) ||
                    assignment.project?.name?.toLowerCase().includes(query) ||
                    assignment.usage_type?.toLowerCase().includes(query)
                );
            });
        }

        if (usageTypeFilter) {
            filtered = filtered.filter((assignment) => assignment.usage_type === usageTypeFilter);
        }

        return filtered;
    };

    const sortedRecords = sortBy(getFilteredAssignments(), sortStatus.columnAccessor);
    if (sortStatus.direction === 'desc') {
        sortedRecords.reverse();
    }

    const totalRecords = sortedRecords.length;
    const paginatedRecords = sortedRecords.slice((page - 1) * pageSize, page * pageSize);

    const getUsageTypeColor = (type) => {
        return type === 'full_day'
            ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-600/20'
            : 'bg-purple-100 text-purple-800 ring-1 ring-purple-600/20';
    };

    const isAssignmentActive = (assignment) => {
        const now = moment();
        const fromDate = moment(assignment.assigned_from);
        const toDate = assignment.assigned_to ? moment(assignment.assigned_to) : null;

        if (toDate) {
            return now.isBetween(fromDate, toDate, null, '[]');
        } else {
            return now.isAfter(fromDate);
        }
    };

    const columns = [
        {
            accessor: 'asset',
            title: 'Asset',
            sortable: true,
            render: ({ asset }) => (
                <div className="items-center">
                    <div className="text-sm font-semibold text-gray-900">
                        {asset?.name || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">{asset?.asset_code}</div>
                </div>
            ),
            hidden: hiddenColumns.includes('asset'),
        },
        {
            accessor: 'operator',
            title: 'Operator',
            sortable: true,
            render: ({ operator }) => (
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                            {operator?.name.charAt(0)}
                        </div>
                    </div>
                    <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900">
                            {operator?.name || 'N/A'}
                        </div>
                    </div>
                </div>
            ),
            hidden: hiddenColumns.includes('operator'),
        },
        {
            accessor: 'project',
            title: 'Project',
            sortable: true,
            render: ({ project }) => (
                <div className="flex items-center">
                    <FontAwesomeIcon icon={faLink} className="w-4 h-4 mr-2 text-gray-400" />
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            {project?.name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">{project?.client_name}</div>
                    </div>
                </div>
            ),
            hidden: hiddenColumns.includes('project'),
        },
        {
            accessor: 'assigned_from',
            title: 'Assigned From',
            sortable: true,
            render: ({ assigned_from }) => (
                <div className="text-sm text-gray-700">
                    <div className="font-medium">
                        {moment(assigned_from).format('MMM DD, YYYY')}
                    </div>
                    <div className="text-xs text-gray-500">
                        {moment(assigned_from).format('HH:mm')}
                    </div>
                </div>
            ),
            hidden: hiddenColumns.includes('assigned_from'),
        },
        {
            accessor: 'assigned_to',
            title: 'Assigned To',
            sortable: true,
            render: ({ assigned_to }) => (
                <div className="text-sm text-gray-700">
                    {assigned_to ? (
                        <>
                            <div className="font-medium">
                                {moment(assigned_to).format('MMM DD, YYYY')}
                            </div>
                            <div className="text-xs text-gray-500">
                                {moment(assigned_to).format('HH:mm')}
                            </div>
                        </>
                    ) : (
                        <span className="text-gray-400 italic">Ongoing</span>
                    )}
                </div>
            ),
            hidden: hiddenColumns.includes('assigned_to'),
        },
        {
            accessor: 'usage_type',
            title: 'Usage Type',
            sortable: true,
            render: (assignment) => (
                <div className="flex items-center">
                    <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${getUsageTypeColor(
                            assignment.usage_type
                        )}`}
                    >
                        {assignment.usage_type?.replace('_', ' ').toUpperCase()}
                    </span>
                    {assignment.assigned_to || isAssignmentActive(assignment) ? (
                        <div
                            className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"
                            title="Currently Active"
                        />
                    ) : null}
                </div>
            ),
            hidden: hiddenColumns.includes('usage_type'),
        },
        {
            accessor: 'actions',
            title: 'Actions',
            sortable: false,
            textAlignment: 'center',
            render: (assignment) => (
                <div className="flex gap-2 justify-center">
                    <button
                        className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={() => handleView(assignment)}
                        title="View assignment details"
                    >
                        <FontAwesomeIcon icon={faEye} className="text-xs" />
                    </button>
                    <button
                        className="w-9 h-9 rounded-full bg-gray-700 hover:bg-gray-800 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        onClick={() => handleEdit(assignment)}
                        title="Edit assignment"
                    >
                        <FontAwesomeIcon icon={faEdit} className="text-xs" />
                    </button>
                    <button
                        className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        onClick={() => handleDelete(assignment.id)}
                        title="Delete assignment"
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
                                            placeholder="Search assignments..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Usage Type Filter */}
                                <select
                                    value={usageTypeFilter}
                                    onChange={(e) => setUsageTypeFilter(e.target.value)}
                                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white"
                                >
                                    <option value="">All Usage Types</option>
                                    <option value="full_day">Full Day</option>
                                    <option value="hourly">Hourly</option>
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
                                    <span className="hidden sm:inline">Assign Asset</span>
                                    <span className="sm:hidden">Assign</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="overflow-x-auto">
                        <DataTable
                            fetching={loading}
                            noRecordsText="No assignments found"
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
                                `Showing ${from} to ${to} of ${totalRecords} assignments`
                            }
                        />
                    </div>
                </div>
            </div>

            {modalOpen && (
                <AssignmentForm
                    assignment={editingAssignment}
                    assets={assets}
                    operators={operators}
                    projects={projects}
                    onSubmit={handleSubmit}
                    onCancel={() => setModalOpen(false)}
                    loading={saving}
                />
            )}

            {viewModalOpen && (
                <AssignmentPreview
                    assignment={viewingAssignment}
                    onClose={() => setViewModalOpen(false)}
                />
            )}
        </Layout>
    );
};

export default Assignments;
