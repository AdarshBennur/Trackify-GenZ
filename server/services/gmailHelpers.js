const crypto = require('crypto');
const transactionParser = require('./transactionParser');
const PendingTransaction = require('../models/PendingTransaction');
const Expense = require('../models/Expense');

/**
 * Extract body from Gmail message (wrapper around transactionParser)
 * @param {Object} message - Gmail message object
 * @returns {string} - Extracted text body
 */
function extractBodyFromMessage(message) {
    if (!message.payload) return '';
    return transactionParser.extractBody(message.payload);
}

/**
 * Parse transaction from text (wrapper around transactionParser)
 * @param {string} body - Email body
 * @param {Object} headers - Email headers
 * @param {string} messageId - Gmail message ID
 * @returns {Object|null} - Parsed transaction or null
 */
function parseTransactionFromText(body, headers, messageId) {
    // Create a mock message object that transactionParser expects
    const mockMessage = {
        id: messageId,
        snippet: body.substring(0, 200), // Use start of body as snippet
        payload: {
            headers: headers || [],
            body: { data: Buffer.from(body).toString('base64') } // Mock body for extraction if needed
        }
    };

    // Use the parser's logic which handles subject/from headers
    // We pass the already extracted body to avoid re-extraction if possible,
    // but transactionParser.parseEmailMessage expects the full message object
    // So we'll let it do its thing, but we can also use the direct extraction functions if needed.

    // Actually, transactionParser.parseEmailMessage is robust. Let's use it directly.
    return transactionParser.parseEmailMessage(mockMessage);
}

/**
 * Generate hash for deduplication
 * @param {string} vendor - Vendor name
 * @param {number} amount - Transaction amount
 * @param {Date} date - Transaction date
 * @returns {string} - Hash string
 */
function generateTransactionHash(vendor, amount, date) {
    // Round date to day to avoid minor time differences
    const day = new Date(date).toISOString().split('T')[0];
    const data = `${vendor.toLowerCase()}:${amount}:${day}`;
    return crypto.createHash('md5').update(data).digest('hex');
}

/**
 * Save transaction if new
 * @param {string} userId - User ID
 * @param {Object} parsed - Parsed transaction data
 * @param {string} gmailMessageId - Gmail message ID
 * @returns {Promise<Object>} - Saved document or null if duplicate
 */
async function saveIfNew(userId, parsed, gmailMessageId) {
    // Check if already processed (secondary check against DB)
    const existingPending = await PendingTransaction.findOne({
        user: userId,
        gmailMessageId
    });

    if (existingPending) return null;

    const existingExpense = await Expense.findOne({
        user: userId,
        gmailMessageId
    });

    if (existingExpense) return null;

    // Prepare data
    const transactionData = {
        user: userId,
        ...parsed,
        gmailMessageId,
        source: 'gmail_auto',
        isConfirmed: false
    };

    // Auto-confirm if enabled
    if (process.env.GMAIL_AUTO_CONFIRM_TRANSACTIONS === 'true') {
        // Create Expense directly
        if (parsed.direction === 'debit') {
            return await Expense.create({
                user: userId,
                description: parsed.description || `${parsed.vendor} transaction`,
                amount: parsed.amount,
                category: parsed.category || 'Uncategorized',
                date: parsed.date,
                paymentMethod: parsed.metadata?.paymentMethod || 'UPI',
                tags: ['gmail-auto'],
                notes: `Auto-imported from Gmail. Ref: ${parsed.referenceId || 'N/A'}`,
                gmailMessageId
            });
        }
        // Credits/Income handling could go here
        return null;
    } else {
        // Create PendingTransaction
        return await PendingTransaction.create(transactionData);
    }
}

module.exports = {
    extractBodyFromMessage,
    parseTransactionFromText,
    generateTransactionHash,
    saveIfNew
};
