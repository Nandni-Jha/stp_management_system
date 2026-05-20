import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import ProjectForm from './ProjectForm';
import ProjectPreview from './ProjectPreview';
import MilestoneList from './MilestoneList';
import apiService from '../../services/api.service';
import { DataTable } from 'mantine-datatable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAdd,
    faEdit,
    faTrash,
    faEye,
    faProjectDiagram,
    faListUl,
    faDollarSign,
    faTasks,
    faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import Dropdown from '../../components/Dropdown';
import sortBy from 'lodash/sortBy';
import { confirmDelete, showSuccess, showError } from '../../components/alert.service';
import moment from 'moment';
import { Tooltip } from '@mantine/core';

const Projects = () => {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const [projects, setProjects] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [viewingProject, setViewingProject] = useState(null);
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

    // Check if we're viewing milestones for a specific project
    const isMilestoneView = !!projectId;

    const toggleColumnVisibility = (columnAccessor) => {
        setHiddenColumns((prev) =>
            prev.includes(columnAccessor)
                ? prev.filter((col) => col !== columnAccessor)
                : [...prev, columnAccessor]
        );
    };

    const allColumns = [
        { accessor: 'name', title: 'Project Name' },
        { accessor: 'client_name', title: 'Client' },
        { accessor: 'location', title: 'Location' },
        { accessor: 'start_date', title: 'Start Date' },
        { accessor: 'end_date', title: 'End Date' },
        { accessor: 'status', title: 'Status' },
        { accessor: 'actions', title: 'Actions' },
    ];

    useEffect(() => {
        fetchProjects();
        fetchLocations();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await apiService.get('/projects');
            setProjects(response.data);
        } catch (error) {
            showError(error.message || 'Failed to fetch projects', error.errors);
            console.error('Fetch projects error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await apiService.get('/locations');
            setLocations(response.data);
        } catch (error) {
            console.error('Fetch locations error:', error);
        }
    };

    const handleAdd = () => {
        setEditingProject(null);
        setModalOpen(true);
    };

    const handleEdit = (project) => {
        setEditingProject(project);
        setModalOpen(true);
    };

    const handleView = async (project) => {
        try {
            const response = await apiService.get(`/projects/${project.id}`);
            setViewingProject(response.data);
            setViewModalOpen(true);
        } catch (error) {
            showError('Failed to fetch project details', error.errors);
        }
    };

    const handleDelete = async (id) => {
        const result = await confirmDelete('Please click on confirm to delete this project.');
        if (result.isConfirmed) {
            try {
                await apiService.delete(`/projects/${id}`);
                setProjects(projects.filter((p) => p.id !== id));
                showSuccess('Project deleted successfully.');
            } catch (error) {
                console.error('Delete project error:', error);
            }
        }
    };

    const handleManageMilestones = (project) => {
        navigate(`/projects/${project.id}/milestones`);
    };

    const handleSubmit = async (formData) => {
        setSaving(true);
        try {
            if (editingProject) {
                const response = await apiService.put(`/projects/${editingProject.id}`, formData);
                setProjects(projects.map((p) => (p.id === editingProject.id ? response.data : p)));
            } else {
                const response = await apiService.post('/projects', formData);
                setProjects([response.data, ...projects]);
            }
            setModalOpen(false);
            showSuccess(
                editingProject ? 'Project updated successfully.' : 'Project created successfully.'
            );
        } catch (error) {
            showError(
                error.message ||
                    (editingProject ? 'Failed to update project' : 'Failed to create project'),
                error.errors
            );
            console.error('Submit project error:', error);
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

    const getFilteredProjects = () => {
        let filtered = projects;

        if (search) {
            const query = search.toLowerCase();
            filtered = filtered.filter((project) => {
                return (
                    project.name?.toLowerCase().includes(query) ||
                    project.client_name?.toLowerCase().includes(query) ||
                    project.location?.name?.toLowerCase().includes(query) ||
                    project.status?.toLowerCase().includes(query)
                );
            });
        }

        if (statusFilter) {
            filtered = filtered.filter((project) => project.status === statusFilter);
        }

        return filtered;
    };

    const sortedRecords = sortBy(getFilteredProjects(), sortStatus.columnAccessor);
    if (sortStatus.direction === 'desc') {
        sortedRecords.reverse();
    }

    const totalRecords = sortedRecords.length;
    const paginatedRecords = sortedRecords.slice((page - 1) * pageSize, page * pageSize);

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-600/20';
            case 'completed':
                return 'bg-blue-100 text-blue-800 ring-1 ring-blue-600/20';
            case 'on_hold':
                return 'bg-amber-100 text-amber-800 ring-1 ring-amber-600/20';
            default:
                return 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20';
        }
    };

    const calculateProjectProgress = (startDate, endDate, status) => {
        if (status === 'completed') return 100;
        if (status === 'active') {
            const start = moment(startDate);
            const end = moment(endDate);
            const now = moment();
            const totalDays = end.diff(start, 'days');
            const passedDays = now.diff(start, 'days');
            return Math.max(0, Math.min(100, (passedDays / totalDays) * 100));
        }
        return 0;
    };

    const columns = [
        {
            accessor: 'name',
            title: 'Project Name',
            sortable: true,
            render: ({ name, status, start_date, end_date }) => (
                <div className="flex items-center">
                    <FontAwesomeIcon
                        icon={faProjectDiagram}
                        className="w-5 h-5 mr-3 text-gray-400"
                    />
                    <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-gray-900 truncate">{name}</div>
                        <div className="flex items-center mt-1">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5 mr-2">
                                <div
                                    className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${calculateProjectProgress(
                                            start_date,
                                            end_date,
                                            status
                                        )}%`,
                                    }}
                                ></div>
                            </div>
                            <span className="text-xs text-gray-500">
                                {Math.round(calculateProjectProgress(start_date, end_date, status))}
                                %
                            </span>
                        </div>
                    </div>
                </div>
            ),
            hidden: hiddenColumns.includes('name'),
        },
        {
            accessor: 'client_name',
            title: 'Client',
            sortable: true,
            render: ({ client_name }) => (
                <span className="text-sm font-medium text-gray-900">{client_name || 'N/A'}</span>
            ),
            hidden: hiddenColumns.includes('client_name'),
        },
        {
            accessor: 'location',
            title: 'Location',
            sortable: true,
            render: ({ location }) => (
                <div className="text-sm text-gray-700">
                    <div className="font-medium">{location?.name || 'N/A'}</div>
                    {location?.type && (
                        <div className="text-xs text-gray-500 capitalize">{location.type}</div>
                    )}
                </div>
            ),
            hidden: hiddenColumns.includes('location'),
        },
        {
            accessor: 'start_date',
            title: 'Start Date',
            sortable: true,
            render: ({ start_date }) => (
                <span className="text-sm text-gray-700 font-medium">
                    {moment(start_date).format('MMM DD, YYYY')}
                </span>
            ),
            hidden: hiddenColumns.includes('start_date'),
        },
        {
            accessor: 'end_date',
            title: 'End Date',
            sortable: true,
            render: ({ end_date }) => (
                <span className="text-sm text-gray-700 font-medium">
                    {end_date ? moment(end_date).format('MMM DD, YYYY') : 'N/A'}
                </span>
            ),
            hidden: hiddenColumns.includes('end_date'),
        },
        {
            accessor: 'status',
            title: 'Status',
            sortable: true,
            render: ({ status }) => (
                <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${getStatusColor(
                        status
                    )}`}
                >
                    {status?.replace('_', ' ').toUpperCase()}
                </span>
            ),
            hidden: hiddenColumns.includes('status'),
        },
        {
            accessor: 'actions',
            title: 'Actions',
            sortable: false,
            textAlignment: 'center',
            render: (project) => (
                <div className="flex gap-2 justify-center">
                    <Tooltip label="View project details" position="top" withArrow>
                        <button
                            className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            onClick={() => handleView(project)}
                        >
                            <FontAwesomeIcon icon={faEye} className="text-xs" />
                        </button>
                    </Tooltip>
                    <Tooltip label="Manage milestones" position="top" withArrow>
                        <button
                            className="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                            onClick={() => handleManageMilestones(project)}
                        >
                            <FontAwesomeIcon icon={faTasks} className="text-xs" />
                        </button>
                    </Tooltip>
                    <Tooltip label="Edit project" position="top" withArrow>
                        <button
                            className="w-9 h-9 rounded-full bg-gray-700 hover:bg-gray-800 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            onClick={() => handleEdit(project)}
                        >
                            <FontAwesomeIcon icon={faEdit} className="text-xs" />
                        </button>
                    </Tooltip>
                    <Tooltip label="Delete project" position="top" withArrow>
                        <button
                            className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            onClick={() => handleDelete(project.id)}
                        >
                            <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        </button>
                    </Tooltip>
                </div>
            ),
            hidden: hiddenColumns.includes('actions'),
        },
    ];

    // If viewing milestones for a specific project, render the milestone list
    if (isMilestoneView) {
        const project = projects.find((p) => p.id === parseInt(projectId));
        if (!project) {
            return (
                <Layout>
                    <div className="p-4 sm:p-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Project Not Found
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    The project you're looking for doesn't exist or has been
                                    deleted.
                                </p>
                                <button
                                    onClick={() => navigate('/projects')}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
                                >
                                    Back to Projects
                                </button>
                            </div>
                        </div>
                    </div>
                </Layout>
            );
        }

        return (
            <Layout>
                <div className="p-4 sm:p-6">
                    {/* Back to Projects Button */}
                    <div className="mb-6">
                        <button
                            onClick={() => navigate('/projects')}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                            <span>Back to Projects</span>
                        </button>
                    </div>

                    {/* Project Header */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                                <p className="text-sm text-gray-600">
                                    Client: {project.client_name || 'N/A'}
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span
                                    className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full shadow-sm ${getStatusColor(project.status)}`}
                                >
                                    {project.status?.replace('_', ' ').toUpperCase()}
                                </span>
                                <button
                                    onClick={() => navigate(`/projects`)}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
                                >
                                    View Project Details
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Milestone List */}
                    <MilestoneList projectId={projectId} project={project} />
                </div>
            </Layout>
        );
    }

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
                                            placeholder="Search projects..."
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
                                    <option value="completed">Completed</option>
                                    <option value="on_hold">On Hold</option>
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
                                    <span className="hidden sm:inline">Add Project</span>
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
                <ProjectForm
                    project={editingProject}
                    locations={locations}
                    onSubmit={handleSubmit}
                    onCancel={() => setModalOpen(false)}
                    loading={saving}
                />
            )}

            {viewModalOpen && (
                <ProjectPreview project={viewingProject} onClose={() => setViewModalOpen(false)} />
            )}
        </Layout>
    );
};

export default Projects;
