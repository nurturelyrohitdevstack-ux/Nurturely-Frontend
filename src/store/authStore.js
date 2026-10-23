import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isInitialized: false,

  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setInitialized: (val) => set({ isInitialized: val }),

  login: ({ user, accessToken }) =>
    set({
      user,
      accessToken,
      isInitialized: true,
    }),

  logout: () =>
    set({
      user: null,
      accessToken: null,
      isInitialized: true,
    }),
}));

export default useAuthStore;
