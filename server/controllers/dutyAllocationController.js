
const pool = require('../config/db');
const allocateExamDuties = require('../algorithms/dutyAllocationAlgorithm');

const generateDutyAllocation = async (req, res) => {
  const client = await pool.connect();

  try {
    const { examinationId } = req.params;

    await client.query('BEGIN');

    const result = await allocateExamDuties(
      client,
      examinationId
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Exam duty allocation completed',
      data: result
    });
  } catch (error) {
    await client.query('ROLLBACK');

    console.error(error.message);

    const statusCode = [
      'Examination not found',
      'Allocate examination rooms first'
    ].includes(error.message) ? 400 : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Duty allocation failed'
    });
  } finally {
    client.release();
  }
};

const getDutyAllocations = async (req, res) => {
  try {
    const { examinationId } = req.params;

    const result = await pool.query(
      `SELECT
         d.id AS duty_id,
         d.duty_date,
         d.duty_start,
         d.duty_end,
         d.status,
         d.unassigned_reason,
         r.room_number,
         f.id AS faculty_id,
         f.name AS faculty_name,
         da.workload_minutes
       FROM exam_duties d
       JOIN rooms r ON d.room_id = r.id
       LEFT JOIN duty_assignments da ON d.id = da.duty_id
       LEFT JOIN faculty f ON da.faculty_id = f.id
       WHERE d.examination_id = $1
       ORDER BY r.room_number`,
      [examinationId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: 'Unable to fetch duty allocations'
    });
  }
};

module.exports = {
  generateDutyAllocation,
  getDutyAllocations
};
