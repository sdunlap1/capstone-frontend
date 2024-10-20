import axiosInstance from '../api/axiosInstance';

export const getTasks = async () => {
  const response = await axiosInstance.get('/tasks');
  return response.data;
};
