const db = require('../config/db');

/**
 * @desc    Check system status
 * @route   GET /api/health
 * @access  Public
 */
const getHealthStatus = async (req, res) => {
  try {
    // Optional: Check DB connectivity as part of health check
    await db.query('SELECT 1');
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Krishna PG Backend'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      message: 'Service Unavailable'
    });
  }
};

module.exports = {
  getHealthStatus
};