import { create } from 'zustand'

export type UserRole = 'CITIZEN' | 'ADMIN' | null

interface AuthState {
  user: {
    id: string;
    name: string;
    role: UserRole;
  } | null;
  isAuthenticated: boolean;
  login: (token: string, userData: { id: string; name: string; role: UserRole }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: (token, userData) => {
    // Note: Store token in secure cookie or localStorage here
    set({
      user: userData,
      isAuthenticated: true
    })
  },
  
  logout: () => {
    // Note: Clear token from secure cookie or localStorage here
    set({
      user: null,
      isAuthenticated: false
    })
  }
}))
