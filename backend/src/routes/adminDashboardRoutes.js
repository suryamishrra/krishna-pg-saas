const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminDashboardController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get(
  '/dashboard',
  verifyToken,
  checkRole('ADMIN'),
  getDashboardStats
);

module.exports = router;
