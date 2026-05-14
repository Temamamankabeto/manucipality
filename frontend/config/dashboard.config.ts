import { Building2, Landmark, LayoutDashboard, Map, MapPinned, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AppRoleKey = "super-admin" | "admin-city" | "admin-subcity" | "admin-woreda" | "admin-zone";

export type AuthUserLike = {
  role?: string;
  roles?: string[];
  admin_level?: string | null;
  office?: { name?: string; type?: string } | null;
};

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
    subtitle: "System-wide municipality administration, RBAC, offices, users, and citizen registration oversight.",
    route: roleHome["super-admin"],
    icon: ShieldCheck,
  },
  "admin-city": {
    key: "admin-city",
    roleName: "Admin · City Level",
    title: "City Admin Dashboard",
    subtitle: "City-level citizen registration monitoring and administrative oversight.",
    route: roleHome["admin-city"],
    icon: Landmark,
  },
  "admin-subcity": {
    key: "admin-subcity",
    roleName: "Admin · Subcity Level",
    title: "Subcity Admin Dashboard",
    subtitle: "Subcity-scoped citizen registration management.",
    route: roleHome["admin-subcity"],
    icon: Building2,
  },
  "admin-woreda": {
    key: "admin-woreda",
    roleName: "Admin · Woreda Level",
    title: "Woreda Admin Dashboard",
    subtitle: "Woreda-scoped citizen registration and document intake.",
    route: roleHome["admin-woreda"],
    icon: Map,
  },
  "admin-zone": {
    key: "admin-zone",
    roleName: "Admin · Zone Level",
    title: "Zone Admin Dashboard",
    subtitle: "Zone-level citizen draft creation, updates, and submission.",
    route: roleHome["admin-zone"],
    icon: MapPinned,
  },
};

export const dashboardList = Object.values(dashboardConfig);

export function normalizeRole(role?: string | null, user?: AuthUserLike | null): AppRoleKey {
  const value = String(role ?? "").toLowerCase().replace(/_/g, " ").replace(/-/g, " ").trim();

  if (value.includes("super")) return "super-admin";

  const level = String(user?.admin_level ?? "city").toLowerCase();
  if (level.includes("zone")) return "admin-zone";
  if (level.includes("woreda")) return "admin-woreda";
  if (level.includes("subcity") || level.includes("sub city")) return "admin-subcity";

  return "admin-city";
}

export function getDashboardForRole(role?: string | null, user?: AuthUserLike | null) {
  return dashboardConfig[normalizeRole(role, user)];
}

export function getDashboardForUser(roles: string[] = [], user?: AuthUserLike | null) {
  return getDashboardForRole(roles[0] ?? user?.role ?? "Admin", user);
}

export const defaultDashboardIcon = LayoutDashboard;
