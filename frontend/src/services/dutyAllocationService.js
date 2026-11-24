
import api from './api';

export const generateDutyAllocation = async (examinationId) => {
  const response = await api.post(
    `/duty-allocations/${examinationId}/generate`
  );

  return response.data;
};

export const getDutyAllocations = async (examinationId) => {
  const response = await api.get(
    `/duty-allocations/${examinationId}`
  );

  return response.data;
};
