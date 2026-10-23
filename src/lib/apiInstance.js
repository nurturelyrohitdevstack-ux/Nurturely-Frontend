import axios from "axios";
import useAuthStore from "@/store/authStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 15000,
});

// Request interceptor: injects bearer token if in memory
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: automatically handles token expiration & refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 403 &&
      error.response?.data?.code === "TOKEN-EXPIRE" &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh-token"
    ) {
      originalRequest._retry = true;
      const login = useAuthStore.getState().login;
      const logout = useAuthStore.getState().logout;

      try {
        const res = await api.post("/auth/refresh-token");
        login({
          user: res.data.user,
          accessToken: res.data.accessToken,
        });

        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        logout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
