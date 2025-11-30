import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/apiClient';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import {
    CheckIcon, XMarkIcon, PencilIcon,
    ArrowTrendingUpIcon, ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const PendingTransactions = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [selected, setSelected] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        fetchPendingTransactions();
    }, []);

    const fetchPendingTransactions = async () => {
        try {
            const response = await api.get('/gmail/pending');
            setTransactions(response.data.data);
        } catch (error) {
            console.error('Error fetching pending transactions:', error);
            toast.error('Failed to load pending transactions');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = () => {
        if (selected.size === transactions.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(transactions.map(t => t._id)));
        }
    };

    const handleToggleSelect = (id) => {
        const newSelected = new Set(selected);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelected(newSelected);
    };

    const handleEdit = (transaction) => {
        setEditingId(transaction._id);
        setEditForm({
            vendor: transaction.vendor,
            category: transaction.category,
            amount: transaction.amount,
            date: format(new Date(transaction.date), 'yyyy-MM-dd'),
            description: transaction.description || ''
        });
    };

    const handleSaveEdit = async (id) => {
        try {
            await api.put(`/gmail/pending/${id}`, editForm);
            toast.success('Transaction updated');
            setEditingId(null);
            await fetchPendingTransactions();
        } catch (error) {
            console.error('Error updating transaction:', error);
            toast.error('Failed to update transaction');
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this transaction?')) return;

        try {
            await api.delete(`/gmail/pending/${id}`);
            toast.success('Transaction deleted');
            await fetchPendingTransactions();
            selected.delete(id);
            setSelected(new Set(selected));
        } catch (error) {
            console.error('Error deleting transaction:', error);
            toast.error('Failed to delete transaction');
        }
    };

    const handleConfirmSelected = async () => {
        if (selected.size === 0) {
            toast.error('No transactions selected');
            return;
        }

        try {
            await api.post('/gmail/confirm', {
                transactionIds: Array.from(selected)
            });

            toast.success(`Confirmed ${selected.size} transactions!`);
            setSelected(new Set());
            await fetchPendingTransactions();
        } catch (error) {
            console.error('Error confirming transactions:', error);
            toast.error('Failed to confirm transactions');
        }
    };

    const getConfidenceBadge = (confidence) => {
        const colors = {
            high: 'bg-green-100 text-green-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 py-1 text-xs rounded-full ${colors[confidence] || colors.low}`}>
                {confidence}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Pending Transactions ({transactions.length})</h1>
                {selected.size > 0 && (
                    <button
                        onClick={handleConfirmSelected}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Confirm {selected.size} Selected
                    </button>
                )}
            </div>

            {transactions.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                    <p className="text-gray-600 dark:text-gray-400">No pending transactions.</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Go to Gmail Integration to sync your emails.
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selected.size === transactions.length}
                                            onChange={handleSelectAll}
                                            className="rounded"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Vendor
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Amount
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Category
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Confidence
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {transactions.map((txn) => (
                                    <tr key={txn._id} className={selected.has(txn._id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selected.has(txn._id)}
                                                onChange={() => handleToggleSelect(txn._id)}
                                                className="rounded"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {editingId === txn._id ? (
                                                <input
                                                    type="date"
                                                    value={editForm.date}
                                                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                                    className="border rounded px-2 py-1 w-full"
                                                />
                                            ) : (
                                                format(new Date(txn.date), 'PP')
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {editingId === txn._id ? (
                                                <input
                                                    type="text"
                                                    value={editForm.vendor}
                                                    onChange={(e) => setEditForm({ ...editForm, vendor: e.target.value })}
                                                    className="border rounded px-2 py-1 w-full"
                                                />
                                            ) : (
                                                <div>{txn.vendor}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex items-center space-x-1">
                                                {txn.direction === 'debit' ? (
                                                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                                                ) : (
                                                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                                                )}
                                                {editingId === txn._id ? (
                                                    <input
                                                        type="number"
                                                        value={editForm.amount}
                                                        onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                                                        className="border rounded px-2 py-1 w-24"
                                                    />
                                                ) : (
                                                    <span className={txn.direction === 'debit' ? 'text-red-600' : 'text-green-600'}>
                                                        ₹{txn.amount.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {editingId === txn._id ? (
                                                <input
                                                    type="text"
                                                    value={editForm.category}
                                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                                    className="border rounded px-2 py-1 w-full"
                                                />
                                            ) : (
                                                txn.category
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {getConfidenceBadge(txn.confidence)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {editingId === txn._id ? (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleSaveEdit(txn._id)}
                                                        className="text-green-600 hover:text-green-800"
                                                    >
                                                        <CheckIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="text-gray-600 hover:text-gray-800"
                                                    >
                                                        <XMarkIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(txn)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(txn._id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <XMarkIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingTransactions;
