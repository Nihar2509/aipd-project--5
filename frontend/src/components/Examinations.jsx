
import { useEffect, useState } from 'react';
import {
  getExaminations,
  addExamination,
  updateExamination,
  deleteExamination
} from '../services/examinationService';
import './Examinations.css';

function Examinations() {
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const emptyForm = {
    exam_name: '',
    subject_code: '',
    subject_name: '',
    department: '',
    semester: '',
    exam_date: '',
    start_time: '',
    end_time: '',
    total_students: ''
  };

  const [formData, setFormData] = useState(emptyForm);

  const loadExaminations = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await getExaminations();
      setExaminations(result.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to load examinations'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExaminations();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.start_time >= formData.end_time) {
      setError('End time must be after start time');
      return;
    }

    if (
      formData.total_students === '' ||
      Number(formData.total_students) <= 0
    ) {
      setError('Enter a valid total number of students');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const data = {
        ...formData,
        semester: Number(formData.semester),
        total_students: Number(formData.total_students)
      };

      if (editingId) {
        await updateExamination(editingId, data);
        setMessage('Examination updated successfully');
      } else {
        await addExamination(data);
        setMessage('Examination added successfully');
      }

      resetForm();
      await loadExaminations();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to save examination'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      exam_name: item.exam_name,
      subject_code: item.subject_code,
      subject_name: item.subject_name,
      department: item.department,
      semester: String(item.semester),
      exam_date: String(item.exam_date).split('T')[0],
      start_time: item.start_time.slice(0, 5),
      end_time: item.end_time.slice(0, 5),
      total_students: String(item.total_students || '')
    });

    setEditingId(item.id);
    setError('');
    setMessage('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this examination?')) {
      return;
    }

    try {
      setError('');
      setMessage('');

      await deleteExamination(id);

      setMessage('Examination deleted successfully');

      if (editingId === id) {
        resetForm();
      }

      await loadExaminations();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to delete examination'
      );
    }
  };

  return (
    <div className="examination-page">
      <div className="examination-heading">
        <div>
          <h2>Examination Management</h2>
          <p>Create and manage university examinations.</p>
        </div>

        <div className="examination-count">
          Total Exams: {examinations.length}
        </div>
      </div>

      {message && (
        <div className="examination-success">{message}</div>
      )}

      {error && (
        <div className="examination-error">{error}</div>
      )}

      <div className="examination-form-card">
        <h3>{editingId ? 'Edit Examination' : 'Add New Examination'}</h3>

        <form onSubmit={handleSubmit}>
          <div className="examination-form-grid">
            <input
              name="exam_name"
              placeholder="Exam Name"
              value={formData.exam_name}
              onChange={handleChange}
              required
            />

            <input
              name="subject_code"
              placeholder="Subject Code"
              value={formData.subject_code}
              onChange={handleChange}
              required
            />

            <input
              name="subject_name"
              placeholder="Subject Name"
              value={formData.subject_name}
              onChange={handleChange}
              required
            />

            <input
              name="department"
              placeholder="Department"
              value={formData.department}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="semester"
              placeholder="Semester"
              min="1"
              max="12"
              value={formData.semester}
              onChange={handleChange}
              required
            />

            <input
              type="date"
              name="exam_date"
              value={formData.exam_date}
              onChange={handleChange}
              required
            />

            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              required
            />

            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="total_students"
              placeholder="Total Students"
              min="1"
              value={formData.total_students}
              onChange={handleChange}
              required
            />
          </div>

          <div className="examination-form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? 'Saving...'
                : editingId
                ? 'Update Examination'
                : 'Add Examination'}
            </button>

            {editingId && (
              <button
                type="button"
                className="examination-cancel"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="examination-table-card">
        <h3>Examination List</h3>

        {loading ? (
          <p>Loading examinations...</p>
        ) : examinations.length === 0 ? (
          <p>No examinations added yet.</p>
        ) : (
          <div className="examination-table-wrapper">
            <table className="examination-table">
              <thead>
                <tr>
                  <th>Exam Name</th>
                  <th>Subject</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Students</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {examinations.map((item) => (
                  <tr key={item.id}>
                    <td>{item.exam_name}</td>
                    <td>
                      {item.subject_code} - {item.subject_name}
                    </td>
                    <td>{item.department}</td>
                    <td>{item.semester}</td>
                    <td>
                      {new Date(item.exam_date).toLocaleDateString()}
                    </td>
                    <td>
                      {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
                    </td>
                    <td>{item.total_students}</td>
                    <td>
                      <button
                        className="examination-edit"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>

                      <button
                        className="examination-delete"
                        onClick={() => handleDelete(item.id)}
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
  );
}

export default Examinations;
