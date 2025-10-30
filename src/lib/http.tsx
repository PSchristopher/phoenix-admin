import axios, { AxiosError, AxiosInstance } from 'axios';
import { Store } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { logout } from '@/store/slices/adminSlice';

// ----------------------------
// Store injection
// ----------------------------
let store: Store;

export const injectStore = (_store: Store) => {
  store = _store;
};

// ----------------------------
// Base URL from environment
// ----------------------------
const BASE_URL =
  import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, '') ||
  'http://localhost:5000';

// ----------------------------
// Public Axios instance (no auth)
// ----------------------------
export const publicApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-api-key': 'reqres-free-v1', // optional global header
  },
});

// ----------------------------
// Authenticated Axios instance
// ----------------------------
export const privateApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-api-key': 'reqres-free-v1',
  },
});

// ----------------------------
// Request interceptor (auth)
// ----------------------------
privateApi.interceptors.request.use(
  (config) => {
    const state: RootState = store.getState();
    const token = state.admin?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ----------------------------
// Response interceptor (401 handling)
// ----------------------------
privateApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error?.response?.status === 401) {
      // Token expired or unauthorized → logout user
      if (store) store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

// ----------------------------
// Optional: Default export (authenticated by default)
// ----------------------------
export default privateApi;
