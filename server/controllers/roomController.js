
const pool = require('../config/db');

const getRooms = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM rooms ORDER BY id'
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch rooms'
    });
  }
};

const addRoom = async (req, res) => {
  try {
    const { room_number, building, room_type, capacity } = req.body;

    if (!room_number || !building || !room_type || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (!Number.isInteger(Number(capacity)) || Number(capacity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Capacity must be a positive whole number'
      });
    }

    const result = await pool.query(
      `INSERT INTO rooms (room_number, building, room_type, capacity)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [room_number.trim(), building.trim(), room_type.trim(), Number(capacity)]
    );

    res.status(201).json({
      success: true,
      message: 'Room added successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error.message);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Room number already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Unable to add room'
    });
  }
};

const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { room_number, building, room_type, capacity } = req.body;

    if (!room_number || !building || !room_type || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (!Number.isInteger(Number(capacity)) || Number(capacity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Capacity must be a positive whole number'
      });
    }

    const result = await pool.query(
      `UPDATE rooms
       SET room_number=$1, building=$2, room_type=$3, capacity=$4
       WHERE id=$5 RETURNING *`,
      [room_number.trim(), building.trim(), room_type.trim(), Number(capacity), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error.message);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Room number already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Unable to update room'
    });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM rooms WHERE id=$1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: 'Unable to delete room'
    });
  }
};

module.exports = {
  getRooms,
  addRoom,
  updateRoom,
  deleteRoom
};
