"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDashboardForUser } from "@/config/dashboard.config";
import { authService } from "@/services/auth/auth.service";

export default function DashboardIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const user = authService.getStoredUser();
    const roles = authService.getStoredRoles();
    router.replace(getDashboardForUser(roles, user).route);
  }, [router]);

  return null;
}
