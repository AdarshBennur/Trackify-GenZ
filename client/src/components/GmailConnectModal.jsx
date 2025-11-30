import React, { useEffect } from 'react';
import { FaGoogle, FaTimes, FaShieldAlt } from 'react-icons/fa';

const GmailConnectModal = ({ isOpen, onClose }) => {
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const connectUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/auth/google/gmail`;

    const handleMaybeLater = () => {
        localStorage.setItem('gmail_connect_snooze_v2', Date.now().toString());
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="gmail-modal-title"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                        aria-label="Close dialog"
                    >
                        <FaTimes size={20} />
                    </button>
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-white p-3 rounded-full shadow-lg">
                            <FaGoogle className="text-red-500 text-2xl" />
                        </div>
                    </div>
                    <h2 id="gmail-modal-title" className="text-2xl font-bold text-center">Connect Gmail (read-only)</h2>
                    <p className="text-center text-red-100 text-sm mt-1">Automate your expense tracking</p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                        Grant read-only access so we can automatically import transaction emails. We only read messages — we won't send, delete, or change your emails. You can revoke access anytime from your Google account.
                    </p>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start gap-3">
                        <FaShieldAlt className="text-blue-500 mt-1 shrink-0" />
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                            Your data is encrypted and secure. You can revoke access at any time from your Google Account settings.
                        </p>
                    </div>

                    {/* CTA */}
                    <a
                        href={connectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                    >
                        <button
                            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition hover:-translate-y-0.5 hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            <FaGoogle />
                            Connect Gmail
                        </button>
                    </a>

                    <button
                        onClick={handleMaybeLater}
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
