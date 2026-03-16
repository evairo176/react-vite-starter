// src/store/auth.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  roleId: number; // sesuaikan dengan backend-mu
  name?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  hydrated: boolean; // <-- ADD THIS
  login: (payload: { user: User; accessToken?: string | null }) => void;
  logout: () => void;
  setHydrated: (hydrated: boolean) => void; // <-- ADD THIS
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      hydrated: false, // <- default sebelum rehydrate selesai

      setHydrated: (v) => set({ hydrated: v }),

      login: ({ user, accessToken }) =>
        set({
          user,
          accessToken: accessToken ?? null,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage",

      // setelah rehydrate selesai → hydrated = true
      onRehydrateStorage: () => (state) => {
        if (state) state.setHydrated(true);
      },

      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
