import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faEdit,
    faTrash,
    faEye,
    faCalendarAlt,
    faDollarSign,
    faClock,
    faListUl,
    faCheckCircle,
    faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { DataTable } from 'mantine-datatable';
import moment from 'moment';
import apiService from '../../services/api.service';
import MilestoneForm from './MilestoneForm';
import MilestonePreview from './MilestonePreview';
import MilestoneBudgetModal from './MilestoneBudgetModal';
import { confirmDelete, showSuccess, showError } from '../../components/alert.service';
import { Tooltip } from '@mantine/core';

const MilestoneList = ({ projectId, project }) => {
    const navigate = useNavigate();
    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState(null);
    const [previewMilestone, setPreviewMilestone] = useState(null);
    const [budgetMilestone, setBudgetMilestone] = useState(null);
    const [expenseMilestone, setExpenseMilestone] = useState(null);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [5, 10, 15, 20];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

    useEffect(() => {
        if (projectId) {
            fetchMilestones();
        }
    }, [projectId]);

    const fetchMilestones = async () => {
        try {
            setLoading(true);
            const response = await apiService.get(`/milestones`);
            setMilestones(response.data.filter((m) => m.project_id === parseInt(projectId)));
        } catch (error) {
            showError('Failed to fetch milestones', error.errors);
            console.error('Fetch milestones error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingMilestone(null);
        setModalOpen(true);
    };

    const handleEdit = (milestone) => {
        setEditingMilestone(milestone);
        setModalOpen(true);
    };

    const handleView = (milestone) => {
        setPreviewMilestone(milestone);
    };

    const handleClosePreview = () => {
        setPreviewMilestone(null);
    };

    const handleManageBudget = (milestone) => {
        setBudgetMilestone(milestone);
    };

    const handleCloseBudget = () => {
        setBudgetMilestone(null);
    };

    const handleManageExpenses = (milestone) => {
        setExpenseMilestone(milestone);
    };

    const handleCloseExpense = () => {
        setExpenseMilestone(null);
    };

    const handleDelete = async (id) => {
        const result = await confirmDelete('Please click on confirm to delete this milestone.');
        if (result.isConfirmed) {
            try {
                await apiService.delete(`/milestones/${id}`);
                setMilestones(milestones.filter((m) => m.id !== id));
                showSuccess('Milestone deleted successfully.');
            } catch (error) {
                console.error('Delete milestone error:', error);
            }
        }
    };

    const handleSubmit = async (formData) => {
        setSaving(true);
        try {
            const data = {
                ...formData,
                project_id: projectId,
            };

            if (editingMilestone) {
                const response = await apiService.put(`/milestones/${editingMilestone.id}`, data);
                setMilestones(
                    milestones.map((m) => (m.id === editingMilestone.id ? response.data : m))
                );
            } else {
                const response = await apiService.post('/milestones', data);
                setMilestones([response.data, ...milestones]);
            }
            setModalOpen(false);
            showSuccess(
                editingMilestone
                    ? 'Milestone updated successfully.'
                    : 'Milestone created successfully.'
            );
        } catch (error) {
            showError(
                error.message ||
                    (editingMilestone
                        ? 'Failed to update milestone'
                        : 'Failed to create milestone'),
                error.errors
            );
            console.error('Submit milestone error:', error);
        } finally {
            setSaving(false);
        }
    };

    const getFilteredMilestones = () => {
        let filtered = milestones;

        if (search) {
            const query = search.toLowerCase();
            filtered = filtered.filter((milestone) => {
                return (
                    milestone.name?.toLowerCase().includes(query) ||
                    milestone.description?.toLowerCase().includes(query) ||
                    milestone.status?.toLowerCase().includes(query)
                );
            });
        }

        if (statusFilter) {
            filtered = filtered.filter((milestone) => milestone.status === statusFilter);
        }

        return filtered;
    };

    const sortedRecords = getFilteredMilestones().sort(
        (a, b) => new Date(a.target_date) - new Date(b.target_date)
    );
    const totalRecords = sortedRecords.length;
    const paginatedRecords = sortedRecords.slice((page - 1) * pageSize, page * pageSize);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 ring-1 ring-blue-600/20';
            case 'completed':
                return 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-600/20';
            case 'delayed':
                return 'bg-red-100 text-red-800 ring-1 ring-red-600/20';
            default:
                return 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20';
        }
    };

    const calculateDaysUntil = (targetDate) => {
        const target = moment(targetDate);
        const today = moment();
        const diff = target.diff(today, 'days');

        if (diff < 0) return `Overdue by ${Math.abs(diff)} days`;
        if (diff === 0) return 'Due today';
        if (diff === 1) return 'Due tomorrow';
        return `Due in ${diff} days`;
    };

    const columns = [
        {
            accessor: 'name',
            title: 'Milestone Name',
            sortable: true,
            render: ({ name, status }) => (
                <div className="flex items-center">
                    <div
                        className={`w-3 h-3 rounded-full mr-3 ${
                            status === 'completed'
                                ? 'bg-emerald-500'
                                : status === 'in_progress'
                                  ? 'bg-blue-500'
                                  : status === 'delayed'
                                    ? 'bg-red-500'
                                    : 'bg-gray-400'
                        }`}
                    ></div>
                    <div>
                        <div className="font-semibold text-gray-900">{name}</div>
                        <div className="text-xs text-gray-500 capitalize">
                            {status.replace('_', ' ')}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            accessor: 'target_date',
            title: 'Target Date',
            sortable: true,
            render: ({ target_date, status }) => (
                <div className="flex items-center">
                    <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 text-gray-400 mr-2" />
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            {moment(target_date).format('MMM DD, YYYY')}
                        </div>
                        <div
                            className={`text-xs ${status === 'delayed' ? 'text-red-600' : 'text-gray-500'}`}
                        >
                            {calculateDaysUntil(target_date)}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            accessor: 'actual_date',
            title: 'Actual Date',
            sortable: true,
            render: ({ actual_date, status }) => (
                <div>
                    {actual_date ? (
                        <div className="text-sm font-medium text-gray-900">
                            {moment(actual_date).format('MMM DD, YYYY')}
                        </div>
                    ) : (
                        <span className="text-sm text-gray-500">Not completed</span>
                    )}
                    {status === 'delayed' && (
                        <div className="flex items-center mt-1 text-red-600">
                            <FontAwesomeIcon
                                icon={faExclamationTriangle}
                                className="w-3 h-3 mr-1"
                            />
                            <span className="text-xs">Delayed</span>
                        </div>
                    )}
                </div>
            ),
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
        },
        {
            accessor: 'actions',
            title: 'Actions',
            sortable: false,
            textAlignment: 'center',
            render: (milestone) => (
                <div className="flex gap-2 justify-center">
                    <Tooltip label="View milestone details" position="bottom" withArrow>
                        <button
                            className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            onClick={() => handleView(milestone)}
                        >
                            <FontAwesomeIcon icon={faEye} className="text-xs" />
                        </button>
                    </Tooltip>
                    <Tooltip label="Manage budget" position="bottom" withArrow>
                        <button
                            className="w-9 h-9 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            onClick={() => handleManageBudget(milestone)}
                        >
                            <FontAwesomeIcon icon={faDollarSign} className="text-xs" />
                        </button>
                    </Tooltip>
                    <Tooltip label="Manage expenses" position="bottom" withArrow>
                        <button
                            className="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                            onClick={() => handleManageExpenses(milestone)}
                        >
                            <FontAwesomeIcon icon={faListUl} className="text-xs" />
                        </button>
                    </Tooltip>
                    <Tooltip label="Edit milestone" position="bottom" withArrow>
                        <button
                            className="w-9 h-9 rounded-full bg-gray-700 hover:bg-gray-800 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            onClick={() => handleEdit(milestone)}
                        >
                            <FontAwesomeIcon icon={faEdit} className="text-xs" />
                        </button>
                    </Tooltip>
                    <Tooltip label="Delete milestone" position="bottom" withArrow>
                        <button
                            className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            onClick={() => handleDelete(milestone.id)}
                        >
                            <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        </button>
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            {/* Header */}
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
                            placeholder="Search milestones..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="delayed">Delayed</option>
                    </select>

                    <button
                        className="inline-flex items-center px-4 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
                        onClick={handleAdd}
                    >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        <span className="hidden sm:inline">Add Milestone</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            {milestones.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 font-medium">
                                    Total Milestones
                                </p>
                                <p className="text-2xl font-bold text-blue-900">
                                    {milestones.length}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-500 rounded-full">
                                <FontAwesomeIcon
                                    icon={faCalendarAlt}
                                    className="w-6 h-6 text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 font-medium">Completed</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {milestones.filter((m) => m.status === 'completed').length}
                                </p>
                            </div>
                            <div className="p-3 bg-green-500 rounded-full">
                                <FontAwesomeIcon
                                    icon={faCheckCircle}
                                    className="w-6 h-6 text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-600 font-medium">In Progress</p>
                                <p className="text-2xl font-bold text-orange-900">
                                    {milestones.filter((m) => m.status === 'in_progress').length}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-500 rounded-full">
                                <FontAwesomeIcon icon={faClock} className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-600 font-medium">Delayed</p>
                                <p className="text-2xl font-bold text-red-900">
                                    {milestones.filter((m) => m.status === 'delayed').length}
                                </p>
                            </div>
                            <div className="p-3 bg-red-500 rounded-full">
                                <FontAwesomeIcon
                                    icon={faExclamationTriangle}
                                    className="w-6 h-6 text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Milestones Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                    <DataTable
                        fetching={loading}
                        noRecordsText="No milestones found"
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
                            `Showing ${from} to ${to} of ${totalRecords} milestones`
                        }
                    />
                </div>
            </div>

            {/* Modals */}
            {modalOpen && (
                <MilestoneForm
                    milestone={editingMilestone}
                    project={project}
                    onSubmit={handleSubmit}
                    onCancel={() => setModalOpen(false)}
                    loading={saving}
                />
            )}
            {previewMilestone && (
                <MilestonePreview milestone={previewMilestone} onClose={handleClosePreview} />
            )}
            {budgetMilestone && (
                <MilestoneBudgetModal milestone={budgetMilestone} onClose={handleCloseBudget} />
            )}
        </div>
    );
};

export default MilestoneList;
