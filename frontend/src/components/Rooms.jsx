
import { useEffect, useState } from 'react';
import {
  getRooms,
  addRoom,
  updateRoom,
  deleteRoom
} from '../services/roomService';
import './Rooms.css';

function Rooms() {
  const emptyForm = {
    room_number: '',
    building: '',
    room_type: 'Classroom',
    capacity: ''
  };

  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await getRooms();
      setRooms(result.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
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

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const data = {
        ...formData,
        capacity: Number(formData.capacity)
      };

      if (editingId) {
        await updateRoom(editingId, data);
        setMessage('Room updated successfully');
      } else {
        await addRoom(data);
        setMessage('Room added successfully');
      }

      resetForm();
      await loadRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save room');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (room) => {
    setFormData({
      room_number: room.room_number,
      building: room.building,
      room_type: room.room_type,
      capacity: String(room.capacity)
    });

    setEditingId(room.id);
    setError('');
    setMessage('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }

    try {
      setError('');
      setMessage('');

      await deleteRoom(id);

      setMessage('Room deleted successfully');

      if (editingId === id) {
        resetForm();
      }

      await loadRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete room');
    }
  };

  const totalCapacity = rooms.reduce(
    (total, room) => total + Number(room.capacity),
    0
  );

  return (
    <div className="rooms-page">
      <div className="rooms-heading">
        <div>
          <h2>Room Management</h2>
          <p>Add and manage examination rooms and their capacities.</p>
        </div>

        <div className="rooms-count">
          Total Rooms: {rooms.length}
          <br />
          Total Capacity: {totalCapacity}
        </div>
      </div>

      {message && <div className="rooms-success">{message}</div>}
      {error && <div className="rooms-error">{error}</div>}

      <div className="rooms-form-card">
        <h3>{editingId ? 'Edit Room' : 'Add New Room'}</h3>

        <form onSubmit={handleSubmit}>
          <div className="rooms-form-grid">
            <input
              name="room_number"
              placeholder="Room Number (e.g. A101)"
              value={formData.room_number}
              onChange={handleChange}
              required
            />

            <input
              name="building"
              placeholder="Building Name"
              value={formData.building}
              onChange={handleChange}
              required
            />

            <select
              name="room_type"
              value={formData.room_type}
              onChange={handleChange}
              required
            >
              <option value="Classroom">Classroom</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Seminar Hall">Seminar Hall</option>
              <option value="Examination Hall">Examination Hall</option>
            </select>

            <input
              type="number"
              name="capacity"
              placeholder="Seating Capacity"
              min="1"
              value={formData.capacity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="rooms-form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? 'Saving...'
                : editingId
                ? 'Update Room'
                : 'Add Room'}
            </button>

            {editingId && (
              <button
                type="button"
                className="rooms-cancel"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rooms-table-card">
        <h3>Registered Rooms</h3>

        {loading ? (
          <p>Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <p>No rooms added yet.</p>
        ) : (
          <div className="rooms-table-wrapper">
            <table className="rooms-table">
              <thead>
                <tr>
                  <th>Room Number</th>
                  <th>Building</th>
                  <th>Room Type</th>
                  <th>Capacity</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td>{room.room_number}</td>
                    <td>{room.building}</td>
                    <td>{room.room_type}</td>
                    <td>{room.capacity}</td>
                    <td>
                      <button
                        className="rooms-edit"
                        onClick={() => handleEdit(room)}
                      >
                        Edit
                      </button>

                      <button
                        className="rooms-delete"
                        onClick={() => handleDelete(room.id)}
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

export default Rooms;
