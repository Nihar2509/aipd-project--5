
const pool = require('../config/db');

const getAvailability = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT fa.*, f.name AS faculty_name, f.department
       FROM faculty_availability fa
       JOIN faculty f ON fa.faculty_id = f.id
       ORDER BY fa.availability_date`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch faculty availability'
    });
  }
};

const addAvailability = async (req, res) => {
  try {
    const {
      faculty_id,
      availability_date,
      start_time,
      end_time,
      status,
      reason
    } = req.body;

    if (!faculty_id || !availability_date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'Faculty, date and time are required'
      });
    }

    if (start_time >= end_time) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    const validStatuses = ['Available', 'Unavailable', 'Leave'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid availability status'
      });
    }

    const result = await pool.query(
      `INSERT INTO faculty_availability
       (faculty_id, availability_date, start_time, end_time, status, reason)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        faculty_id,
        availability_date,
        start_time,
        end_time,
        status || 'Available',
        reason || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Availability added successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error.message);

    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'Selected faculty member does not exist'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Unable to add availability'
    });
  }
};

const updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      faculty_id,
      availability_date,
      start_time,
      end_time,
      status,
      reason
    } = req.body;

    if (!faculty_id || !availability_date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'Faculty, date and time are required'
      });
    }

    if (start_time >= end_time) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    const validStatuses = ['Available', 'Unavailable', 'Leave'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid availability status'
      });
    }

    const result = await pool.query(
      `UPDATE faculty_availability
       SET faculty_id=$1, availability_date=$2, start_time=$3,
           end_time=$4, status=$5, reason=$6
       WHERE id=$7 RETURNING *`,
      [
        faculty_id,
        availability_date,
        start_time,
        end_time,
        status || 'Available',
        reason || null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Availability record not found'
      });
    }

    res.json({
      success: true,
      message: 'Availability updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: 'Unable to update availability'
    });
  }
};

const deleteAvailability = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM faculty_availability WHERE id=$1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Availability record not found'
      });
    }

    res.json({
      success: true,
      message: 'Availability deleted successfully'
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: 'Unable to delete availability'
    });
  }
};

module.exports = {
  getAvailability,
  addAvailability,
  updateAvailability,
  deleteAvailability
};
