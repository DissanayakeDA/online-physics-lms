import { create } from 'zustand';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'student' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lms_token', token);
      localStorage.setItem('lms_user', JSON.stringify(user));
    }
    set({ user, token, isLoading: false });
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
    }
    set({ user: null, token: null, isLoading: false });
  },

  initAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('lms_token');
      const userStr = localStorage.getItem('lms_user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ user, token, isLoading: false });
          return;
        } catch {}
      }
    }
    set({ isLoading: false });
  },
}));
