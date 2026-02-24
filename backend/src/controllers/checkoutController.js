const db = require('../config/db');

/**
 * ADMIN: Checkout preview
 * GET /api/checkout/:residentId/preview
 */
const checkoutPreview = async (req, res) => {
  const { residentId } = req.params;

  try {
    const [[resident]] = await db.execute(
      `SELECT r.id,
              r.user_id,
              r.bed_id,
              r.booking_id,
              r.security_deposit,
              u.email,
              u.first_name,
              u.last_name
       FROM residents r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?
         AND r.resident_status = 'ACTIVE'`,
      [residentId]
    );

    if (!resident) {
      return res.status(404).json({ message: 'Active resident not found' });
    }

    const [[pendingRent]] = await db.execute(
      `SELECT IFNULL(SUM(amount), 0) AS pendingRent
       FROM payments
       WHERE user_id = ?
         AND payment_for = 'RENT'
         AND payment_status = 'PENDING'`,
      [resident.user_id]
    );

    const refundableAmount =
      Number(resident.security_deposit) - Number(pendingRent.pendingRent);

    res.json({
      resident,
      pendingRent: pendingRent.pendingRent,
      refundableAmount
    });

  } catch (err) {
    console.error('Checkout Preview Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * ADMIN: Confirm checkout
 * POST /api/checkout/:residentId/confirm
 */
const confirmCheckout = async (req, res) => {
  const { residentId } = req.params;
  const {
    actual_move_out_date,
    damage_deduction = 0,
    other_charges = 0,
    notes
  } = req.body;

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 🔒 LOCK resident row
    const [[resident]] = await conn.execute(
      `SELECT id,
              user_id,
              bed_id,
              booking_id,
              security_deposit
       FROM residents
       WHERE id = ?
         AND resident_status = 'ACTIVE'
       FOR UPDATE`,
      [residentId]
    );

    if (!resident || !resident.bed_id || !resident.booking_id) {
      throw new Error('Invalid resident, bed or booking not linked');
    }

    // Pending rent
    const [[pendingRent]] = await conn.execute(
      `SELECT IFNULL(SUM(amount), 0) AS pendingRent
       FROM payments
       WHERE user_id = ?
         AND payment_for = 'RENT'
         AND payment_status = 'PENDING'`,
      [resident.user_id]
    );

    const finalAmount =
      Number(resident.security_deposit)
      - Number(pendingRent.pendingRent)
      - Number(damage_deduction)
      - Number(other_charges);

    // Update resident
    await conn.execute(
      `UPDATE residents
       SET resident_status = 'CHECKED_OUT',
           actual_move_out_date = ?,
           refundable_amount = ?,
           final_settlement_date = NOW()
       WHERE id = ?`,
      [actual_move_out_date, finalAmount, residentId]
    );

    // Free bed
    await conn.execute(
      `UPDATE beds
       SET is_available = 1
       WHERE id = ?`,
      [resident.bed_id]
    );

    // Complete booking
    await conn.execute(
      `UPDATE bookings
       SET booking_status = 'COMPLETED'
       WHERE id = ?`,
      [resident.booking_id]
    );

    // Settlement record
    await conn.execute(
      `INSERT INTO payments
       (user_id, payment_for, amount, payment_status, notes, payment_date)
       VALUES (?, 'OTHER', ?, 'VERIFIED', ?, CURDATE())`,
      [
        resident.user_id,
        finalAmount,
        notes || 'Final settlement'
      ]
    );

    await conn.commit();

    res.json({
      message: 'Checkout completed successfully',
      finalSettlementAmount: finalAmount
    });

  } catch (err) {
    await conn.rollback();
    console.error('Checkout Confirm Error:', err);
    res.status(400).json({ message: err.message });
  } finally {
    conn.release();
  }
};

/**
 * USER: View my settlement
 * GET /api/checkout/me
 */
const mySettlement = async (req, res) => {
  try {
    const [[row]] = await db.execute(
      `SELECT refundable_amount,
              final_settlement_date
       FROM residents
       WHERE user_id = ?
         AND resident_status = 'CHECKED_OUT'
       ORDER BY final_settlement_date DESC
       LIMIT 1`,
      [req.user.id]
    );

    res.json(row || null);
  } catch (err) {
    console.error('My Settlement Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  checkoutPreview,
  confirmCheckout,
  mySettlement
};
