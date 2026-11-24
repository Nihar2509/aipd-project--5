
import api from './api';

export const checkServer = async () => {
  const response = await api.get('/health');
  return response.data;
};
