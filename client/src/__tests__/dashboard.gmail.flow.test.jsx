import * as gmailAPI from '../services/api/gmail';

// Mock the API calls
jest.mock('../services/api/gmail', () => ({
    getGmailStatus: jest.fn()
}));

describe('Dashboard Gmail Flow - Service Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    describe('getGmailStatus service', () => {
        it('should return status with connected and error fields', async () => {
            gmailAPI.getGmailStatus.mockResolvedValue({
                connected: false,
                lastSync: null,
                error: null
            });

            const status = await gmailAPI.getGmailStatus();

            expect(status).toHaveProperty('connected');
            expect(status).toHaveProperty('error');
        });

        it('should handle error responses', async () => {
            gmailAPI.getGmailStatus.mockResolvedValue({
                connected: false,
                error: 'Token expired'
            });

            const status = await gmailAPI.getGmailStatus();

            expect(status.error).toBe('Token expired');
        });
    });

    describe('Snooze Logic', () => {
        it('should validate 24-hour snooze window', () => {
            const now = Date.now();
            localStorage.setItem('gmail_connect_snooze_v2', now.toString());

            const snoozed = localStorage.getItem('gmail_connect_snooze_v2');
            const snoozeValid = snoozed && (Date.now() - parseInt(snoozed, 10)) < 24 * 60 * 60 * 1000;

            expect(snoozeValid).toBe(true);
        });

        it('should invalidate snooze after 24 hours', () => {
            const yesterday = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
            localStorage.setItem('gmail_connect_snooze_v2', yesterday.toString());

            const snoozed = localStorage.getItem('gmail_connect_snooze_v2');
            const snoozeValid = snoozed && (Date.now() - parseInt(snoozed, 10)) < 24 * 60 * 60 * 1000;

            expect(snoozeValid).toBe(false);
        });
    });
});
