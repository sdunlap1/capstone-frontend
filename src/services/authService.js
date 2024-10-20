import axiosInstance from '../api/axiosInstance';

export const login = async (username, password) => {
  const response = await axiosInstance.post('/auth/login', { username, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);  // Store JWT for later use
  }
  return response.data;
};

export const signup = async (username, password, email) => {
  const response = await axiosInstance.post('/auth/signup', { username, password, email });
  return response.data;
};
