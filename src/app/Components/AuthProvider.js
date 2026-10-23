"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import useAuthStore from "@/store/authStore";
import PortalLoading from "./portal-ui/PortalLoading";

const PUBLIC_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

const checkIsPublic = (path) => {
  if (!path || path === "/") return true;
  return PUBLIC_ROUTES.some((route) => path.startsWith(route));
};

export default function AuthProvider({ children }) {
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  const pathname = usePathname();
  const isPublic = checkIsPublic(pathname);

  const [loading, setLoading] = useState(() => !isPublic && !isInitialized);
  const hasAttemptedRef = useRef(false);

  useEffect(() => {
    if (isInitialized || hasAttemptedRef.current) {
      return;
    }
    hasAttemptedRef.current = true;

    const refresh = async () => {
      try {
        const apiBase =
          process.env.API_URL ||
          process.env.NEXT_PUBLIC_API ||
          "http://localhost:5000/api";
        const res = await axios.post(
          `${apiBase}/auth/refresh-token`,
          {},
          {
            withCredentials: true,
            timeout: 3000,
          }
        );

        if (res.data?.user && res.data?.accessToken) {
          login({
            user: res.data.user,
            accessToken: res.data.accessToken,
          });
        } else {
          logout();
        }
      } catch (err) {
        logout();
      } finally {
        setInitialized(true);
        setLoading(false);
      }
    };

    refresh();
  }, [isInitialized, login, logout, setInitialized]);

  if (loading && !isPublic) {
    return <PortalLoading />;
  }

  return children;
}
