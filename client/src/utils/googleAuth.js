import { api } from './apiClient';
import { setToken } from './token';
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

        // Call backend
        const res = await api.post('/auth/google', { credential });

        // Extract token and user (support both flat and nested)
        // Based on typical sendTokenResponse, it might be flat or nested.
        // We will check sendTokenResponse, but robust extraction is good.
        const token = res?.data?.token || res?.data?.data?.token;
        const user = res?.data?.user || res?.data?.data?.user || res?.data?.data;

        console.log('Backend response:', { hasToken: !!token, hasUser: !!user });

        if (!token) {
            throw new Error('Authentication failed: no token returned');
        }

        // Store token and set header
        setToken(token);

        // Dispatch custom event for AuthContext
        window.dispatchEvent(new CustomEvent('app:auth-success', {
            detail: { user, token }
        }));

        console.log('Google auth successful, redirecting...');

        // Success feedback
        toast.success('Successfully logged in with Google!');

        // Redirect to dashboard
        // Use location.href for full page reload to ensure AuthContext picks up token
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 500);

        return { token, user };

    } catch (error) {
        console.error('Google auth error:', error);

        // Friendly error message
        const message = error.response?.data?.message || error.message;
        toast.error(`Google sign-in failed: ${message}`);

        throw error;
    }
}
