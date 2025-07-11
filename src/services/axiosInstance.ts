import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../../constants';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const auth = localStorage.getItem('meme-app-auth');
  const token = auth ? JSON.parse(auth).token : false;
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api; 