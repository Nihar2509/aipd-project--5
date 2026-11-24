
import { useEffect, useState } from 'react';
import { getExaminations } from '../services/examinationService';
import {
  allocateExamRooms,
  getRoomAllocations
} from '../services/roomAllocationService';
import './RoomAllocation.css';

function RoomAllocation() {
  const [examinations, setExaminations] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allocating, setAllocating] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadExaminations();
  }, []);

  const loadExaminations = async () => {
    try {
      setLoading(true);
      const result = await getExaminations();
      setExaminations(result.data || []);
    } catch (err) {
      setError('Unable to load examinations.');
    } finally {
      setLoading(false);
    }
  };

  const handleExamChange = async (e) => {
    const examId = e.target.value;

    setSelectedExam(examId);
    setAllocations([]);
    setError('');
    setMessage('');

    if (!examId) return;

    try {
      setLoading(true);

      const result = await getRoomAllocations(examId);
      setAllocations(result.data || []);
    } catch (err) {
      setError('Unable to load room allocations.');
    } finally {
      setLoading(false);
    }
  };

  const handleAllocation = async () => {
    if (!selectedExam) {
      setError('Please select an examination.');
      return;
    }

    try {
      setAllocating(true);
      setError('');
      setMessage('');

      const result = await allocateExamRooms(selectedExam);

      setAllocations(result.data || []);
      setMessage(result.message);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Room allocation failed.'
      );
      setAllocations([]);
    } finally {
      setAllocating(false);
    }
  };

  const totalStudents = allocations.reduce(
    (total, room) => total + Number(room.students_assigned),
    0
  );

  return (
    <div className="room-allocation-page">
      <div className="room-allocation-heading">
        <div>
          <h2>Automated Room Allocation</h2>
          <p>
            Automatically assign examination rooms based on
            student strength and room availability.
          </p>
        </div>
      </div>

      {error && <div className="room-allocation-error">{error}</div>}
      {message && <div className="room-allocation-success">{message}</div>}

      <div className="room-allocation-panel">
        <label>Select Examination</label>

        <select
          value={selectedExam}
          onChange={handleExamChange}
        >
          <option value="">Choose an examination</option>

          {examinations.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.exam_name} - {exam.subject_code} -{' '}
              {String(exam.exam_date).slice(0, 10)}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleAllocation}
          disabled={!selectedExam || allocating || loading}
        >
          {allocating ? 'Allocating Rooms...' : 'Allocate Rooms Automatically'}
        </button>
      </div>

      {loading && <p>Loading data...</p>}

      {selectedExam && !loading && (
        <div className="room-allocation-results">
          <h3>Allocation Results</h3>

          {allocations.length === 0 ? (
            <p>No rooms allocated yet. Click the allocation button to start.</p>
          ) : (
            <>
              <div className="room-allocation-summary">
                <div>
                  <strong>{allocations.length}</strong>
                  <span>Rooms Assigned</span>
                </div>

                <div>
                  <strong>{totalStudents}</strong>
                  <span>Students Seated</span>
                </div>
              </div>

              <div className="room-allocation-table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Room</th>
                      <th>Building</th>
                      <th>Room Capacity</th>
                      <th>Students Assigned</th>
                    </tr>
                  </thead>

                  <tbody>
                    {allocations.map((room) => (
                      <tr key={room.id || room.room_id}>
                        <td>{room.room_number}</td>
                        <td>{room.building || '-'}</td>
                        <td>{room.capacity}</td>
                        <td>{room.students_assigned}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default RoomAllocation;
