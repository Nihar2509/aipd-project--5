
import api from './api';

export const getRooms = async () => {
  const response = await api.get('/rooms');
  return response.data;
};

export const addRoom = async (data) => {
  const response = await api.post('/rooms', data);
  return response.data;
};

export const updateRoom = async (id, data) => {
  const response = await api.put(`/rooms/${id}`, data);
  return response.data;
};

export const deleteRoom = async (id) => {
  const response = await api.delete(`/rooms/${id}`);
  return response.data;
};
