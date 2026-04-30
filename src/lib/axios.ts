import axios from 'axios';
import { store } from '@/store';
import { logout } from '@/store/slices/authSlice';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        store.dispatch(logout());
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } else if (error.response.status >= 500) {
        const { toast } = await import('sonner');
        toast.error('সার্ভারে সমস্যা হয়েছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
