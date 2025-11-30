import React from 'react';
import { FaGoogle, FaTimes, FaShieldAlt } from 'react-icons/fa';

const GmailConnectModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const handleConnect = () => {
        // Open in new tab to preserve session
        window.open('/api/auth/google/gmail', '_blank');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100">

                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-white p-3 rounded-full shadow-lg">
                            <FaGoogle className="text-red-500 text-2xl" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center">Connect Gmail</h2>
                    <p className="text-center text-red-100 text-sm mt-1">Automate your expense tracking</p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                        Grant read-only access to automatically import transaction emails.
                        We only <strong>READ</strong> messages — we can never send emails on your behalf.
                    </p>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start gap-3">
                        <FaShieldAlt className="text-blue-500 mt-1 shrink-0" />
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                            Your data is encrypted and secure. You can revoke access at any time from your Google Account settings.
                        </p>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={handleConnect}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition hover:-translate-y-0.5 hover:shadow-xl flex items-center justify-center gap-2"
                    >
                        <FaGoogle />
                        Connect Gmail (Read-Only)
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-medium transition-colors"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GmailConnectModal;
