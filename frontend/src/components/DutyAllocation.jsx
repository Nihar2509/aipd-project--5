
import { useEffect, useState } from 'react';
import './DutyAllocation.css';

import { getExaminations } from '../services/examinationService';
import {
  generateDutyAllocation,
  getDutyAllocations
} from '../services/dutyAllocationService';

function DutyAllocation() {
  const [examinations, setExaminations] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [duties, setDuties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadExaminations();
  }, []);

  const loadExaminations = async () => {
    try {
      const response = await getExaminations();
      setExaminations(response.data || []);
    } catch (err) {
      setError('Unable to load examinations');
    }
  };

  const loadDuties = async (examId) => {
    try {
      const response = await getDutyAllocations(examId);
      setDuties(response.data || []);
    } catch (err) {
      setError('Unable to load duty allocations');
    }
  };

  const handleExamChange = async (e) => {
    const examId = e.target.value;

    setSelectedExam(examId);
    setDuties([]);
    setMessage('');
    setError('');

    if (examId) {
      await loadDuties(examId);
    }
  };

  const handleGenerate = async () => {
    if (!selectedExam) {
      setError('Please select an examination');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const response = await generateDutyAllocation(selectedExam);

      setMessage(response.message);

      await loadDuties(selectedExam);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to generate duty allocation'
      );
    } finally {
      setLoading(false);
    }
  };

  const totalDuties = duties.length;

  const assignedDuties = duties.filter(
    (duty) => duty.status === 'Assigned'
  ).length;

  const unassignedDuties = duties.filter(
    (duty) => duty.status === 'Unassigned'
  ).length;

  return (
    <div className="duty-allocation-page">
      <div className="duty-header">
        <h2>Automated Exam Duty Allocation</h2>
        <p>Generate and manage teacher examination duties.</p>
      </div>

      <div className="duty-selection">
        <label>Select Examination</label>

        <select
          value={selectedExam}
          onChange={handleExamChange}
        >
          <option value="">Select an examination</option>

          {examinations.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.exam_name} - {String(exam.exam_date).slice(0, 10)}
            </option>
          ))}
        </select>

        <button
          onClick={handleGenerate}
          disabled={!selectedExam || loading}
        >
          {loading ? 'Generating...' : 'Generate Duties Automatically'}
        </button>
      </div>

      {message && <div className="duty-success">{message}</div>}
      {error && <div className="duty-error">{error}</div>}

      {selectedExam && (
        <>
          <div className="duty-summary">
            <div className="duty-summary-card">
              <h3>{totalDuties}</h3>
              <p>Total Rooms / Duties</p>
            </div>

            <div className="duty-summary-card">
              <h3>{assignedDuties}</h3>
              <p>Assigned</p>
            </div>

            <div className="duty-summary-card">
              <h3>{unassignedDuties}</h3>
              <p>Unassigned</p>
            </div>
          </div>

          <div className="duty-table-container">
            <h3>Teacher Duty Roster</h3>

            {duties.length === 0 ? (
              <p>No duties generated yet. Click Generate Duties Automatically.</p>
            ) : (
              <table className="duty-table">
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Teacher</th>
                    <th>Date</th>
                    <th>Duty Start</th>
                    <th>Duty End</th>
                    <th>Workload</th>
                    <th>Status</th>
                    <th>Reason</th>
                  </tr>
                </thead>

                <tbody>
                  {duties.map((duty) => (
                    <tr key={duty.duty_id}>
                      <td>{duty.room_number}</td>
                      <td>{duty.faculty_name || '-'}</td>
                      <td>{String(duty.duty_date).slice(0, 10)}</td>
                      <td>{String(duty.duty_start).slice(0, 5)}</td>
                      <td>{String(duty.duty_end).slice(0, 5)}</td>
                      <td>
                        {duty.workload_minutes
                          ? `${duty.workload_minutes} min`
                          : '-'}
                      </td>
                      <td>{duty.status}</td>
                      <td>{duty.unassigned_reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default DutyAllocation;
