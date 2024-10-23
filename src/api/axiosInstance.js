import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://10.0.4.23:3001";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Assuming you're storing JWT in localStorage
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
