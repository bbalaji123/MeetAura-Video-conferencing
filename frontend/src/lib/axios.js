import axios from 'axios';

// Use network IP for cross-device access - automatically uses current host
const API_HOST = window.location.hostname;

export const axiosInstance = axios.create({
  baseURL: `http://${API_HOST}:4000/api`,
  withCredentials: true,
});