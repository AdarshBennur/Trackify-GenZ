import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GmailConnectModal from '../components/GmailConnectModal';

describe('GmailConnectModal', () => {
    const mockOnClose = jest.fn();

    beforeEach(() => {
        mockOnClose.mockClear();
        localStorage.clear();
    });

    it('should not render when isOpen is false', () => {
        const { container } = render(
            <GmailConnectModal isOpen={false} onClose={mockOnClose} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('should render with correct title and copy', () => {
        render(<GmailConnectModal isOpen={true} onClose={mockOnClose} />);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/Connect Gmail \(read-only\)/i)).toBeInTheDocument();
        expect(screen.getByText(/Grant read-only access so we can automatically import transaction emails/i)).toBeInTheDocument();
        expect(screen.getByText(/You can revoke access anytime from your Google account/i)).toBeInTheDocument();
    });

    it('should have correct ARIA attributes', () => {
        render(<GmailConnectModal isOpen={true} onClose={mockOnClose} />);

        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('aria-labelledby', 'gmail-modal-title');
    });

    it('should have Connect Gmail link with correct href', () => {
        const originalEnv = process.env.REACT_APP_API_URL;
        process.env.REACT_APP_API_URL = 'http://testapi.com';

        render(<GmailConnectModal isOpen={true} onClose={mockOnClose} />);

        const link = screen.getByRole('link', { name: /Connect Gmail/i });
        expect(link).toHaveAttribute('href', 'http://testapi.com/api/auth/google/gmail');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');

        process.env.REACT_APP_API_URL = originalEnv;
    });

    it('should set localStorage and call onClose when "Maybe later" is clicked', () => {
        render(<GmailConnectModal isOpen={true} onClose={mockOnClose} />);

        const maybeLaterButton = screen.getByText('Maybe later');
        fireEvent.click(maybeLaterButton);

        expect(localStorage.getItem('gmail_connect_snooze_v2')).toBeTruthy();
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should close modal on ESC key press', () => {
        render(<GmailConnectModal isOpen={true} onClose={mockOnClose} />);

        fireEvent.keyDown(document, { key: 'Escape' });
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking close button', () => {
        render(<GmailConnectModal isOpen={true} onClose={mockOnClose} />);

        const closeButton = screen.getByLabelText('Close dialog');
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking overlay', () => {
        render(<GmailConnectModal isOpen={true} onClose={mockOnClose} />);

        const overlay = screen.getByRole('dialog').parentElement;
        fireEvent.click(overlay);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when clicking inside modal', () => {
        render(<GmailConnectModal isOpen={true} onClose={mockOnClose} />);

        const dialog = screen.getByRole('dialog');
        fireEvent.click(dialog);
        expect(mockOnClose).not.toHaveBeenCalled();
    });
});
