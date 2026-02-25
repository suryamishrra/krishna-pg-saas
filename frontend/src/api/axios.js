import axios from 'axios';

const envBaseUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const normalizedBaseUrl = envBaseUrl
  ? envBaseUrl.endsWith('/api')
    ? envBaseUrl
    : `${envBaseUrl}/api`
  : 'http://localhost:3000/api';

const api = axios.create({
  baseURL: normalizedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const tenantId = localStorage.getItem('tenant_id');
    const tenantSlug = localStorage.getItem('tenant_slug');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (tenantId) {
      config.headers['x-tenant-id'] = tenantId;
    }

    if (tenantSlug) {
      config.headers['x-tenant-slug'] = tenantSlug;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || '';

    const isAuthFailure =
      status === 401 || (status === 403 && message.toLowerCase().includes('invalid or expired token'));

    if (isAuthFailure) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const isAuthPage = ['/login', '/register', '/onboarding'].includes(window.location.pathname);
      if (!isAuthPage) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
