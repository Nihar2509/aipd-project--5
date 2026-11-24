
import api from './api';

export const getAvailability = async () => {
  const response = await api.get('/faculty-availability');
  return response.data;
};

export const addAvailability = async (data) => {
  const response = await api.post('/faculty-availability', data);
  return response.data;
};

export const updateAvailability = async (id, data) => {
  const response = await api.put(`/faculty-availability/${id}`, data);
  return response.data;
};

export const deleteAvailability = async (id) => {
  const response = await api.delete(`/faculty-availability/${id}`);
  return response.data;
};
