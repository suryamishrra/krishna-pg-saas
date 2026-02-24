const db = require('../config/db');

/**
 * @desc    Create a booking (USER)
 * @route   POST /api/bookings
 */
const createBooking = async (req, res) => {
  const { bed_id, check_in_date, expected_check_out_date, special_requests } = req.body;
  const userId = req.user.id;

  if (!bed_id || !check_in_date) {
    return res.status(400).json({
      message: 'Bed ID and check-in date are required'
    });
  }

  try {
    // 1. Check if user already has an active booking
    const [existing] = await db.execute(
      `SELECT id FROM bookings 
       WHERE user_id = ? AND booking_status IN ('PENDING', 'APPROVED')`,
      [userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: 'User already has an active booking'
      });
    }

    // 2. Check bed availability
    const [bed] = await db.execute(
      'SELECT is_available FROM beds WHERE id = ?',
      [bed_id]
    );

    if (bed.length === 0) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    if (!bed[0].is_available) {
      return res.status(400).json({ message: 'Bed is not available' });
    }

    // 3. Create booking
    const [result] = await db.execute(
      `INSERT INTO bookings 
       (user_id, bed_id, check_in_date, expected_check_out_date, booking_status, special_requests)
       VALUES (?, ?, ?, ?, 'PENDING', ?)`,
      [
        userId,
        bed_id,
        check_in_date,
        expected_check_out_date || null,
        special_requests || null
      ]
    );

    res.status(201).json({
      message: 'Booking created successfully',
      bookingId: result.insertId,
      status: 'PENDING'
    });

  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get my bookings (USER)
 * @route   GET /api/bookings/my
 */
const getMyBookings = async (req, res) => {
  try {
    const [bookings] = await db.execute(
      `SELECT 
          b.id,
          b.booking_status,
          b.check_in_date,
          b.expected_check_out_date,
          r.room_number,
          bed.bed_number
       FROM bookings b
       JOIN beds bed ON b.bed_id = bed.id
       JOIN rooms r ON bed.room_id = r.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );

    res.json(bookings);
  } catch (error) {
    console.error('Get My Bookings Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get all pending bookings (ADMIN)
 * @route   GET /api/bookings/pending
 */
const getPendingBookings = async (req, res) => {
  try {
    const [bookings] = await db.execute(
      `SELECT 
          b.id,
          b.check_in_date,
          b.booking_status,
          u.email,
          r.room_number,
          bed.bed_number
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN beds bed ON b.bed_id = bed.id
       JOIN rooms r ON bed.room_id = r.id
       WHERE b.booking_status = 'PENDING'`
    );

    res.json(bookings);
  } catch (error) {
    console.error('Get Pending Bookings Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Approve booking (ADMIN)
 * @route   PUT /api/bookings/:id/approve
 */
const approveBooking = async (req, res) => {
  const bookingId = req.params.id;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Lock booking
    const [booking] = await connection.execute(
      `SELECT * FROM bookings WHERE id = ? FOR UPDATE`,
      [bookingId]
    );

    if (booking.length === 0) {
      throw new Error('Booking not found');
    }

    if (booking[0].booking_status !== 'PENDING') {
      throw new Error('Booking is not pending');
    }

    const { user_id, bed_id, check_in_date, expected_check_out_date } = booking[0];

    // 2. Lock bed
    const [bed] = await connection.execute(
      'SELECT is_available FROM beds WHERE id = ? FOR UPDATE',
      [bed_id]
    );

    if (!bed[0].is_available) {
      throw new Error('Bed is no longer available');
    }

    // 3. Update booking
    await connection.execute(
      `UPDATE bookings SET booking_status = 'APPROVED' WHERE id = ?`,
      [bookingId]
    );

    // 4. Update bed availability
    await connection.execute(
      `UPDATE beds SET is_available = false WHERE id = ?`,
      [bed_id]
    );

    // 5. Create resident entry
    await connection.execute(
      `INSERT INTO residents 
       (booking_id, user_id, bed_id, move_in_date, expected_move_out_date, resident_status)
       VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
      [bookingId, user_id, bed_id, check_in_date, expected_check_out_date]
    );

    await connection.commit();
    res.json({ message: 'Booking approved successfully' });

  } catch (error) {
    await connection.rollback();
    console.error('Approve Booking Error:', error);
    res.status(400).json({ message: error.message });
  } finally {
    connection.release();
  }
};

/**
 * @desc    Reject booking (ADMIN)
 * @route   PUT /api/bookings/:id/reject
 */
const rejectBooking = async (req, res) => {
  try {
    const [result] = await db.execute(
      `UPDATE bookings 
       SET booking_status = 'REJECTED' 
       WHERE id = ? AND booking_status = 'PENDING'`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Booking not found or not pending'
      });
    }

    res.json({ message: 'Booking rejected successfully' });
  } catch (error) {
    console.error('Reject Booking Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getPendingBookings,
  approveBooking,
  rejectBooking
};



