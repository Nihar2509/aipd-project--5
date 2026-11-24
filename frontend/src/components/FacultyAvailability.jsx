
import { useEffect, useState } from 'react';
import {
  getAvailability,
  addAvailability,
  updateAvailability,
  deleteAvailability
} from '../services/facultyAvailabilityService';
import { getFaculty } from '../services/facultyService';
import './FacultyAvailability.css';

function FacultyAvailability() {
  const [records, setRecords] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    faculty_id: '',
    availability_date: '',
    start_time: '',
    end_time: '',
    status: 'Available',
    reason: ''
  };

  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [availabilityData, facultyData] = await Promise.all([
        getAvailability(),
        getFaculty()
      ]);

      setRecords(availabilityData.data || []);
      setFaculty(facultyData.data || []);
    } catch (err) {
      setError('Unable to load faculty availability.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (form.start_time >= form.end_time) {
      setError('End time must be after start time.');
      return;
    }

    try {
      if (editingId) {
        await updateAvailability(editingId, form);
        setMessage('Availability updated successfully.');
      } else {
        await addAvailability(form);
        setMessage('Availability added successfully.');
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save availability.');
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);

    setForm({
      faculty_id: String(record.faculty_id),
      availability_date: String(record.availability_date).slice(0, 10),
      start_time: String(record.start_time).slice(0, 5),
      end_time: String(record.end_time).slice(0, 5),
      status: record.status,
      reason: record.reason || ''
    });

    setMessage('');
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this availability record?')) return;

    try {
      await deleteAvailability(id);
      setMessage('Availability deleted successfully.');

      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }

      await loadData();
    } catch (err) {
      setError('Unable to delete availability.');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setMessage('');
  };

  return (
    <div className="availability-page">
      <div className="availability-heading">
        <div>
          <h2>Faculty Availability</h2>
          <p>Manage faculty working hours, unavailability and leave.</p>
        </div>
        <div className="availability-count">
          {records.length} Records
        </div>
      </div>

      {error && <div className="availability-error">{error}</div>}
      {message && <div className="availability-success">{message}</div>}

      <div className="availability-layout">
        <form className="availability-form" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Update Availability' : 'Add Availability'}</h3>

          <label>Faculty Member</label>
          <select
            name="faculty_id"
            value={form.faculty_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Faculty</option>
            {faculty.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name} - {person.department}
              </option>
            ))}
          </select>

          <label>Date</label>
          <input
            type="date"
            name="availability_date"
            value={form.availability_date}
            onChange={handleChange}
            required
          />

          <div className="availability-time-row">
            <div>
              <label>Start Time</label>
              <input
                type="time"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>End Time</label>
              <input
                type="time"
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <label>Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
            <option value="Leave">Leave</option>
          </select>

          <label>Reason (Optional)</label>
          <input
            type="text"
            name="reason"
            value={form.reason}
            onChange={handleChange}
            placeholder="Enter reason"
          />

          <div className="availability-actions">
            <button type="submit">
              {editingId ? 'Update Record' : 'Add Record'}
            </button>

            {editingId && (
              <button type="button" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="availability-list">
          <h3>Availability Records</h3>

          {loading ? (
            <p>Loading records...</p>
          ) : records.length === 0 ? (
            <p>No availability records found.</p>
          ) : (
            <div className="availability-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Faculty</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td>{record.faculty_name}</td>
                      <td>
                        {String(record.availability_date).slice(0, 10)}
                      </td>
                      <td>
                        {String(record.start_time).slice(0, 5)} -{' '}
                        {String(record.end_time).slice(0, 5)}
                      </td>
                      <td>
                        <span className={`availability-status ${record.status.toLowerCase()}`}>
                          {record.status}
                        </span>
                      </td>
                      <td>{record.reason || '-'}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleEdit(record)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(record.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FacultyAvailability;
