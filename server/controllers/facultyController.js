
const pool = require('../config/db');

const getFaculty = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM faculty ORDER BY id'
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty'
    });
  }
};

const addFaculty = async (req, res) => {
  try {
    const { name, email, department, designation } = req.body;

    if (!name || !email || !department || !designation) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO faculty (name, email, department, designation)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        department.trim(),
        designation.trim()
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Faculty added successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error.message);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Faculty email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add faculty'
    });
  }
};

const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, designation } = req.body;

    if (!name || !email || !department || !designation) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const result = await pool.query(
      `UPDATE faculty
       SET name = $1, email = $2, department = $3, designation = $4
       WHERE id = $5
       RETURNING *`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        department.trim(),
        designation.trim(),
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    res.json({
      success: true,
      message: 'Faculty updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error.message);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Another faculty member uses this email'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update faculty'
    });
  }
};

const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM faculty WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    res.json({
      success: true,
      message: 'Faculty deleted successfully'
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete faculty'
    });
  }
};

module.exports = {
  getFaculty,
  addFaculty,
  updateFaculty,
  deleteFaculty
};
