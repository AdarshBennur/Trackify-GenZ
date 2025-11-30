const asyncHandler = require('express-async-handler');
const gmailService = require('../services/gmailService');
const transactionParser = require('../services/transactionParser');
const merchantMatcher = require('../services/merchantMatcher');
const PendingTransaction = require('../models/PendingTransaction');
const Expense = require('../models/Expense');

// @desc    Get Gmail connection status
// @route   GET /api/gmail/status
// @access  Private
exports.getStatus = asyncHandler(async (req, res) => {
    const status = await gmailService.getConnectionStatus(req.user.id);

    res.status(200).json({
        success: true,
        data: status
    });
});

// @desc    Fetch and parse Gmail transactions
// @route   POST /api/gmail/fetch
// @access  Private
exports.fetchTransactions = asyncHandler(async (req, res) => {
    const { maxResults, windowDays } = req.body;

    // Check if user has connected Gmail
    const status = await gmailService.getConnectionStatus(req.user.id);
    if (!status.connected) {
        return res.status(400).json({
            success: false,
            message: 'Gmail not connected. Please connect your Gmail account first.'
        });
    }

    // Fetch emails
    const messages = await gmailService.fetchMessages(req.user.id, {
        maxResults: maxResults || 50,
        windowDays: windowDays || 30
    });

    if (messages.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No transaction emails found',
            data: {
                fetched: 0,
                parsed: 0,
                existing: 0,
                new: 0
            }
        });
    }

    // Parse emails
    const parsedTransactions = transactionParser.parseEmailBatch(messages);

    // Match vendors
    const transactionsWithVendors = parsedTransactions.map(txn => {
        const { vendor, confidence: vendorConfidence } = merchantMatcher.matchVendor(txn.rawVendor);

        // Combine confidence scores
        const finalConfidence = txn.confidence === 'low' || vendorConfidence === 'low' ? 'low' :
            txn.confidence === 'medium' || vendorConfidence === 'medium' ? 'medium' : 'high';

        return {
            ...txn,
            vendor,
            confidence: finalConfidence,
            user: req.user.id
        };
    });

    // Save as pending transactions (skip duplicates)
    let newCount = 0;
    let existingCount = 0;

    for (const txn of transactionsWithVendors) {
        try {
            await PendingTransaction.create(txn);
            newCount++;
        } catch (error) {
            if (error.code === 11000) {
                // Duplicate gmailMessageId
                existingCount++;
            } else {
                console.error('Error saving pending transaction:', error);
            }
        }
    }

    res.status(200).json({
        success: true,
        message: `Fetched ${messages.length} emails, parsed ${parsedTransactions.length} transactions`,
        data: {
            fetched: messages.length,
            parsed: parsedTransactions.length,
            existing: existingCount,
            new: newCount
        }
    });
});

// @desc    Get pending transactions
// @route   GET /api/gmail/pending
// @access  Private
exports.getPendingTransactions = asyncHandler(async (req, res) => {
    const pending = await PendingTransaction.find({
        user: req.user.id,
        isConfirmed: false
    }).sort({ date: -1 });

    res.status(200).json({
        success: true,
        count: pending.length,
        data: pending
    });
});

// @desc    Confirm pending transactions
// @route   POST /api/gmail/confirm
// @access  Private
exports.confirmTransactions = asyncHandler(async (req, res) => {
    const { transactionIds } = req.body;

    if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Please provide an array of transaction IDs to confirm'
        });
    }

    // Fetch pending transactions
    const pending = await PendingTransaction.find({
        _id: { $in: transactionIds },
        user: req.user.id,
        isConfirmed: false
    });

    if (pending.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'No pending transactions found'
        });
    }

    // Convert to expenses
    const expenses = [];

    for (const txn of pending) {
        // Only create expense for debits (expenses)
        // Credits (income) would go to Income model if needed
        if (txn.direction === 'debit') {
            const expense = await Expense.create({
                user: req.user.id,
                description: txn.description || `${txn.vendor} transaction`,
                amount: txn.amount,
                category: txn.category,
                date: txn.date,
                paymentMethod: txn.metadata?.paymentMethod || 'UPI',
                tags: ['gmail-import'],
                notes: `Imported from Gmail. Ref: ${txn.referenceId || 'N/A'}`
            });
            expenses.push(expense);
        }

        // Mark as confirmed
        txn.isConfirmed = true;
        txn.confirmedAt = new Date();
        await txn.save();
    }

    res.status(200).json({
        success: true,
        message: `Confirmed ${pending.length} transactions, created ${expenses.length} expenses`,
        data: {
            confirmed: pending.length,
            expensesCreated: expenses.length
        }
    });
});

// @desc    Update pending transaction
// @route   PUT /api/gmail/pending/:id
// @access  Private
exports.updatePendingTransaction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { vendor, category, amount, date, description } = req.body;

    const transaction = await PendingTransaction.findOne({
        _id: id,
        user: req.user.id,
        isConfirmed: false
    });

    if (!transaction) {
        return res.status(404).json({
            success: false,
            message: 'Pending transaction not found'
        });
    }

    // Update fields
    if (vendor) transaction.vendor = vendor;
    if (category) transaction.category = category;
    if (amount) transaction.amount = amount;
    if (date) transaction.date = date;
    if (description) transaction.description = description;

    await transaction.save();

    res.status(200).json({
        success: true,
        data: transaction
    });
});

// @desc    Delete pending transaction
// @route   DELETE /api/gmail/pending/:id
// @access  Private
exports.deletePendingTransaction = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const transaction = await PendingTransaction.findOneAndDelete({
        _id: id,
        user: req.user.id,
        isConfirmed: false
    });

    if (!transaction) {
        return res.status(404).json({
            success: false,
            message: 'Pending transaction not found'
        });
    }

    res.status(200).json({
        success: true,
        message: 'Pending transaction deleted'
    });
});

// @desc    Revoke Gmail access
// @route   POST /api/gmail/revoke
// @access  Private
exports.revokeAccess = asyncHandler(async (req, res) => {
    // Revoke OAuth tokens
    await gmailService.revokeAccess(req.user.id);

    // Delete all pending (unconfirmed) transactions
    await PendingTransaction.deleteMany({
        user: req.user.id,
        isConfirmed: false
    });

    res.status(200).json({
        success: true,
        message: 'Gmail access revoked and pending data deleted'
    });
});

module.exports = exports;
