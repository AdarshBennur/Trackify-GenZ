import api from './apiClient';
import { setToken, clearToken } from './token';
import { toast } from 'react-toastify';

/**
 * Handle Google credential from OAuth flow
 * @param {string} credential - Google ID token
 * @returns {Promise<{token: string, user: object}>}
 */
export async function handleGoogleCredential(credential) {
    if (!credential) {
        throw new Error('Missing Google credential');
    }

    try {
        console.log('Sending Google credential to backend...');

        // 1) Exchange credential for app token
        const res = await api.post('/auth/google', { credential });

        // Extract token and user (support both flat and nested)
        const token = res?.data?.token || res?.data?.data?.token;
        const user = res?.data?.user || res?.data?.data?.user || res?.data?.data;

        console.log('Backend response:', { hasToken: !!token, hasUser: !!user });

        if (!token) {
            throw new Error('Authentication failed: no token returned');
        }

        // 2) Set token synchronously on shared api instance
        setToken(token);

        console.log('Token set. Verifying with /auth/me...');

        // 3) Verify immediately with /auth/me — retry once on transient failures
        try {
            const me = await api.get('/auth/me');
            const userData = me.data.data || me.data;

            console.log('Verification successful. Dispatching success event.');

            // Dispatch event for AuthContext to pick up
            window.dispatchEvent(new CustomEvent('app:auth-success', {
                detail: { user: userData, token }
            }));

            // Success feedback
            toast.success('Successfully logged in with Google!');

            // 4) Navigate to dashboard (use location.replace to avoid login in back history)
            setTimeout(() => {
                window.location.replace('/dashboard');
            }, 100);

            return { token, user: userData };

        } catch (err) {
            console.warn('First verification failed. Retrying...', err);

            // If verify fails due to network / timeout, retry once after short wait
            if (!err.response) {
                // network timeout or render cold start — retry once with small delay
                await new Promise(r => setTimeout(r, 1200));
                try {
                    const me2 = await api.get('/auth/me');
                    const userData2 = me2.data.data || me2.data;

                    window.dispatchEvent(new CustomEvent('app:auth-success', {
                        detail: { user: userData2, token }
                    }));

                    toast.success('Successfully logged in with Google!');
                    window.location.replace('/dashboard');
                    return { token, user: userData2 };
                } catch (err2) {
                    console.error('Retry verification failed:', err2);
                    // final failure => clear token and surface error
                    clearToken();
                    throw new Error('Token verification failed after retry');
                }
            }

            // If server returned 401 or 403 => clear token and throw
            clearToken();
            throw err;
        }

    } catch (error) {
        console.error('Google auth error:', error);

        // Friendly error message
        const message = error.response?.data?.message || error.message;
        toast.error(`Google sign-in failed: ${message}`);

        throw error;
    }
}
