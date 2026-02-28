const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
  const healthcheck = {
    success: true,
    uptime: process.uptime(),
    timestamp: Date.now(),
    checks: {
      database: 'unknown',
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
  };

  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState === 1) {
      healthcheck.checks.database = 'connected';
    } else {
      healthcheck.checks.database = 'disconnected';
      healthcheck.success = false;
    }

    const statusCode = healthcheck.success ? 200 : 503;
    res.status(statusCode).json(healthcheck);
  } catch (error) {
    healthcheck.success = false;
    healthcheck.checks.database = 'error';
    res.status(503).json(healthcheck);
  }
});

module.exports = router;