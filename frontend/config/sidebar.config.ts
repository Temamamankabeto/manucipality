import { ClipboardCheck, FilePlus2, LayoutDashboard, MapPinned, ScrollText, Shield, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { dashboardConfig, getDashboardForUser, normalizeRole, type AppRoleKey, type AuthUserLike } from "@/config/dashboard.config";

export type SidebarChildItem = {
  label: string;
  href: string;
  permission?: string;
};

export type SidebarItem = {
  label: string;
  href?: string;
  icon: LucideIcon;
  permission?: string;
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

const s = (title: string, items: SidebarItem[]): SidebarSection => ({ title, items });

const citizenChildren: SidebarChildItem[] = [
  { label: "Citizen Registry", href: "/dashboard/citizens", permission: "citizens.read" },
  { label: "Register Citizen", href: "/dashboard/citizens/create", permission: "citizens.create" },
];

const userChildren: SidebarChildItem[] = [
  { label: "Users", href: "/dashboard/users", permission: "users.read" },
  { label: "Roles", href: "/dashboard/users/roles", permission: "roles.read" },
  { label: "Permissions", href: "/dashboard/users/permissions", permission: "permissions.read" },
];

const locationChildren: SidebarChildItem[] = [
  { label: "City / Subcity / Woreda / Zone", href: "/dashboard/locations", permission: "offices.read" },
];

export function buildSidebar(role: AppRoleKey): RoleSidebar {
  const dashboard = dashboardConfig[role];
  return {
    title: dashboard.roleName,
    icon: dashboard.icon,
    sections: [
      s("Main", [
        { label: "Dashboard", href: dashboard.route, icon: LayoutDashboard },
      ]),
      s("Citizen Management", [
        { label: "Registration", icon: FilePlus2, children: citizenChildren },
      ]),
      s("Administration", [
        { label: "Location Hierarchy", icon: MapPinned, children: locationChildren },
        { label: "User Management", icon: Users, children: userChildren },
        { label: "Audit Logs", href: "/dashboard/audit-logs", icon: ScrollText, permission: "audit.read" },
      ]),
      s("Workflow", [
        { label: "Verification", href: "/dashboard/citizens/verification", icon: ClipboardCheck, permission: "citizens.verify" },
        { label: "System Security", href: "/dashboard/security", icon: Shield, permission: "permissions.read" },
      ]),
    ],
  };
}

export function getSidebarForUser(roles: string[] = [], user?: AuthUserLike | null): RoleSidebar {
  const dashboard = getDashboardForUser(roles, user);
  return buildSidebar(dashboard.key);
}

export function getSidebarForRole(role?: string | null, user?: AuthUserLike | null): RoleSidebar {
  return buildSidebar(normalizeRole(role, user));
}

export function filterSidebarByPermissions(roleSidebar: RoleSidebar, permissions: string[] = []) {
  return roleSidebar.sections
    .map((section) => ({
      ...section,
      items: section.items
        .map((item) => {
          const children = item.children?.filter((child) => !child.permission || permissions.includes(child.permission));
          if (item.children) return children?.length ? { ...item, children } : null;
          return !item.permission || permissions.includes(item.permission) ? item : null;
        })
        .filter(Boolean) as SidebarItem[],
    }))
    .filter((section) => section.items.length > 0);
}
