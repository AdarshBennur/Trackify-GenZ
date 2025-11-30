const cron = require('node-cron');
const GmailToken = require('../models/GmailToken');
const Notification = require('../models/Notification');
const gmailService = require('../services/gmailService');
const colors = require('colors');

// Configuration
const SCHEDULE = process.env.GMAIL_CRON_SCHEDULE || '0 2 * * *'; // Default: 2 AM daily
const CONCURRENCY = parseInt(process.env.GMAIL_FETCH_CONCURRENCY) || 5;

let isRunning = false;

/**
 * Process a single user's Gmail sync
 * @param {string} userId - User ID
 */
async function processUser(userId) {
    try {
        console.log(`[GmailJob] Processing user ${userId}...`.cyan);

        const stats = await gmailService.listNewMessagesAndParse(userId, {
            windowDays: 7 // Look back 7 days for daily sync
        });

        console.log(`[GmailJob] User ${userId}: Fetched ${stats.fetched}, Parsed ${stats.parsed}, Saved ${stats.saved}, Skipped ${stats.skipped}`.green);

        if (stats.errors.length > 0) {
            console.warn(`[GmailJob] User ${userId} had ${stats.errors.length} errors`.yellow);
        }

    } catch (error) {
        console.error(`[GmailJob] Error processing user ${userId}:`.red, error.message);

        // Handle token errors
        if (error.message.includes('invalid_grant') ||
            error.message.includes('invalid_token') ||
            error.response?.status === 400 ||
            error.response?.status === 401) {

            console.log(`[GmailJob] Token invalid for user ${userId}, creating notification`.red);

            // Create notification
            await Notification.create({
                user: userId,
                type: 'gmail_token_error',
                title: 'Gmail Connection Lost',
                message: 'We lost access to your Gmail account. Please reconnect to continue automatic transaction imports.',
                actionUrl: '/profile?gmail=reconnect' // Frontend route
            });

            // Mark token as inactive to prevent future failures
            await GmailToken.findOneAndUpdate(
                { user: userId },
                { isActive: false }
            );
        }
    }
}

/**
 * Main job function
 */
async function runJob() {
    if (isRunning) {
        console.log('[GmailJob] Previous job still running, skipping...'.yellow);
        return;
    }

    isRunning = true;
    const startTime = Date.now();
    console.log(`[GmailJob] Starting scheduled sync at ${new Date().toISOString()}`.blue.bold);

    try {
        // Find all active tokens
        const tokens = await GmailToken.find({ isActive: true });
        console.log(`[GmailJob] Found ${tokens.length} active Gmail connections`.blue);

        // Process in batches
        for (let i = 0; i < tokens.length; i += CONCURRENCY) {
            const batch = tokens.slice(i, i + CONCURRENCY);
            await Promise.all(batch.map(token => processUser(token.user)));
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[GmailJob] Completed in ${duration}s`.blue.bold);

    } catch (error) {
        console.error('[GmailJob] Fatal error:'.red.bold, error);
    } finally {
        isRunning = false;
    }
}

/**
 * Start the cron job
 */
function start() {
    if (process.env.ENABLE_GMAIL_CRON === 'false') {
        console.log('[GmailJob] Disabled via environment variable'.yellow);
        return;
    }

    // Validate schedule
    if (!cron.validate(SCHEDULE)) {
        console.error(`[GmailJob] Invalid cron schedule: ${SCHEDULE}`.red);
        return;
    }

    console.log(`[GmailJob] Scheduled to run at: ${SCHEDULE}`.green);

    // Schedule job
    cron.schedule(SCHEDULE, runJob);
}

module.exports = {
    start,
    runJob // Exported for manual triggering/testing
};
