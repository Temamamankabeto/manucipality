import { BarChart3, Building2, LayoutDashboard, Map, ShieldCheck, UserCog } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AdminLevel } from "@/types/user-management/user.type";

export type AppRoleKey = "super-admin" | "admin-city" | "admin-subcity" | "admin-woreda" | "admin-zone";

export type DashboardDefinition = {
  key: AppRoleKey;
  roleName: string;
  title: string;
  subtitle: string;
  route: string;
  icon: LucideIcon;
  metrics: Array<{ label: string; value: string; description: string }>;
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
    subtitle: "System-wide control for users, RBAC, offices, audit, and all municipality modules.",
    route: roleHome["super-admin"],
    icon: ShieldCheck,
    metrics: [
      { label: "Total Users", value: "System", description: "All users across every administrative level" },
      { label: "Administrative Levels", value: "4", description: "City, Subcity, Woreda, and Zone" },
      { label: "RBAC Roles", value: "2", description: "Super Admin and Admin" },
      { label: "Audit", value: "Enabled", description: "Track user and workflow actions" },
    ],
  },
  "admin-city": {
    key: "admin-city",
    roleName: "Admin • City level",
    title: "City Admin Dashboard",
    subtitle: "City-wide workspace for Adama administration and oversight.",
    route: roleHome["admin-city"],
    icon: Building2,
    metrics: [
      { label: "Scope", value: "City", description: "Access across all subcities, woredas, and zones" },
      { label: "Users", value: "Managed", description: "Create and manage scoped administrators" },
      { label: "Citizens", value: "Overview", description: "Monitor registration workflow city-wide" },
      { label: "Reports", value: "City", description: "Population and operational reporting" },
    ],
  },
  "admin-subcity": {
    key: "admin-subcity",
    roleName: "Admin • Subcity level",
    title: "Subcity Admin Dashboard",
    subtitle: "Subcity-level workspace for validations, users, and citizen workflow follow-up.",
    route: roleHome["admin-subcity"],
    icon: Map,
    metrics: [
      { label: "Scope", value: "Subcity", description: "Access limited to assigned subcity" },
      { label: "Woredas", value: "Assigned", description: "Manage child woreda and zone administrators" },
      { label: "Approvals", value: "Queue", description: "Review workflow items from woredas" },
      { label: "Reports", value: "Subcity", description: "Local citizen and household reports" },
    ],
  },
  "admin-woreda": {
    key: "admin-woreda",
    roleName: "Admin • Woreda level",
    title: "Woreda Admin Dashboard",
    subtitle: "Woreda-level workspace for registration validation and zone administration.",
    route: roleHome["admin-woreda"],
    icon: UserCog,
    metrics: [
      { label: "Scope", value: "Woreda", description: "Access limited to assigned woreda" },
      { label: "Zones", value: "Assigned", description: "Manage zone administrators and local users" },
      { label: "Verification", value: "Active", description: "Validate citizen data and documents" },
      { label: "Duplicates", value: "Monitor", description: "Review duplicate alerts in your woreda" },
    ],
  },
  "admin-zone": {
    key: "admin-zone",
    roleName: "Admin • Zone level",
    title: "Zone Admin Dashboard",
    subtitle: "Zone-level workspace for citizen registration, profiling, and local updates.",
    route: roleHome["admin-zone"],
    icon: LayoutDashboard,
    metrics: [
      { label: "Scope", value: "Zone", description: "Access limited to assigned zone" },
      { label: "Registration", value: "Local", description: "Register and update local citizen profiles" },
      { label: "Households", value: "Local", description: "Maintain household relationships" },
      { label: "Notifications", value: "Local", description: "Send registration and update alerts" },
    ],
  },
};

export const dashboardList = Object.values(dashboardConfig);

export function normalizeRole(role?: string | null, adminLevel?: AdminLevel | string | null): AppRoleKey {
  const value = String(role ?? "").toLowerCase().replace(/&/g, "and").replace(/_/g, " ").replace(/-/g, " ").trim();
  const level = String(adminLevel ?? "").toLowerCase().replace(/_/g, " ").replace(/-/g, " ").trim();

  if (value.includes("super") || value.includes("system admin") || value.includes("general admin")) return "super-admin";
  if (value.includes("city admin") || value.includes("city dmin") || level === "city") return "admin-city";
  if (value.includes("subcity") || value.includes("sub city") || level === "subcity") return "admin-subcity";
  if (value.includes("woreda") || level === "woreda") return "admin-woreda";
  if (value.includes("zone") || level === "zone") return "admin-zone";
  if (value === "admin") return "admin-city";

  return "super-admin";
}

export function getDashboardForRole(role?: string | null, adminLevel?: AdminLevel | string | null) {
  return dashboardConfig[normalizeRole(role, adminLevel)];
}

export function getRoleFromRoute(role?: string | null): DashboardDefinition | null {
  const key = String(role ?? "") as AppRoleKey;
  return dashboardConfig[key] ?? null;
}
