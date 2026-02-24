const db = require('../config/db');

/**
 * @desc    Get all beds for a specific room
 * @route   GET /api/rooms/:roomId/beds
 * @access  Authenticated
 */
const getBedsByRoom = async (req, res) => {
  const { roomId } = req.params;

  try {
    const [beds] = await db.execute(
      'SELECT * FROM beds WHERE room_id = ?',
      [roomId]
    );
    res.json(beds);
  } catch (error) {
    console.error('Error fetching beds:', error);
    res.status(500).json({ message: 'Server error fetching beds' });
  }
};

/**
 * @desc    Create a new bed
 * @route   POST /api/beds
 * @access  Admin only
 */
const createBed = async (req, res) => {
  const { room_id, bed_number, rent_per_month, description } = req.body;

  // ✅ Correct validation (schema-based)
  if (!room_id || !bed_number || !rent_per_month) {
    return res.status(400).json({
      message: 'Room ID, bed number, and rent are required'
    });
  }

  try {
    // Check room exists
    const [roomCheck] = await db.execute(
      'SELECT id FROM rooms WHERE id = ?',
      [room_id]
    );

    if (roomCheck.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Insert bed (NO bed_type)
    const [result] = await db.execute(
      `INSERT INTO beds 
       (room_id, bed_number, rent_per_month, is_available, description)
       VALUES (?, ?, ?, ?, ?)`,
      [
        room_id,
        bed_number,
        rent_per_month,
        true,
        description || null
      ]
    );

    res.status(201).json({
      message: 'Bed created successfully',
      bedId: result.insertId
    });

  } catch (error) {
    console.error('Error creating bed:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Bed number already exists in this room'
      });
    }
    res.status(500).json({ message: 'Server error creating bed' });
  }
};

/**
 * @desc    Update a bed
 * @route   PUT /api/beds/:id
 * @access  Admin only
 */
const updateBed = async (req, res) => {
  const { id } = req.params;
  const { bed_number, is_available } = req.body;

  try {
    const [result] = await db.execute(
      'UPDATE beds SET bed_number = ?, is_available = ? WHERE id = ?',
      [bed_number, is_available, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    res.json({ message: 'Bed updated successfully' });
  } catch (error) {
    console.error('Error updating bed:', error);
    res.status(500).json({ message: 'Server error updating bed' });
  }
};

module.exports = {
  getBedsByRoom,
  createBed,
  updateBed
};
