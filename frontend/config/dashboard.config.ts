import { Building2, Globe2, Map, MapPinned, Shield, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AppRoleKey = "super-admin" | "admin-city" | "admin-subcity" | "admin-woreda" | "admin-zone";

export type DashboardDefinition = {
  key: AppRoleKey;
  roleName: string;
  title: string;
  subtitle: string;
  route: string;
  icon: LucideIcon;
};

export const roleHome: Record<AppRoleKey, string> = {
  "super-admin": "/dashboard/super-admin",
  "admin-city": "/dashboard/admin-city",
  "admin-subcity": "/dashboard/admin-subcity",
  "admin-woreda": "/dashboard/admin-woreda",
  "admin-zone": "/dashboard/admin-zone",
};

export const dashboardConfig: Record<AppRoleKey, DashboardDefinition> = {
  "super-admin": { key: "super-admin", roleName: "Super Admin", title: "Super Admin Dashboard", subtitle: "System-wide municipality administration.", route: roleHome["super-admin"], icon: Shield },
  "admin-city": { key: "admin-city", roleName: "City Admin", title: "City Admin Dashboard", subtitle: "City-level citizen, household, and reporting workspace.", route: roleHome["admin-city"], icon: Building2 },
  "admin-subcity": { key: "admin-subcity", roleName: "Subcity Admin", title: "Subcity Admin Dashboard", subtitle: "Subcity-level approval and oversight workspace.", route: roleHome["admin-subcity"], icon: Globe2 },
  "admin-woreda": { key: "admin-woreda", roleName: "Woreda Admin", title: "Woreda Admin Dashboard", subtitle: "Woreda-level validation and verification workspace.", route: roleHome["admin-woreda"], icon: Map },
  "admin-zone": { key: "admin-zone", roleName: "Zone Admin", title: "Zone Admin Dashboard", subtitle: "Zone-level citizen registration and household workspace.", route: roleHome["admin-zone"], icon: MapPinned },
};

export const dashboardList = Object.values(dashboardConfig);

export function normalizeRole(role?: string | null, adminLevel?: string | null): AppRoleKey {
  const value = String(role ?? "").toLowerCase().trim();
  const level = String(adminLevel ?? "").toLowerCase().trim();
  if (value.includes("super")) return "super-admin";
  if (level === "city") return "admin-city";
  if (level === "subcity") return "admin-subcity";
  if (level === "woreda") return "admin-woreda";
  if (level === "zone") return "admin-zone";
  return "admin-city";
}

export function getDashboardForRole(role?: string | null, adminLevel?: string | null) {
  return dashboardConfig[normalizeRole(role, adminLevel)];
}
