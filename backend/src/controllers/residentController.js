const db = require('../config/db');

/**
 * @desc    Get active residents (ADMIN)
 * @route   GET /api/residents/active
 */
const getActiveResidents = async (req, res) => {
  try {
    const [residents] = await db.execute(
      `SELECT 
          res.id,
          res.resident_status,
          res.move_in_date,
          res.expected_move_out_date,
          u.email,
          r.room_number,
          bed.bed_number
       FROM residents res
       JOIN users u ON res.user_id = u.id
       JOIN beds bed ON res.bed_id = bed.id
       JOIN rooms r ON bed.room_id = r.id
       WHERE res.resident_status = 'ACTIVE'`
    );

    res.json(residents);
  } catch (error) {
    console.error('Get Active Residents Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Checkout resident (ADMIN)
 * @route   PUT /api/residents/:id/checkout
 */
const checkoutResident = async (req, res) => {
  const residentId = req.params.id;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Lock resident row
    const [resident] = await connection.execute(
      `SELECT * FROM residents 
       WHERE id = ? AND resident_status = 'ACTIVE' 
       FOR UPDATE`,
      [residentId]
    );

    if (resident.length === 0) {
      throw new Error('Active resident not found');
    }

    const { booking_id, bed_id } = resident[0];

    // 2. Update resident -> CHECKED_OUT
    await connection.execute(
      `UPDATE residents 
       SET resident_status = 'CHECKED_OUT',
           actual_move_out_date = CURDATE()
       WHERE id = ?`,
      [residentId]
    );

    // 3. Free the bed
    await connection.execute(
      `UPDATE beds SET is_available = true WHERE id = ?`,
      [bed_id]
    );

    // 4. Complete booking
    await connection.execute(
      `UPDATE bookings 
       SET booking_status = 'COMPLETED',
           actual_check_out_date = CURDATE()
       WHERE id = ?`,
      [booking_id]
    );

    await connection.commit();

    res.json({ message: 'Resident checked out successfully' });

  } catch (error) {
    await connection.rollback();
    console.error('Checkout Resident Error:', error);
    res.status(400).json({ message: error.message });
  } finally {
    connection.release();
  }
};

module.exports = {
  getActiveResidents,
  checkoutResident
};
