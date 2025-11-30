const mongoose = require('mongoose');

const PendingTransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    direction: {
        type: String,
        enum: ['debit', 'credit'],
        required: true
    },
    vendor: {
        type: String,
        required: true
    },
    rawVendor: {
        type: String, // Original extracted text before normalization
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    referenceId: {
        type: String,
        default: null
    },
    confidence: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
    },
    gmailMessageId: {
        type: String,
        required: true,
        unique: true // Prevent duplicates
    },
    metadata: {
        vpa: String, // UPI VPA
        accountLast4: String, // Last 4 digits of account
        paymentMethod: String, // UPI, Card, Net Banking, etc.
        originalSubject: String,
        senderEmail: String
    },
    // User can edit these before confirming
    category: {
        type: String,
        default: 'Uncategorized'
    },
    description: {
        type: String,
        default: ''
    },
    isConfirmed: {
        type: Boolean,
        default: false
    },
    confirmedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
PendingTransactionSchema.index({ user: 1, isConfirmed: 1 });
PendingTransactionSchema.index({ gmailMessageId: 1 }, { unique: true });
PendingTransactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PendingTransaction', PendingTransactionSchema);
