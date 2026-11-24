
const pool = require('../config/db');

const getExaminations = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM examinations ORDER BY exam_date'
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch examinations'
    });
  }
};

const addExamination = async (req, res) => {
  try {
    const {
      exam_name,
      subject_code,
      subject_name,
      department,
      semester,
      exam_date,
      start_time,
      end_time,
      total_students
    } = req.body;

    if (
      !exam_name || !subject_code || !subject_name ||
      !department || !semester || !exam_date ||
      !start_time || !end_time ||
      total_students === undefined || total_students === null ||
      total_students === ''
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (
      !Number.isInteger(Number(total_students)) ||
      Number(total_students) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Total students must be a positive whole number'
      });
    }

    if (start_time >= end_time) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    const result = await pool.query(
      `INSERT INTO examinations
      (exam_name, subject_code, subject_name, department,
       semester, exam_date, start_time, end_time, total_students)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        exam_name.trim(),
        subject_code.trim(),
        subject_name.trim(),
        department.trim(),
        semester,
        exam_date,
        start_time,
        end_time,
        Number(total_students)
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Examination added successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: 'Unable to add examination'
    });
  }
};

const updateExamination = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      exam_name,
      subject_code,
      subject_name,
      department,
      semester,
      exam_date,
      start_time,
      end_time,
      total_students
    } = req.body;

    if (
      !exam_name || !subject_code || !subject_name ||
      !department || !semester || !exam_date ||
      !start_time || !end_time ||
      total_students === undefined || total_students === null ||
      total_students === ''
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (
      !Number.isInteger(Number(total_students)) ||
      Number(total_students) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Total students must be a positive whole number'
      });
    }

    if (start_time >= end_time) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    const result = await pool.query(
      `UPDATE examinations SET
       exam_name=$1, subject_code=$2, subject_name=$3,
       department=$4, semester=$5, exam_date=$6,
       start_time=$7, end_time=$8, total_students=$9
       WHERE id=$10 RETURNING *`,
      [
        exam_name.trim(),
        subject_code.trim(),
        subject_name.trim(),
        department.trim(),
        semester,
        exam_date,
        start_time,
        end_time,
        Number(total_students),
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Examination not found'
      });
    }

    res.json({
      success: true,
      message: 'Examination updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: 'Unable to update examination'
    });
  }
};

const deleteExamination = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM examinations WHERE id=$1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Examination not found'
      });
    }

    res.json({
      success: true,
      message: 'Examination deleted successfully'
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: 'Unable to delete examination'
    });
  }
};

module.exports = {
  getExaminations,
  addExamination,
  updateExamination,
  deleteExamination
};
