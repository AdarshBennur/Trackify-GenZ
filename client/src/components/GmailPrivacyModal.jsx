import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ShieldCheckIcon, TrashIcon } from '@heroicons/react/24/outline';

const GmailPrivacyModal = ({ isOpen, onClose, onAccept }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <ShieldCheckIcon className="h-6 w-6 text-blue-500" />
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Connect Gmail - Privacy First
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        <p className="text-gray-700 dark:text-gray-300">
                            By connecting Gmail, CashHarbor will automatically extract transaction data from your payment emails.
                        </p>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                What we read:
                            </h3>
                            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
                                <li>Only transaction-related emails (bank, UPI, payment receipts)</li>
                                <li>Amount, merchant name, date, and reference number</li>
                                <li>Emails from known payment providers only</li>
                            </ul>
                        </div>

                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center">
                                <TrashIcon className="h-5 w-5 mr-2" />
                                What we DON'T keep:
                            </h3>
                            <ul className="list-disc list-inside space-y-1 text-sm text-red-800 dark:text-red-200">
                                <li>Raw email bodies (deleted immediately after parsing)</li>
                                <li>Personal emails, OTPs, or security codes</li>
                                <li>We never read or send your emails</li>
                            </ul>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                                Your control:
                            </h3>
                            <ul className="list-disc list-inside space-y-1 text-sm text-green-800 dark:text-green-200">
                                <li>Review all parsed transactions before confirming</li>
                                <li>Edit vendor names, categories, and amounts</li>
                                <li>Revoke access anytime from your profile</li>
                                <li>All pending data is deleted when you revoke</li>
                            </ul>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onAccept}
                            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium"
                        >
                            I Understand, Connect Gmail
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default GmailPrivacyModal;
