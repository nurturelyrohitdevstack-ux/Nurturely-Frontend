import { create } from "zustand";

const getSavedRefreshToken = () => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("nurturely_rt");
  } catch (e) {
    return null;
  }
};

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  refreshToken: getSavedRefreshToken(),
  isInitialized: false,

  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setRefreshToken: (refreshToken) => {
    if (typeof window !== "undefined") {
      try {
        if (refreshToken) {
          localStorage.setItem("nurturely_rt", refreshToken);
        } else {
          localStorage.removeItem("nurturely_rt");
        }
      } catch (e) {}
    }
    set({ refreshToken });
  },
  setInitialized: (val) => set({ isInitialized: val }),

  login: ({ user, accessToken, refreshToken }) => {
    if (typeof window !== "undefined" && refreshToken) {
      try {
        localStorage.setItem("nurturely_rt", refreshToken);
      } catch (e) {}
    }
    set((prev) => ({
      user,
      accessToken,
      refreshToken: refreshToken || prev.refreshToken,
      isInitialized: true,
    }));
  },

  logout: () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("nurturely_rt");
      } catch (e) {}
    }
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isInitialized: true,
    });
  },
}));

export default useAuthStore;
