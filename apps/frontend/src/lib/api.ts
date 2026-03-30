import axios from 'axios';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' ? '/api' : 'http://127.0.0.1:3001/api');

/**
 * URL for files served under `/uploads` (thumbnails, payment slips).
 * With same-origin `/api` + Next rewrites, uploads use `/uploads/...` on the app host.
 */
export function getUploadsUrl(
  filename: string | null | undefined,
): string | null {
  if (!filename) return null;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
  if (apiBase.startsWith('http')) {
    const origin = apiBase.replace(/\/api\/?$/, '');
    return `${origin}/uploads/${filename}`;
  }
  return `/uploads/${filename}`;
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('lms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response && typeof window !== 'undefined') {
      console.warn(
        '[api] Network error — check that the backend is running and reachable. API base:',
        API_URL,
      );
    }
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  },
);

export default api;
