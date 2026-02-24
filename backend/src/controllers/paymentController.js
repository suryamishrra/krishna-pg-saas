const db = require('../config/db');

/**
 * USER: Upload payment (UPI screenshot)
 * POST /api/payments
 */
const createPayment = async (req, res) => {
  const {
    booking_id,
    payment_for,
    amount,
    upi_transaction_id,
    payment_screenshot_url
  } = req.body;

  const userId = req.user.id;

  if (!payment_for || !amount || !payment_screenshot_url) {
    return res.status(400).json({
      message: 'Required payment details missing'
    });
  }

  try {
    await db.execute(
      `INSERT INTO payments
      (user_id, booking_id, payment_for, amount, payment_date,
       payment_status, upi_transaction_id, payment_screenshot_url)
      VALUES (?, ?, ?, ?, CURDATE(), 'PENDING', ?, ?)`,
      [
        userId,
        booking_id || null,
        payment_for,
        amount,
        upi_transaction_id || null,
        payment_screenshot_url
      ]
    );

    res.status(201).json({
      message: 'Payment submitted for verification'
    });
  } catch (err) {
    console.error('PAYMENT CREATE ERROR:', err);
    res.status(500).json({
      message: 'Server error',
      sqlMessage: err.sqlMessage,
      code: err.code
    });
  }
};

/**
 * ADMIN: Get all pending payments
 * GET /api/payments/pending
 */
const getPendingPayments = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT p.*, u.email
       FROM payments p
       JOIN users u ON p.user_id = u.id
       WHERE p.payment_status = 'PENDING'
       ORDER BY p.created_at DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * ADMIN: Verify payment
 * PUT /api/payments/:id/verify
 */
const verifyPayment = async (req, res) => {
  try {
    const [result] = await db.execute(
      `UPDATE payments
       SET payment_status = 'VERIFIED',
           admin_verified_by = ?,
           admin_verified_at = NOW()
       WHERE id = ? AND payment_status = 'PENDING'`,
      [req.user.id, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Payment not found or already processed'
      });
    }

    res.json({ message: 'Payment verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * ADMIN: Reject payment
 * PUT /api/payments/:id/reject
 */
const rejectPayment = async (req, res) => {
  const { reason } = req.body;

  try {
    const [result] = await db.execute(
      `UPDATE payments
       SET payment_status = 'REJECTED',
           admin_verified_by = ?,
           admin_verified_at = NOW(),
           admin_rejection_reason = ?
       WHERE id = ? AND payment_status = 'PENDING'`,
      [req.user.id, reason || 'Invalid payment', req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Payment not found or already processed'
      });
    }

    res.json({ message: 'Payment rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * USER: Get my payments
 * GET /api/payments/my
 */
const getMyPayments = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT *
       FROM payments
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createPayment,
  getPendingPayments,
  verifyPayment,
  rejectPayment,
  getMyPayments
};
