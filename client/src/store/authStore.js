import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/axios';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({
            user: data.data.user,
            token: data.data.token,
            isLoading: false,
            error: null,
          });
          return data.data;
        } catch (err) {
          const message =
            err.response?.data?.message || 'Login failed. Please try again.';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/register', {
            name,
            email,
            password,
          });
          set({
            user: data.data.user,
            token: data.data.token,
            isLoading: false,
            error: null,
          });
          return data.data;
        } catch (err) {
          const message =
            err.response?.data?.message ||
            'Registration failed. Please try again.';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      logout: () => {
        set({ user: null, token: null });
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },

      fetchUser: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.data });
        } catch {
          get().logout();
        }
      },

      clearError: () => set({ error: null }),

      get isAuthenticated() {
        return !!get().token;
      },
    }),
    {
      name: 'agentflow-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);

export default useAuthStore;
