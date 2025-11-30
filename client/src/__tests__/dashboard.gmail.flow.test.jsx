import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../pages/Dashboard';
import { getGmailStatus } from '../services/api/gmail';
import { useAuth } from '../context/AuthContext';

// Mock dependencies
jest.mock('../services/api/gmail');
jest.mock('../context/AuthContext');
jest.mock('../utils/requestWithAuth', () => ({
    protectedRequest: jest.fn()
}));

describe('Dashboard Gmail Flow', () => {
    const mockAuthContext = {
        user: { id: '123', email: 'test@test.com' },
        isAuthenticated: true,
        isGuestUser: jest.fn().mockReturnValue(false)
    };

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        useAuth.mockReturnValue(mockAuthContext);
    });

    it('should fetch Gmail status on mount', async () => {
        getGmailStatus.mockResolvedValue({ connected: false, error: null });

        render(<Dashboard />);

        await waitFor(() => {
            expect(getGmailStatus).toHaveBeenCalledTimes(1);
        });
    });

    it('should show modal when not connected and no snooze', async () => {
        getGmailStatus.mockResolvedValue({ connected: false, error: null });

        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText(/Connect Gmail \(read-only\)/i)).toBeInTheDocument();
        });
    });

    it('should not show modal when connected', async () => {
        getGmailStatus.mockResolvedValue({ connected: true, error: null });

        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.queryByText(/Connect Gmail \(read-only\)/i)).not.toBeInTheDocument();
        });
    });

    it('should not show modal when snoozed within 24 hours', async () => {
        getGmailStatus.mockResolvedValue({ connected: false, error: null });
        localStorage.setItem('gmail_connect_snooze_v2', Date.now().toString());

        render(<Dashboard />);

        await waitFor(() => {
            expect(getGmailStatus).toHaveBeenCalled();
        });

        expect(screen.queryByText(/Connect Gmail \(read-only\)/i)).not.toBeInTheDocument();
    });

    it('should show modal when snooze expired (>24 hours)', async () => {
        getGmailStatus.mockResolvedValue({ connected: false, error: null });
        const yesterday = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
        localStorage.setItem('gmail_connect_snooze_v2', yesterday.toString());

        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText(/Connect Gmail \(read-only\)/i)).toBeInTheDocument();
        });
    });

    it('should show error notification when gmailStatus has error', async () => {
        getGmailStatus.mockResolvedValue({
            connected: false,
            error: 'Token expired'
        });

        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText(/Gmail connection lost/i)).toBeInTheDocument();
            expect(screen.getByText(/Reconnect/i)).toBeInTheDocument();
        });
    });

    it('should not show error notification when no error', async () => {
        getGmailStatus.mockResolvedValue({ connected: true, error: null });

        render(<Dashboard />);

        await waitFor(() => {
            expect(getGmailStatus).toHaveBeenCalled();
        });

        expect(screen.queryByText(/Gmail connection lost/i)).not.toBeInTheDocument();
    });

    it('should handle guest user gracefully', async () => {
        useAuth.mockReturnValue({
            ...mockAuthContext,
            isGuestUser: jest.fn().mockReturnValue(true)
        });

        render(<Dashboard />);

        await waitFor(() => {
            expect(getGmailStatus).not.toHaveBeenCalled();
        });
    });

    it('should handle not authenticated gracefully', async () => {
        useAuth.mockReturnValue({
            ...mockAuthContext,
            isAuthenticated: false
        });

        render(<Dashboard />);

        await waitFor(() => {
            expect(getGmailStatus).not.toHaveBeenCalled();
        });
    });

    it('should handle API error gracefully', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        getGmailStatus.mockRejectedValue(new Error('Network error'));

        render(<Dashboard />);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Gmail status check failed',
                expect.any(Error)
            );
        });

        consoleErrorSpy.mockRestore();
    });
});
