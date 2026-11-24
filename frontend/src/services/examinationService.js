
import api from './api';

export const getExaminations = async () => {
  const response = await api.get('/examinations');
  return response.data;
};

export const addExamination = async (data) => {
  const response = await api.post('/examinations', data);
  return response.data;
};

export const updateExamination = async (id, data) => {
  const response = await api.put(`/examinations/${id}`, data);
  return response.data;
};

export const deleteExamination = async (id) => {
  const response = await api.delete(`/examinations/${id}`);
  return response.data;
};