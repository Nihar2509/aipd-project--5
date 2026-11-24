
const pool = require('../config/db');
const allocateRooms = require('../algorithms/roomAllocationAlgorithm');

const allocateExamRooms = async (req, res) => {
  const client = await pool.connect();

  try {
    const { examinationId } = req.params;

    await client.query('BEGIN');

    const selectedRooms = await allocateRooms(
      client,
      examinationId
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Rooms allocated successfully',
      data: selectedRooms
    });
  } catch (error) {
    await client.query('ROLLBACK');

    console.error(error.message);

    const statusCode = [
      'Examination not found',
      'Enter the total number of students before allocating rooms'
    ].includes(error.message) ||
      error.message.startsWith('Insufficient room capacity')
      ? 400
      : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Room allocation failed'
    });
  } finally {
    client.release();
  }
};

const getRoomAllocations = async (req, res) => {
  try {
    const { examinationId } = req.params;

    const result = await pool.query(
      `SELECT
         era.id,
         era.examination_id,
         era.room_id,
         era.students_assigned,
         r.room_number,
         r.building,
         r.capacity,
         e.exam_name,
         e.exam_date,
         e.start_time,
         e.end_time
       FROM exam_room_allocations era
       JOIN rooms r ON era.room_id = r.id
       JOIN examinations e ON era.examination_id = e.id
       WHERE era.examination_id = $1
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
      message: 'Unable to fetch room allocations'
    });
  }
};

module.exports = {
  allocateExamRooms,
  getRoomAllocations
};
