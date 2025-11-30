const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const gmailFetchJob = require('../jobs/gmailFetchJob');
const User = require('../models/User');

// Middleware to check for admin role
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({
            success: false,
            message: 'Not authorized as an admin'
        });
    }
};

router.use(protect);
router.use(admin);

// @desc    Test Gmail fetch for specific user
// @route   POST /api/admin/test-gmail-fetch
// @access  Private/Admin
router.post('/test-gmail-fetch', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: 'User ID is required'
        });
    }

    try {
        // Manually trigger the job logic for this user
        // We import the job module to access the internal logic if exported, 
        // or we can use the service directly. 
        // Ideally gmailFetchJob should export a way to run for single user.
        // Let's use the service directly for now as it returns stats.

        const gmailService = require('../services/gmailService');
        const stats = await gmailService.listNewMessagesAndParse(userId, {
            windowDays: 30 // Force 30 days for test
        });

        res.status(200).json({
            success: true,
            message: 'Test fetch completed',
            data: stats
        });

    } catch (error) {
        console.error('Admin test fetch error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
