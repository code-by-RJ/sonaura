const mongoose = require('mongoose');

// GET /api/health
// Public — no auth required
// Returns server status, uptime, DB connection state
const healthCheck = (req, res) => {
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbState = mongoose.connection.readyState;

  res.status(200).json({
    success: true,
    status: 'ok',
    uptime: Math.floor(process.uptime()),       // seconds since server started
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbStateMap[dbState] ?? 'unknown',
    version: '1.0.0',
  });
};

module.exports = { healthCheck };
