
import api from './api';

export const allocateExamRooms = async (examinationId) => {
  const response = await api.post(
    `/room-allocations/${examinationId}/allocate`
  );

  return response.data;
};

export const getRoomAllocations = async (examinationId) => {
  const response = await api.get(
    `/room-allocations/${examinationId}`
  );

  return response.data;
};
