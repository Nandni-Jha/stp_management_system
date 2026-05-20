import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faEdit,
    faTrash,
    faSave,
    faTimes,
    faSpinner,
    faCog,
    faBoxes,
    faUsers,
    faBuilding,
} from '@fortawesome/free-solid-svg-icons';
import Modal from '../../components/Modal';
import apiService from '../../services/api.service';
import { showSuccess, showError, confirmDelete } from '../../components/alert.service';

const fmt = (val) =>
    '$ ' + parseFloat(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Inline row editing helpers ───────────────────────────────────────────────
const EMPTY_EQUIPMENT = { vendor_id: '', type: '', days: '', rate: '', amount: '' };
const EMPTY_MATERIAL = { vendor_id: '', item: '', amount: '' };
const EMPTY_LABOR = { category_id: '', type: 'per_day', worker: '', unit: '', rate: '', amount: '' };
const EMPTY_SC = { name: '', milestone: '', from: '', to: '', amount: '' };

// ─── Equipment Tab ─────────────────────────────────────────────────────────────
const EquipmentTab = ({ milestoneId, vendors, equipmentTypes }) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editId, setEditId] = useState(null); // null=none, 'new'=add row
    const [form, setForm] = useState(EMPTY_EQUIPMENT);

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiService.get('/milestone-equipment-budgets', {
                params: { milestone_id: milestoneId },
            });
            setRows(res.data);
        } catch (e) {
            showError('Failed to load equipment budgets');
        } finally {
            setLoading(false);
        }
    }, [milestoneId]);

    useEffect(() => { fetch(); }, [fetch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => {
            const updated = { ...prev, [name]: value };
            if (name === 'days' || name === 'rate') {
                const days = parseFloat(name === 'days' ? value : updated.days) || 0;
                const rate = parseFloat(name === 'rate' ? value : updated.rate) || 0;
                updated.amount = (days * rate).toFixed(2);
            }
            return updated;
        });
    };

    const startAdd = () => {
        setEditId('new');
        setForm(EMPTY_EQUIPMENT);
    };

    const startEdit = (row) => {
        setEditId(row.id);
        setForm({
            vendor_id: row.vendor_id || '',
            type: row.type || '',
            days: row.days || '',
            rate: row.rate || '',
            amount: row.amount || '',
        });
    };

    const cancel = () => { setEditId(null); setForm(EMPTY_EQUIPMENT); };

    const save = async () => {
        if (!form.type || !form.days || !form.rate) {
            showError('Type, Days and Rate are required');
            return;
        }
        setSaving(true);
        try {
            const payload = { ...form, milestone_id: milestoneId };
            if (editId === 'new') {
                const res = await apiService.post('/milestone-equipment-budgets', payload);
                setRows((prev) => [...prev, res.data]);
                showSuccess('Equipment budget added');
            } else {
                const res = await apiService.put(`/milestone-equipment-budgets/${editId}`, payload);
                setRows((prev) => prev.map((r) => (r.id === editId ? res.data : r)));
                showSuccess('Equipment budget updated');
            }
            cancel();
        } catch (e) {
            showError(e.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id) => {
        const result = await confirmDelete('Delete this equipment budget entry?');
        if (!result.isConfirmed) return;
        try {
            await apiService.delete(`/milestone-equipment-budgets/${id}`);
            setRows((prev) => prev.filter((r) => r.id !== id));
            showSuccess('Deleted successfully');
        } catch (e) {
            showError('Failed to delete');
        }
    };

    const total = rows.reduce((s, r) => s + parseFloat(r.amount || 0), 0);

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-gray-500">{rows.length} record(s)</p>
                {editId !== 'new' && (
                    <button
                        onClick={startAdd}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Add Equipment
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <FontAwesomeIcon icon={faSpinner} spin className="text-primary-500 text-2xl" />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Type</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Vendor</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Days</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Rate</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Amount</th>
                                <th className="px-3 py-2 text-center font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {rows.map((row) =>
                                editId === row.id ? (
                                    <tr key={row.id} className="bg-blue-50">
                                        <td className="px-3 py-2">
                                            <select
                                                name="type"
                                                value={form.type}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-400"
                                            >
                                                <option value="">-- Select Type --</option>
                                                {equipmentTypes.map((t) => (
                                                    <option key={t.id} value={t.name}>{t.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-3 py-2">
                                            <select
                                                name="vendor_id"
                                                value={form.vendor_id}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-400"
                                            >
                                                <option value="">-- No Vendor --</option>
                                                {vendors.map((v) => (
                                                    <option key={v.id} value={v.id}>{v.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-3 py-2">
                                            <input type="number" name="days" value={form.days} onChange={handleChange} min="0" className="w-24 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-400" />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input type="number" name="rate" value={form.rate} onChange={handleChange} min="0" step="0.01" className="w-28 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-400" />
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="w-28 border border-gray-200 rounded px-2 py-1 text-sm bg-gray-100 text-gray-700">{fmt(form.amount)}</div>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <InlineActions onSave={save} onCancel={cancel} saving={saving} />
                                        </td>
                                    </tr>
                                ) : (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-2">{row.type}</td>
                                        <td className="px-3 py-2">{row.vendor?.name || <span className="text-gray-400">—</span>}</td>
                                        <td className="px-3 py-2">{row.days}</td>
                                        <td className="px-3 py-2">{fmt(row.rate)}</td>
                                        <td className="px-3 py-2 font-medium">{fmt(row.amount)}</td>
                                        <td className="px-3 py-2 text-center">
                                            <RowActions onEdit={() => startEdit(row)} onDelete={() => remove(row.id)} disabled={editId !== null} />
                                        </td>
                                    </tr>
                                )
                            )}

                            {editId === 'new' && (
                                <tr className="bg-green-50">
                                    <td className="px-3 py-2">
                                        <select
                                            name="type"
                                            value={form.type}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-400"
                                        >
                                            <option value="">-- Select Type --</option>
                                            {equipmentTypes.map((t) => (
                                                <option key={t.id} value={t.name}>{t.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-3 py-2">
                                        <select
                                            name="vendor_id"
                                            value={form.vendor_id}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-400"
                                        >
                                            <option value="">-- No Vendor --</option>
                                            {vendors.map((v) => (
                                                <option key={v.id} value={v.id}>{v.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-3 py-2">
                                        <input type="number" name="days" value={form.days} onChange={handleChange} min="0" placeholder="0" className="w-24 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-400" />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input type="number" name="rate" value={form.rate} onChange={handleChange} min="0" step="0.01" placeholder="0.00" className="w-28 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-400" />
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="w-28 border border-gray-200 rounded px-2 py-1 text-sm bg-gray-100 text-gray-700">{fmt(form.amount)}</div>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <InlineActions onSave={save} onCancel={cancel} saving={saving} />
                                    </td>
                                </tr>
                            )}

                            {rows.length === 0 && editId !== 'new' && (
                                <tr>
                                    <td colSpan={6} className="px-3 py-6 text-center text-gray-400">No equipment budgets yet</td>
                                </tr>
                            )}
                        </tbody>
                        {rows.length > 0 && (
                            <tfoot>
                                <tr className="bg-gray-50 font-semibold">
                                    <td colSpan={4} className="px-3 py-2 text-right text-gray-700">Total</td>
                                    <td className="px-3 py-2 text-gray-900">{fmt(total)}</td>
                                    <td />
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            )}
        </div>
    );
};

// ─── Material Tab ──────────────────────────────────────────────────────────────
const MaterialTab = ({ milestoneId, vendors }) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(EMPTY_MATERIAL);

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiService.get('/milestone-material-budgets', {
                params: { milestone_id: milestoneId },
            });
            setRows(res.data);
        } catch (e) {
            showError('Failed to load material budgets');
        } finally {
            setLoading(false);
        }
    }, [milestoneId]);

    useEffect(() => { fetch(); }, [fetch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const startAdd = () => { setEditId('new'); setForm(EMPTY_MATERIAL); };
    const startEdit = (row) => {
        setEditId(row.id);
        setForm({ vendor_id: row.vendor_id || '', item: row.item || '', amount: row.amount || '' });
    };
    const cancel = () => { setEditId(null); setForm(EMPTY_MATERIAL); };

    const save = async () => {
        if (!form.item) { showError('Item is required'); return; }
        setSaving(true);
        try {
            const payload = { ...form, milestone_id: milestoneId };
            if (editId === 'new') {
                const res = await apiService.post('/milestone-material-budgets', payload);
                setRows((prev) => [...prev, res.data]);
                showSuccess('Material budget added');
            } else {
                const res = await apiService.put(`/milestone-material-budgets/${editId}`, payload);
                setRows((prev) => prev.map((r) => (r.id === editId ? res.data : r)));
                showSuccess('Material budget updated');
            }
            cancel();
        } catch (e) {
            showError(e.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id) => {
        const result = await confirmDelete('Delete this material budget entry?');
        if (!result.isConfirmed) return;
        try {
            await apiService.delete(`/milestone-material-budgets/${id}`);
            setRows((prev) => prev.filter((r) => r.id !== id));
            showSuccess('Deleted successfully');
        } catch (e) {
            showError('Failed to delete');
        }
    };

    const total = rows.reduce((s, r) => s + parseFloat(r.amount || 0), 0);

    const editRow = (row) => (
        <tr key={row?.id || 'new'} className={row ? 'bg-blue-50' : 'bg-green-50'}>
            <td className="px-3 py-2">
                <select name="vendor_id" value={form.vendor_id} onChange={handleChange} className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-400">
                    <option value="">-- No Vendor --</option>
                    {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
            </td>
            <td className="px-3 py-2">
                <input type="text" name="item" value={form.item} onChange={handleChange} placeholder="Item description" className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-400" />
            </td>
            <td className="px-3 py-2">
                <input type="number" name="amount" value={form.amount} onChange={handleChange} min="0" step="0.01" placeholder="0.00" className="w-28 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-400" />
            </td>
            <td className="px-3 py-2 text-center">
                <InlineActions onSave={save} onCancel={cancel} saving={saving} />
            </td>
        </tr>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-gray-500">{rows.length} record(s)</p>
                {editId !== 'new' && (
                    <button onClick={startAdd} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">
                        <FontAwesomeIcon icon={faPlus} />
                        Add Material
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-8"><FontAwesomeIcon icon={faSpinner} spin className="text-primary-500 text-2xl" /></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Vendor</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Item</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Amount</th>
                                <th className="px-3 py-2 text-center font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {rows.map((row) =>
                                editId === row.id ? editRow(row) : (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-2">{row.vendor?.name || <span className="text-gray-400">—</span>}</td>
                                        <td className="px-3 py-2">{row.item}</td>
                                        <td className="px-3 py-2 font-medium">{fmt(row.amount)}</td>
                                        <td className="px-3 py-2 text-center">
                                            <RowActions onEdit={() => startEdit(row)} onDelete={() => remove(row.id)} disabled={editId !== null} />
                                        </td>
                                    </tr>
                                )
                            )}
                            {editId === 'new' && editRow(null)}
                            {rows.length === 0 && editId !== 'new' && (
                                <tr><td colSpan={4} className="px-3 py-6 text-center text-gray-400">No material budgets yet</td></tr>
                            )}
                        </tbody>
                        {rows.length > 0 && (
                            <tfoot>
                                <tr className="bg-gray-50 font-semibold">
                                    <td colSpan={2} className="px-3 py-2 text-right text-gray-700">Total</td>
                                    <td className="px-3 py-2 text-gray-900">{fmt(total)}</td>
                                    <td />
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            )}
        </div>
    );
};

// ─── Labor Tab ─────────────────────────────────────────────────────────────────
const LaborTab = ({ milestoneId, laborCategories }) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(EMPTY_LABOR);

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiService.get('/milestone-labor-budgets', {
                params: { milestone_id: milestoneId },
            });
            setRows(res.data);
        } catch (e) {
            showError('Failed to load labor budgets');
        } finally {
            setLoading(false);
        }
    }, [milestoneId]);

    useEffect(() => { fetch(); }, [fetch]);

    const resolveRate = (categoryId, type, categories) => {
        const cat = categories.find((c) => c.id === parseInt(categoryId));
        if (!cat) return '';
        return parseFloat(type === 'per_hour' ? cat.hour_rate : cat.day_rate || 0).toFixed(2);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => {
            const updated = { ...prev, [name]: value };

            if (name === 'category_id' || name === 'type') {
                updated.rate = resolveRate(
                    name === 'category_id' ? value : updated.category_id,
                    name === 'type' ? value : updated.type,
                    laborCategories
                );
            }

            if (name === 'unit' || name === 'category_id' || name === 'type') {
                const unit = parseFloat(name === 'unit' ? value : updated.unit) || 0;
                const rate = parseFloat(updated.rate) || 0;
                updated.amount = (unit * rate).toFixed(2);
            }

            return updated;
        });
    };

    const startAdd = () => { setEditId('new'); setForm(EMPTY_LABOR); };
    const startEdit = (row) => {
        setEditId(row.id);
        setForm({
            category_id: row.category_id || '',
            type: row.type || 'per_day',
            worker: row.worker || '',
            unit: row.unit || '',
            rate: row.rate || '',
            amount: row.amount || '',
        });
    };
    const cancel = () => { setEditId(null); setForm(EMPTY_LABOR); };

    const save = async () => {
        if (!form.category_id || !form.worker || !form.unit) {
            showError('Category, Workers and Unit are required');
            return;
        }
        setSaving(true);
        try {
            const payload = { ...form, milestone_id: milestoneId };
            if (editId === 'new') {
                const res = await apiService.post('/milestone-labor-budgets', payload);
                setRows((prev) => [...prev, res.data]);
                showSuccess('Labor budget added');
            } else {
                const res = await apiService.put(`/milestone-labor-budgets/${editId}`, payload);
                setRows((prev) => prev.map((r) => (r.id === editId ? res.data : r)));
                showSuccess('Labor budget updated');
            }
            cancel();
        } catch (e) {
            showError(e.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id) => {
        const result = await confirmDelete('Delete this labor budget entry?');
        if (!result.isConfirmed) return;
        try {
            await apiService.delete(`/milestone-labor-budgets/${id}`);
            setRows((prev) => prev.filter((r) => r.id !== id));
            showSuccess('Deleted successfully');
        } catch (e) {
            showError('Failed to delete');
        }
    };

    const total = rows.reduce((s, r) => s + parseFloat(r.amount || 0), 0);

    const unitLabel = form.type === 'per_hour' ? 'Hours' : 'Days';

    const editRowJSX = (rowId) => (
        <tr key={rowId || 'new'} className={rowId ? 'bg-blue-50' : 'bg-green-50'}>
            <td className="px-3 py-2">
                <select name="category_id" value={form.category_id} onChange={handleChange} className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-400">
                    <option value="">-- Select Category --</option>
                    {laborCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </td>
            <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => handleChange({ target: { name: 'type', value: 'per_day' } })}
                        className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${form.type === 'per_day' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                    >
                        /Day
                    </button>
                    <button
                        type="button"
                        onClick={() => handleChange({ target: { name: 'type', value: 'per_hour' } })}
                        className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${form.type === 'per_hour' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                    >
                        /Hr
                    </button>
                </div>
            </td>
            <td className="px-3 py-2">
                <input type="number" name="worker" value={form.worker} onChange={handleChange} min="1" placeholder="0" className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-400" />
            </td>
            <td className="px-3 py-2">
                <div className="flex items-center gap-1">
                    <input type="number" name="unit" value={form.unit} onChange={handleChange} min="0" placeholder="0" className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-400" />
                    <span className="text-xs text-gray-500">{unitLabel}</span>
                </div>
            </td>
            <td className="px-3 py-2">
                <div className="w-28 border border-gray-200 rounded px-2 py-1 text-sm bg-gray-100 text-gray-700">{fmt(form.rate)}</div>
            </td>
            <td className="px-3 py-2">
                <div className="w-28 border border-gray-200 rounded px-2 py-1 text-sm bg-gray-100 text-gray-700">{fmt(form.amount)}</div>
            </td>
            <td className="px-3 py-2 text-center">
                <InlineActions onSave={save} onCancel={cancel} saving={saving} />
            </td>
        </tr>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-gray-500">{rows.length} record(s)</p>
                {editId !== 'new' && (
                    <button onClick={startAdd} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">
                        <FontAwesomeIcon icon={faPlus} />
                        Add Labor
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-8"><FontAwesomeIcon icon={faSpinner} spin className="text-primary-500 text-2xl" /></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Category</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Type</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Workers</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Unit</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Rate</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Amount</th>
                                <th className="px-3 py-2 text-center font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {rows.map((row) =>
                                editId === row.id ? editRowJSX(row.id) : (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-2">{row.category?.name || <span className="text-gray-400">—</span>}</td>
                                        <td className="px-3 py-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.type === 'per_hour' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {row.type === 'per_hour' ? 'Per Hour' : 'Per Day'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">{row.worker}</td>
                                        <td className="px-3 py-2">{row.unit} {row.type === 'per_hour' ? 'hrs' : 'days'}</td>
                                        <td className="px-3 py-2">{fmt(row.rate)}</td>
                                        <td className="px-3 py-2 font-medium">{fmt(row.amount)}</td>
                                        <td className="px-3 py-2 text-center">
                                            <RowActions onEdit={() => startEdit(row)} onDelete={() => remove(row.id)} disabled={editId !== null} />
                                        </td>
                                    </tr>
                                )
                            )}
                            {editId === 'new' && editRowJSX(null)}
                            {rows.length === 0 && editId !== 'new' && (
                                <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-400">No labor budgets yet</td></tr>
                            )}
                        </tbody>
                        {rows.length > 0 && (
                            <tfoot>
                                <tr className="bg-gray-50 font-semibold">
                                    <td colSpan={5} className="px-3 py-2 text-right text-gray-700">Total</td>
                                    <td className="px-3 py-2 text-gray-900">{fmt(total)}</td>
                                    <td />
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            )}
        </div>
    );
};

// ─── Sub Contractor Tab ────────────────────────────────────────────────────────
const SubContractorTab = ({ milestoneId }) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(EMPTY_SC);

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiService.get('/milestone-sc-budgets', {
                params: { milestone_id: milestoneId },
            });
            setRows(res.data);
        } catch (e) {
            showError('Failed to load sub contractor budgets');
        } finally {
            setLoading(false);
        }
    }, [milestoneId]);

    useEffect(() => { fetch(); }, [fetch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const startAdd = () => { setEditId('new'); setForm(EMPTY_SC); };
    const startEdit = (row) => {
        setEditId(row.id);
        setForm({
            name: row.name || '',
            milestone: row.milestone || '',
            from: row.from ? row.from.substring(0, 10) : '',
            to: row.to ? row.to.substring(0, 10) : '',
            amount: row.amount || '',
        });
    };
    const cancel = () => { setEditId(null); setForm(EMPTY_SC); };

    const save = async () => {
        if (!form.name) { showError('Name is required'); return; }
        setSaving(true);
        try {
            const payload = { ...form, milestone_id: milestoneId };
            if (editId === 'new') {
                const res = await apiService.post('/milestone-sc-budgets', payload);
                setRows((prev) => [...prev, res.data]);
                showSuccess('Sub contractor budget added');
            } else {
                const res = await apiService.put(`/milestone-sc-budgets/${editId}`, payload);
                setRows((prev) => prev.map((r) => (r.id === editId ? res.data : r)));
                showSuccess('Sub contractor budget updated');
            }
            cancel();
        } catch (e) {
            showError(e.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id) => {
        const result = await confirmDelete('Delete this sub contractor budget entry?');
        if (!result.isConfirmed) return;
        try {
            await apiService.delete(`/milestone-sc-budgets/${id}`);
            setRows((prev) => prev.filter((r) => r.id !== id));
            showSuccess('Deleted successfully');
        } catch (e) {
            showError('Failed to delete');
        }
    };

    const total = rows.reduce((s, r) => s + parseFloat(r.amount || 0), 0);

    const editRowJSX = (rowId) => (
        <tr key={rowId || 'new'} className={rowId ? 'bg-blue-50' : 'bg-green-50'}>
            <td className="px-3 py-2">
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Contractor name" className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-400" />
            </td>
            <td className="px-3 py-2">
                <input type="text" name="milestone" value={form.milestone} onChange={handleChange} placeholder="Scope / milestone" className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-400" />
            </td>
            <td className="px-3 py-2">
                <input type="date" name="from" value={form.from} onChange={handleChange} className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-400" />
            </td>
            <td className="px-3 py-2">
                <input type="date" name="to" value={form.to} min={form.from || undefined} onChange={handleChange} className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-400" />
            </td>
            <td className="px-3 py-2">
                <input type="number" name="amount" value={form.amount} onChange={handleChange} min="0" step="0.01" placeholder="0.00" className="w-28 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-400" />
            </td>
            <td className="px-3 py-2 text-center">
                <InlineActions onSave={save} onCancel={cancel} saving={saving} />
            </td>
        </tr>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-gray-500">{rows.length} record(s)</p>
                {editId !== 'new' && (
                    <button onClick={startAdd} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">
                        <FontAwesomeIcon icon={faPlus} />
                        Add Sub Contractor
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-8"><FontAwesomeIcon icon={faSpinner} spin className="text-primary-500 text-2xl" /></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Name</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Milestone / Scope</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">From</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">To</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Amount</th>
                                <th className="px-3 py-2 text-center font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {rows.map((row) =>
                                editId === row.id ? editRowJSX(row.id) : (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 font-medium">{row.name}</td>
                                        <td className="px-3 py-2">{row.milestone || <span className="text-gray-400">—</span>}</td>
                                        <td className="px-3 py-2">{row.from ? row.from.substring(0, 10) : <span className="text-gray-400">—</span>}</td>
                                        <td className="px-3 py-2">{row.to ? row.to.substring(0, 10) : <span className="text-gray-400">—</span>}</td>
                                        <td className="px-3 py-2 font-medium">{fmt(row.amount)}</td>
                                        <td className="px-3 py-2 text-center">
                                            <RowActions onEdit={() => startEdit(row)} onDelete={() => remove(row.id)} disabled={editId !== null} />
                                        </td>
                                    </tr>
                                )
                            )}
                            {editId === 'new' && editRowJSX(null)}
                            {rows.length === 0 && editId !== 'new' && (
                                <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-400">No sub contractor budgets yet</td></tr>
                            )}
                        </tbody>
                        {rows.length > 0 && (
                            <tfoot>
                                <tr className="bg-gray-50 font-semibold">
                                    <td colSpan={4} className="px-3 py-2 text-right text-gray-700">Total</td>
                                    <td className="px-3 py-2 text-gray-900">{fmt(total)}</td>
                                    <td />
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            )}
        </div>
    );
};

// ─── Shared micro-components ───────────────────────────────────────────────────
const InlineActions = ({ onSave, onCancel, saving }) => (
    <div className="flex gap-1 justify-center">
        <button
            onClick={onSave}
            disabled={saving}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50"
            title="Save"
        >
            {saving ? <FontAwesomeIcon icon={faSpinner} spin className="text-xs" /> : <FontAwesomeIcon icon={faSave} className="text-xs" />}
        </button>
        <button
            onClick={onCancel}
            disabled={saving}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-400 hover:bg-gray-500 text-white transition-colors disabled:opacity-50"
            title="Cancel"
        >
            <FontAwesomeIcon icon={faTimes} className="text-xs" />
        </button>
    </div>
);

const RowActions = ({ onEdit, onDelete, disabled }) => (
    <div className="flex gap-1 justify-center">
        <button
            onClick={onEdit}
            disabled={disabled}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-800 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Edit"
        >
            <FontAwesomeIcon icon={faEdit} className="text-xs" />
        </button>
        <button
            onClick={onDelete}
            disabled={disabled}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Delete"
        >
            <FontAwesomeIcon icon={faTrash} className="text-xs" />
        </button>
    </div>
);

// ─── Main Modal ────────────────────────────────────────────────────────────────
const TABS = [
    { key: 'equipment',      label: 'Equipment',      icon: faCog },
    { key: 'material',       label: 'Material',       icon: faBoxes },
    { key: 'labor',          label: 'Labor',          icon: faUsers },
    { key: 'subcontractor',  label: 'Sub Contractor', icon: faBuilding },
];

const MilestoneBudgetModal = ({ milestone, onClose }) => {
    const [activeTab, setActiveTab] = useState('equipment');
    const [vendors, setVendors] = useState([]);
    const [equipmentTypes, setEquipmentTypes] = useState([]);
    const [laborCategories, setLaborCategories] = useState([]);
    const [dropdownsLoading, setDropdownsLoading] = useState(true);

    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                const [vendorsRes, categoriesRes, laborCatRes] = await Promise.all([
                    apiService.get('/vendors'),
                    apiService.get('/asset-categories'),
                    apiService.get('/labor-categories'),
                ]);
                setVendors(vendorsRes.data);
                setEquipmentTypes(categoriesRes.data.filter((c) => c.asset_type_id === 2));
                setLaborCategories(laborCatRes.data);
            } catch (e) {
                showError('Failed to load dropdown data');
            } finally {
                setDropdownsLoading(false);
            }
        };
        loadDropdowns();
    }, []);

    return (
        <Modal isOpen={true} onClose={onClose} title={`Manage Budget — ${milestone.name}`} size="xl">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-4">
                <nav className="flex gap-1" aria-label="Budget tabs">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors focus:outline-none ${
                                activeTab === tab.key
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <FontAwesomeIcon icon={tab.icon} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {dropdownsLoading ? (
                <div className="flex justify-center py-12">
                    <FontAwesomeIcon icon={faSpinner} spin className="text-primary-500 text-2xl" />
                </div>
            ) : (
                <div>
                    {activeTab === 'equipment' && (
                        <EquipmentTab
                            milestoneId={milestone.id}
                            vendors={vendors}
                            equipmentTypes={equipmentTypes}
                        />
                    )}
                    {activeTab === 'material' && (
                        <MaterialTab
                            milestoneId={milestone.id}
                            vendors={vendors}
                        />
                    )}
                    {activeTab === 'labor' && (
                        <LaborTab
                            milestoneId={milestone.id}
                            laborCategories={laborCategories}
                        />
                    )}
                    {activeTab === 'subcontractor' && (
                        <SubContractorTab
                            milestoneId={milestone.id}
                        />
                    )}
                </div>
            )}
        </Modal>
    );
};

export default MilestoneBudgetModal;
