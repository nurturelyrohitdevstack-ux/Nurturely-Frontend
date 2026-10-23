"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import PortalLoading from "@/app/Components/portal-ui/PortalLoading";

export default function ProtectedRoutes({ children, roles = [] }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    if (!isInitialized) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [user, isInitialized, roles, router]);

  if (!isInitialized) {
    return <PortalLoading message="Verifying session..." />;
  }

  if (!user) {
    return null;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return null;
  }

  return children;
}
