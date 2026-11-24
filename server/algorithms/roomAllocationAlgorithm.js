
const allocateRooms = async (client, examinationId) => {
  // Get examination details
  const examResult = await client.query(
    'SELECT * FROM examinations WHERE id = $1 FOR UPDATE',
    [examinationId]
  );

  if (examResult.rows.length === 0) {
    throw new Error('Examination not found');
  }

  const exam = examResult.rows[0];

  if (exam.total_students <= 0) {
    throw new Error('Enter the total number of students before allocating rooms');
  }

  // Lock active rooms while allocation is being processed
  const roomResult = await client.query(
    `SELECT id, room_number, capacity
     FROM rooms
     WHERE active = TRUE
     ORDER BY id
     FOR UPDATE`
  );

  // Find rooms already occupied by overlapping examinations
  const occupiedResult = await client.query(
    `SELECT DISTINCT era.room_id
     FROM exam_room_allocations era
     JOIN examinations e ON era.examination_id = e.id
     WHERE e.exam_date = $1
       AND e.start_time < $2
       AND e.end_time > $3
       AND e.id != $4`,
    [
      exam.exam_date,
      exam.end_time,
      exam.start_time,
      examinationId
    ]
  );

  const occupiedRoomIds = occupiedResult.rows.map(
    (room) => Number(room.room_id)
  );

  // Keep only rooms that are free during this examination
  const availableRooms = roomResult.rows.filter(
    (room) => !occupiedRoomIds.includes(Number(room.id))
  );

  // Greedy selection: use larger rooms first
  availableRooms.sort((a, b) => b.capacity - a.capacity);

  let remainingStudents = Number(exam.total_students);
  const selectedRooms = [];

  for (const room of availableRooms) {
    if (remainingStudents <= 0) break;

    const studentsAssigned = Math.min(
      Number(room.capacity),
      remainingStudents
    );

    selectedRooms.push({
      room_id: room.id,
      room_number: room.room_number,
      capacity: Number(room.capacity),
      students_assigned: studentsAssigned
    });

    remainingStudents -= studentsAssigned;
  }

  if (remainingStudents > 0) {
    throw new Error(
      `Insufficient room capacity. ${remainingStudents} students could not be assigned.`
    );
  }

  // Replace previous room allocations for this examination
  await client.query(
    'DELETE FROM exam_room_allocations WHERE examination_id = $1',
    [examinationId]
  );

  // Save the new room allocations
  for (const room of selectedRooms) {
    await client.query(
      `INSERT INTO exam_room_allocations
       (examination_id, room_id, students_assigned)
       VALUES ($1, $2, $3)`,
      [
        examinationId,
        room.room_id,
        room.students_assigned
      ]
    );
  }

  return selectedRooms;
};

module.exports = allocateRooms;
