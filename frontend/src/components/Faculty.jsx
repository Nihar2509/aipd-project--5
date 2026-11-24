
import { useEffect, useState } from 'react';
import {
  getFaculty,
  addFaculty,
  updateFaculty,
  deleteFaculty
} from '../services/facultyService';

import './Faculty.css';

function Faculty() {
  const [faculty, setFaculty] = useState([]);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    designation: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadFaculty = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await getFaculty();
      setFaculty(result.data);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to load faculty'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaculty();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      department: '',
      designation: ''
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setMessage('');

      if (editingId) {
        await updateFaculty(editingId, formData);
        setMessage('Faculty updated successfully');
      } else {
        await addFaculty(formData);
        setMessage('Faculty added successfully');
      }

      resetForm();
      await loadFaculty();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to save faculty'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      email: item.email,
      department: item.department,
      designation: item.designation
    });

    setEditingId(item.id);
    setMessage('');
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) {
      return;
    }

    try {
      setError('');
      setMessage('');

      await deleteFaculty(id);
      setMessage('Faculty deleted successfully');

      if (editingId === id) {
        resetForm();
      }

      await loadFaculty();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to delete faculty'
      );
    }
  };

  const departments = [
    'All',
    ...new Set(faculty.map((item) => item.department))
  ];

  const filteredFaculty = faculty.filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      item.name.toLowerCase().includes(searchText) ||
      item.email.toLowerCase().includes(searchText);

    const matchesDepartment =
      departmentFilter === 'All' ||
      item.department === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="faculty-page">
      <div className="faculty-heading">
        <div>
          <h2>Faculty Management</h2>
          <p>Manage university faculty members and their details.</p>
        </div>

        <div className="faculty-count">
          Total Faculty: {faculty.length}
        </div>
      </div>

      {message && <div className="faculty-success">{message}</div>}
      {error && <div className="faculty-error">{error}</div>}

      <div className="faculty-form-card">
        <h3>{editingId ? 'Edit Faculty' : 'Add New Faculty'}</h3>

        <form onSubmit={handleSubmit}>
          <div className="faculty-form-grid">
            <input
              type="text"
              name="name"
              placeholder="Faculty Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="department"
              placeholder="Department"
              value={formData.department}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="designation"
              placeholder="Designation"
              value={formData.designation}
              onChange={handleChange}
              required
            />
          </div>

          <div className="faculty-form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? 'Saving...'
                : editingId
                ? 'Update Faculty'
                : 'Add Faculty'}
            </button>

            {editingId && (
              <button
                type="button"
                className="faculty-cancel"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="faculty-table-card">
        <h3>Faculty Members</h3>

        <div className="faculty-filters">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            {departments.map((department) => (
              <option key={department} value={department}>
                {department === 'All' ? 'All Departments' : department}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p>Loading faculty members...</p>
        ) : filteredFaculty.length === 0 ? (
          <p>No matching faculty members found.</p>
        ) : (
          <div className="faculty-table-wrapper">
            <table className="faculty-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredFaculty.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>{item.department}</td>
                    <td>{item.designation}</td>
                    <td>
                      <button
                        className="faculty-edit"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>

                      <button
                        className="faculty-delete"
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

export default Faculty;
