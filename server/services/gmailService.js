const { google } = require('googleapis');
const { encrypt, decrypt } = require('./encryptionService');
const GmailToken = require('../models/GmailToken');

// OAuth2 client configuration
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const REDIRECT_URI = process.env.GOOGLE_GMAIL_REDIRECT_URI || 'http://localhost:5001/auth/google/gmail/callback';

/**
 * Create OAuth2 client
 */
function createOAuth2Client() {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        REDIRECT_URI
    );
}

/**
 * Generate authorization URL for Gmail consent
 * @param {string} userId - User ID to include in state parameter
 * @returns {string} - Authorization URL
 */
function generateAuthUrl(userId) {
    const oauth2Client = createOAuth2Client();

    return oauth2Client.generateAuthUrl({
        access_type: 'offline', // Get refresh token
        scope: SCOPES,
        state: userId, // Pass user ID for callback
        prompt: 'consent' // Force consent screen to get refresh token
    });
}

/**
 * Exchange authorization code for tokens
 * @param {string} code - Authorization code from OAuth callback
 * @returns {Promise<Object>} - Tokens { access_token, refresh_token, expiry_date }
 */
async function exchangeCodeForTokens(code) {
    const oauth2Client = createOAuth2Client();

    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
}

/**
 * Save encrypted tokens for user
 * @param {string} userId - User ID
 * @param {Object} tokens - OAuth tokens
 */
async function saveTokensForUser(userId, tokens) {
    const { access_token, refresh_token, expiry_date } = tokens;

    // Encrypt tokens
    const encryptedAccessToken = encrypt(access_token);
    const encryptedRefreshToken = encrypt(refresh_token);

    // Upsert token document
    await GmailToken.findOneAndUpdate(
        { user: userId },
        {
            encryptedAccessToken,
            encryptedRefreshToken,
            tokenExpiry: new Date(expiry_date),
            isActive: true
        },
        { upsert: true, new: true }
    );
}

/**
 * Get decrypted tokens for user
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} - Decrypted tokens or null
 */
async function getTokensForUser(userId) {
    const tokenDoc = await GmailToken.findOne({ user: userId, isActive: true })
        .select('+encryptedAccessToken +encryptedRefreshToken');

    if (!tokenDoc) {
        return null;
    }

    try {
        return {
            access_token: decrypt(tokenDoc.encryptedAccessToken),
            refresh_token: decrypt(tokenDoc.encryptedRefreshToken),
            expiry_date: tokenDoc.tokenExpiry.getTime()
        };
    } catch (error) {
        console.error('Error decrypting tokens:', error);
        return null;
    }
}

/**
 * Refresh access token if expired
 * @param {string} userId - User ID
 * @returns {Promise<string>} - Valid access token
 */
async function refreshAccessToken(userId) {
    const tokens = await getTokensForUser(userId);

    if (!tokens) {
        throw new Error('No tokens found for user');
    }

    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials(tokens);

    // Check if token is expired
    const now = Date.now();
    if (tokens.expiry_date > now) {
        return tokens.access_token; // Token still valid
    }

    // Refresh token
    const { credentials } = await oauth2Client.refreshAccessToken();

    // Save new tokens
    await saveTokensForUser(userId, credentials);

    return credentials.access_token;
}

/**
 * Fetch Gmail messages for user
 * @param {string} userId - User ID
 * @param {Object}  options - Fetch options
 * @returns {Promise<Array>} - Array of message objects
 */
async function fetchMessages(userId, options = {}) {
    const {
        maxResults = 50,
        query = '',
        windowDays = parseInt(process.env.GMAIL_FETCH_WINDOW_DAYS) || 30
    } = options;

    // Get valid access token
    const accessToken = await refreshAccessToken(userId);

    // Create authenticated client
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Build query with date filter and sender patterns
    const senderPatterns = process.env.GMAIL_ALLOWED_SENDER_PATTERNS || '';
    const senderQuery = senderPatterns.split(',').map(p => `from:${p.trim()}`).join(' OR ');

    const dateFilter = `after:${Math.floor(Date.now() / 1000) - (windowDays * 24 * 60 * 60)}`;
    const finalQuery = `${dateFilter} (${senderQuery} OR subject:(payment OR credited OR debited OR transaction)) ${query}`;

    // List messages
    const listResponse = await gmail.users.messages.list({
        userId: 'me',
        q: finalQuery,
        maxResults
    });

    const messageIds = listResponse.data.messages || [];

    if (messageIds.length === 0) {
        return [];
    }

    // Fetch full message details
    const messages = await Promise.all(
        messageIds.map(async ({ id }) => {
            const message = await gmail.users.messages.get({
                userId: 'me',
                id,
                format: 'full'
            });
            return message.data;
        })
    );

    // Update last fetch timestamp
    await GmailToken.findOneAndUpdate(
        { user: userId },
        { lastFetchAt: new Date() }
    );

    return messages;
}

/**
 * Revoke Gmail access for user
 * @param {string} userId - User ID
 */
async function revokeAccess(userId) {
    const tokens = await getTokensForUser(userId);

    if (tokens) {
        // Revoke token with Google
        const oauth2Client = createOAuth2Client();
        oauth2Client.setCredentials(tokens);

        try {
            await oauth2Client.revokeCredentials();
        } catch (error) {
            console.error('Error revoking credentials with Google:', error);
            // Continue anyway to delete local tokens
        }
    }

    // Delete token document
    await GmailToken.findOneAndUpdate(
        { user: userId },
        { isActive: false }
    );
}

/**
 * Get Gmail connection status for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Status object
 */
async function getConnectionStatus(userId) {
    const tokenDoc = await GmailToken.findOne({ user: userId, isActive: true });

    if (!tokenDoc) {
        return {
            connected: false,
            lastFetchAt: null
        };
    }

    return {
        connected: true,
        lastFetchAt: tokenDoc.lastFetchAt,
        connectedAt: tokenDoc.createdAt
    };
}

module.exports = {
    generateAuthUrl,
    exchangeCodeForTokens,
    saveTokensForUser,
    getTokensForUser,
    refreshAccessToken,
    fetchMessages,
    revokeAccess,
    getConnectionStatus,
    SCOPES
};
