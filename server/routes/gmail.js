const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const gmailController = require('../controllers/gmailController');

// All routes are protected
router.use(protect);

// Gmail connection status
router.get('/status', gmailController.getStatus);

// Fetch and parse transactions
router.post('/fetch', gmailController.fetchTransactions);

// Pending transactions
router.get('/pending', gmailController.getPendingTransactions);
router.put('/pending/:id', gmailController.updatePendingTransaction);
router.delete('/pending/:id', gmailController.deletePendingTransaction);

// Confirm batch
router.post('/confirm', gmailController.confirmTransactions);

// Revoke access
router.post('/revoke', gmailController.revokeAccess);

module.exports = router;
