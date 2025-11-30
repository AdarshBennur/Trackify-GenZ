import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

/**
 * Get Gmail connection status
 * @returns {Promise<{connected: boolean, lastSync?: string, error?: string}>}
 */
export async function getGmailStatus() {
    try {
        const res = await axios.get(`${API_URL}/api/gmail/status`, {
            withCredentials: true
        });
        return res.data.data || res.data;
    } catch (error) {
        if (error.response?.status === 401) {
            // User not authenticated
            throw new Error('NOT_AUTHENTICATED');
        }
        throw error;
    }
}
