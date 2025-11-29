import axios from 'axios';

// Create axios instance with extended timeout for cold starts
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    timeout: 12000, // 12 seconds to tolerate cold starts
});

// Request with automatic retry and exponential backoff
async function requestWithRetry(config, retries = 3, delay = 800) {
    try {
        return await api(config);
    } catch (err) {
        if (retries <= 0) throw err;

        // Wait before retry with exponential backoff
        await new Promise(r => setTimeout(r, delay));
        return requestWithRetry(config, retries - 1, delay * 2);
    }
}

export { api, requestWithRetry };
