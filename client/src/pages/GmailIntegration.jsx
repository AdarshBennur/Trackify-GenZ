import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/apiClient';
import { toast } from 'react-toastify';
import { EnvelopeIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import GmailPrivacyModal from '../components/GmailPrivacyModal';
import { format } from 'date-fns';

const GmailIntegration = () => {
    const { user } = useAuth();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const response = await api.get('/gmail/status');
            setStatus(response.data.data);
        } catch (error) {
            console.error('Error fetching Gmail status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = () => {
        setShowPrivacyModal(true);
    };

    const handleAcceptPrivacy = async () => {
        try {
            setShowPrivacyModal(false);

            // Get auth URL
            const response = await api.get('/auth/google/gmail');
            const { authUrl } = response.data;

            // Redirect to Google OAuth
            window.location.href = authUrl;
        } catch (error) {
            console.error('Error initiating Gmail consent:', error);
            toast.error('Failed to initiate Gmail connection');
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const response = await api.post('/gmail/fetch', {
                maxResults: 50,
                windowDays: 30
            });

            const { fetched, parsed, new: newCount } = response.data.data;
            toast.success(`Synced! Found ${newCount} new transactions from ${fetched} emails`);

            // Refresh status
            await fetchStatus();
        } catch (error) {
            console.error('Error syncing Gmail:', error);
            toast.error(error.response?.data?.message || 'Failed to sync transactions');
        } finally {
            setSyncing(false);
        }
    };

    const handleRevoke = async () => {
        if (!window.confirm('Are you sure you want to revoke Gmail access? This will delete all pending transaction data.')) {
            return;
        }

        try {
            await api.post('/gmail/revoke');
            toast.success('Gmail access revoked successfully');
            await fetchStatus();
        } catch (error) {
            console.error('Error revoking Gmail access:', error);
            toast.error('Failed to revoke access');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Gmail Integration</h1>

            {!status?.connected ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center space-x-4 mb-4">
                        <EnvelopeIcon className="h-12 w-12 text-blue-500" />
                        <div>
                            <h2 className="text-xl font-semibold">Connect Your Gmail</h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Automatically import transactions from your payment emails
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-start space-x-2">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                            <span className="text-sm">Automatically extract UPI, bank, and payment transactions</span>
                        </div>
                        <div className="flex items-start space-x-2">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                            <span className="text-sm">Review and confirm before adding to your expenses</span>
                        </div>
                        <div className="flex items-start space-x-2">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                            <span className="text-sm">Privacy-first: raw emails deleted after parsing</span>
                        </div>
                    </div>

                    <button
                        onClick={handleConnect}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                    >
                        Connect Gmail
                    </button>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <CheckCircleIcon className="h-8 w-8 text-green-500" />
                            <div>
                                <h2 className="text-xl font-semibold">Gmail Connected</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {status.lastFetchAt ? (
                                        <>Last synced: {format(new Date(status.lastFetchAt), 'PPp')}</>
                                    ) : (
                                        <>Connected: {format(new Date(status.connectedAt), 'PPp')}</>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center space-x-2"
                        >
                            <ArrowPathIcon className={`h-5 w-5 ${syncing ? 'animate-spin' : ''}`} />
                            <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
                        </button>

                        <button
                            onClick={() => window.location.href = '/gmail/pending'}
                            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                        >
                            View Pending Transactions
                        </button>

                        <button
                            onClick={handleRevoke}
                            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
                        >
                            <XCircleIcon className="h-5 w-5" />
                            <span>Revoke Access</span>
                        </button>
                    </div>
                </div>
            )}

            <GmailPrivacyModal
                isOpen={showPrivacyModal}
                onClose={() => setShowPrivacyModal(false)}
                onAccept={handleAcceptPrivacy}
            />
        </div>
    );
};

export default GmailIntegration;
