const express = require('express');
const router = express.Router();

// Fast health check - no database queries
// Used for warmup and service monitoring
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

module.exports = router;
