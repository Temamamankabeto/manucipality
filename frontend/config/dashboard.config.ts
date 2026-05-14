import { Building2, MapPinned, Shield, Users } from "lucide-react";
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
  "super-admin": {
    key: "super-admin",
    roleName: "Super Admin",
    title: "Super Admin Dashboard",
    subtitle: "System-wide municipality administration, RBAC, locations, citizen workflow and reports.",
    route: roleHome["super-admin"],
    icon: Shield,
  },
  "admin-city": {
    key: "admin-city",
    roleName: "City Admin",
    title: "City Admin Dashboard",
    subtitle: "City-level citizen approval, unique ID generation and activation.",
    route: roleHome["admin-city"],
    icon: Building2,
  },
  "admin-subcity": {
    key: "admin-subcity",
    roleName: "Subcity Admin",
    title: "Subcity Admin Dashboard",
    subtitle: "Subcity-level final approval and workflow monitoring.",
    route: roleHome["admin-subcity"],
    icon: MapPinned,
  },
  "admin-woreda": {
    key: "admin-woreda",
    roleName: "Woreda Admin",
    title: "Woreda Admin Dashboard",
    subtitle: "Woreda document verification, data validation and duplicate detection.",
    route: roleHome["admin-woreda"],
    icon: MapPinned,
  },
  "admin-zone": {
    key: "admin-zone",
    roleName: "Zone Admin",
    title: "Zone Admin Dashboard",
    subtitle: "Zone-level citizen registration and submitted applications.",
    route: roleHome["admin-zone"],
    icon: Users,
  },
};

export const dashboardList = Object.values(dashboardConfig);

export function normalizeRole(role?: string | null, adminLevel?: string | null): AppRoleKey {
  const value = String(role ?? "").toLowerCase().replace(/_/g, " ").replace(/-/g, " ").trim();
  const level = String(adminLevel ?? "").toLowerCase().replace(/_/g, " ").replace(/-/g, " ").trim();

  if (value.includes("super")) return "super-admin";
  if (level.includes("city")) return "admin-city";
  if (level.includes("subcity") || level.includes("sub city")) return "admin-subcity";
  if (level.includes("woreda")) return "admin-woreda";
  if (level.includes("zone")) return "admin-zone";
  if (value.includes("admin")) return "admin-zone";

  return "super-admin";
}

export function getDashboardForRole(role?: string | null, adminLevel?: string | null) {
  return dashboardConfig[normalizeRole(role, adminLevel)];
}
