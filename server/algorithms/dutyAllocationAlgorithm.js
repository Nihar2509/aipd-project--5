
const allocateExamDuties = async (client, examinationId) => {
  // 1. Get examination details
  const examResult = await client.query(
    'SELECT * FROM examinations WHERE id = $1 FOR UPDATE',
    [examinationId]
  );

  if (examResult.rows.length === 0) {
    throw new Error('Examination not found');
  }

  const exam = examResult.rows[0];

  // 2. Get rooms allocated to this examination
  const roomResult = await client.query(
    `SELECT room_id
     FROM exam_room_allocations
     WHERE examination_id = $1`,
    [examinationId]
  );

  if (roomResult.rows.length === 0) {
    throw new Error('Allocate examination rooms first');
  }

  // 3. Set reporting time
  const reportingMinutes = 15;

  const dutyTimeResult = await client.query(
    `SELECT
       ($1::time - ($3 || ' minutes')::interval)::time
         AS duty_start,
       $2::time AS duty_end,
       EXTRACT(EPOCH FROM (
         $2::time -
         ($1::time - ($3 || ' minutes')::interval)
       )) / 60 AS workload_minutes`,
    [exam.start_time, exam.end_time, reportingMinutes]
  );

  const dutyStart = dutyTimeResult.rows[0].duty_start;
  const dutyEnd = dutyTimeResult.rows[0].duty_end;

  const workloadMinutes = Number(
    dutyTimeResult.rows[0].workload_minutes
  );

  // 4. Remove previous duties for this examination.
  // Previous assignments are also deleted automatically.
  await client.query(
    'DELETE FROM exam_duties WHERE examination_id = $1',
    [examinationId]
  );

  // 5. Get active faculty
  const facultyResult = await client.query(
    `SELECT id, name, designation
     FROM faculty
     WHERE active = TRUE`
  );

  // 6. Get faculty availability
  const availabilityResult = await client.query(
    `SELECT *
     FROM faculty_availability
     WHERE availability_date = $1`,
    [exam.exam_date]
  );

  const availability = availabilityResult.rows;

  // 7. Calculate existing workload of each teacher
  const workloadResult = await client.query(
    `SELECT
       da.faculty_id,
       SUM(da.workload_minutes) AS total_minutes
     FROM duty_assignments da
     JOIN exam_duties d ON da.duty_id = d.id
     WHERE d.status = 'Assigned'
     GROUP BY da.faculty_id`
  );

  const workloadMap = {};

  workloadResult.rows.forEach((item) => {
    workloadMap[Number(item.faculty_id)] =
      Number(item.total_minutes);
  });

  // 8. Find teachers with overlapping duties
  const conflictResult = await client.query(
    `SELECT DISTINCT da.faculty_id
     FROM duty_assignments da
     JOIN exam_duties d ON da.duty_id = d.id
     WHERE d.duty_date = $1
       AND d.status = 'Assigned'
       AND d.duty_start < $3
       AND d.duty_end > $2`,
    [exam.exam_date, dutyStart, dutyEnd]
  );

  const conflictedFaculty = conflictResult.rows.map(
    (item) => Number(item.faculty_id)
  );

  // 9. Find eligible faculty
  const eligibleFaculty = facultyResult.rows.filter((teacher) => {
    const teacherId = Number(teacher.id);

    // Reject teachers with overlapping duties
    if (conflictedFaculty.includes(teacherId)) {
      return false;
    }

    const records = availability.filter(
      (item) => Number(item.faculty_id) === teacherId
    );

    // Require an Available record covering the full duty
    const hasAvailableSlot = records.some((item) => {
      return (
        item.status === 'Available' &&
        String(item.start_time).slice(0, 8) <=
          String(dutyStart).slice(0, 8) &&
        String(item.end_time).slice(0, 8) >=
          String(dutyEnd).slice(0, 8)
      );
    });

    // Reject overlapping Unavailable or Leave records
    const hasUnavailableSlot = records.some((item) => {
      return (
        ['Unavailable', 'Leave'].includes(item.status) &&
        String(item.start_time).slice(0, 8) <
          String(dutyEnd).slice(0, 8) &&
        String(item.end_time).slice(0, 8) >
          String(dutyStart).slice(0, 8)
      );
    });

    return hasAvailableSlot && !hasUnavailableSlot;
  });

  const assignedTeachers = [];
  const unassignedDuties = [];

  // 10. Create one duty for every allocated room
  for (const room of roomResult.rows) {
    const dutyResult = await client.query(
      `INSERT INTO exam_duties
       (examination_id, room_id, duty_date, duty_start,
        duty_end, reporting_minutes, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Pending')
       RETURNING id`,
      [
        examinationId,
        room.room_id,
        exam.exam_date,
        dutyStart,
        dutyEnd,
        reportingMinutes
      ]
    );

    const dutyId = dutyResult.rows[0].id;

    // 11. Sort teachers by HOD priority and current workload
    eligibleFaculty.sort((a, b) => {
      const aIsHod = String(a.designation)
        .toLowerCase().includes('hod');

      const bIsHod = String(b.designation)
        .toLowerCase().includes('hod');

      if (aIsHod !== bIsHod) {
        return aIsHod ? 1 : -1;
      }

      return (
        (workloadMap[Number(a.id)] || 0) -
        (workloadMap[Number(b.id)] || 0)
      );
    });

    // 12. Select the least-loaded eligible teacher
    const teacher = eligibleFaculty.shift();

    if (!teacher) {
      const reason = 'No eligible available teacher found';

      await client.query(
        `UPDATE exam_duties
         SET status = 'Unassigned',
             unassigned_reason = $1
         WHERE id = $2`,
        [reason, dutyId]
      );

      unassignedDuties.push({
        room_id: room.room_id,
        reason
      });

      continue;
    }

    // 13. Save teacher assignment
    await client.query(
      `INSERT INTO duty_assignments
       (duty_id, faculty_id, workload_minutes)
       VALUES ($1, $2, $3)`,
      [dutyId, teacher.id, workloadMinutes]
    );

    await client.query(
      `UPDATE exam_duties
       SET status = 'Assigned'
       WHERE id = $1`,
      [dutyId]
    );

    assignedTeachers.push({
      room_id: room.room_id,
      faculty_id: teacher.id,
      faculty_name: teacher.name,
      workload_minutes: workloadMinutes
    });

    // Update workload for the next assignment
    workloadMap[Number(teacher.id)] =
      (workloadMap[Number(teacher.id)] || 0) +
      workloadMinutes;
  }

  return {
    assigned: assignedTeachers,
    unassigned: unassignedDuties,
    total_rooms: roomResult.rows.length,
    assigned_count: assignedTeachers.length,
    unassigned_count: unassignedDuties.length
  };
};

module.exports = allocateExamDuties;
