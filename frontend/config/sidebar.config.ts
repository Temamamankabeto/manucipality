import { BarChart3, Bell, ClipboardList, FilePlus2, FileText, KeyRound, LayoutDashboard, MapPinned, Settings, ShieldCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { dashboardConfig, normalizeRole, type AppRoleKey } from "@/config/dashboard.config";
import type { AdminLevel } from "@/types/user-management/user.type";

export type SidebarPermission = string | string[];

export type SidebarChildItem = {
  label: string;
  href: string;
  permission?: SidebarPermission;
};

export type SidebarItem = {
  label: string;
  href?: string;
  icon: LucideIcon;
  permission?: SidebarPermission;
  children?: SidebarChildItem[];
};

export type SidebarSection = {
  title: string;
  items: SidebarItem[];
};

export type RoleSidebar = {
  title: string;
  icon: LucideIcon;
  sections: SidebarSection[];
};

const section = (title: string, items: SidebarItem[]): SidebarSection => ({ title, items });

const dashboardItem = (role: AppRoleKey): SidebarItem => ({
  label: "Dashboard",
  href: dashboardConfig[role].route,
  icon: LayoutDashboard,
  permission: "dashboard.view",
});

const userChildren: SidebarChildItem[] = [
  { label: "Users", href: "/dashboard/users", permission: ["users.view", "users.read"] },
  { label: "Roles", href: "/dashboard/users/roles", permission: ["roles.view", "roles.read"] },
  { label: "Permissions", href: "/dashboard/users/permissions", permission: ["permissions.view", "permissions.read"] },
];

const locationChildren: SidebarChildItem[] = [
  { label: "City / Subcity / Woreda / Zone", href: "/dashboard/locations", permission: ["offices.view", "offices.read"] },
];

const citizenChildren: SidebarChildItem[] = [
  { label: "Citizen Registry", href: "/dashboard/citizens", permission: ["citizens.view", "citizens.read"] },
  { label: "Register Citizen", href: "/dashboard/citizens/create", permission: "citizens.create" },
  { label: "Verification Queue", href: "/dashboard/citizens/verification", permission: "citizens.verify" },
  { label: "Citizen Reports", href: "/dashboard/reports/citizens", permission: "reports.view" },
];

const adminSections = (role: AppRoleKey): SidebarSection[] => [
  section("Main", [dashboardItem(role)]),
  section("Citizen Management", [
    { label: "Registration", icon: FilePlus2, children: citizenChildren },
  ]),
  section("Administration", [
    { label: "Location Hierarchy", icon: MapPinned, children: locationChildren },
    { label: "User Management", icon: Users, children: userChildren },
  ]),
  section("Operations", [
    { label: "Audit Logs", href: "/dashboard/audit-logs", icon: FileText, permission: ["audit.view", "audit.read"] },
    { label: "Reports", href: "/dashboard/reports", icon: BarChart3, permission: "reports.view" },
    { label: "Notifications", href: "/dashboard/notifications", icon: Bell, permission: "notifications.view" },
  ]),
];

export const sidebarConfig: Record<AppRoleKey, RoleSidebar> = {
  "super-admin": {
    title: dashboardConfig["super-admin"].roleName,
    icon: ShieldCheck,
    sections: [
      ...adminSections("super-admin"),
      section("System", [
        { label: "RBAC Settings", href: "/dashboard/users/roles", icon: KeyRound, permission: "roles.assign-permissions" },
        { label: "System Settings", href: "/dashboard/settings", icon: Settings, permission: ["roles.update", "permissions.update"] },
      ]),
    ],
  },
  "admin-city": { title: dashboardConfig["admin-city"].roleName, icon: dashboardConfig["admin-city"].icon, sections: adminSections("admin-city") },
  "admin-subcity": { title: dashboardConfig["admin-subcity"].roleName, icon: dashboardConfig["admin-subcity"].icon, sections: adminSections("admin-subcity") },
  "admin-woreda": { title: dashboardConfig["admin-woreda"].roleName, icon: dashboardConfig["admin-woreda"].icon, sections: adminSections("admin-woreda") },
  "admin-zone": { title: dashboardConfig["admin-zone"].roleName, icon: dashboardConfig["admin-zone"].icon, sections: adminSections("admin-zone") },
};

export function getSidebarForRole(role?: string | null, adminLevel?: AdminLevel | string | null): RoleSidebar {
  return sidebarConfig[normalizeRole(role, adminLevel)];
}

export function filterSidebarByPermissions(roleSidebar: RoleSidebar, permissions: string[] = []) {
  const hasPermission = (permission?: SidebarPermission) => {
    if (!permission) return true;
    if (Array.isArray(permission)) return permission.some((item) => permissions.includes(item));
    return permissions.includes(permission);
  };

  return roleSidebar.sections
    .map((currentSection) => ({
      ...currentSection,
      items: currentSection.items
        .map((item) => {
          const children = item.children?.filter((child) => hasPermission(child.permission));

          if (item.children) {
            return children?.length ? { ...item, children } : null;
          }

          return hasPermission(item.permission) ? item : null;
        })
        .filter(Boolean) as SidebarItem[],
    }))
    .filter((currentSection) => currentSection.items.length > 0);
}
