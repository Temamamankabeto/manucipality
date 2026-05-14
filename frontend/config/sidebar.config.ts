import { BarChart3, Bell, ClipboardCheck, Flag, Home, IdCard, LayoutDashboard, MapPinned, Shield, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { dashboardConfig, normalizeRole, type AppRoleKey } from "@/config/dashboard.config";

export type SidebarChildItem = { label: string; href: string; permission?: string };
export type SidebarItem = { label: string; href?: string; icon: LucideIcon; permission?: string; children?: SidebarChildItem[] };
export type SidebarSection = { title: string; items: SidebarItem[] };
export type RoleSidebar = { title: string; icon: LucideIcon; sections: SidebarSection[] };

const mainMenu: SidebarSection[] = [
  { title: "Main", items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] },
  { title: "Administration", items: [
    { label: "User Management", icon: Users, children: [
      { label: "Users", href: "/dashboard/users", permission: "users.read" },
      { label: "Roles", href: "/dashboard/users/roles", permission: "roles.read" },
      { label: "Permissions", href: "/dashboard/users/permissions", permission: "permissions.read" },
    ]},
    { label: "Locations", icon: MapPinned, children: [
      { label: "Overview", href: "/dashboard/locations", permission: "offices.read" },
      { label: "Cities", href: "/dashboard/locations/cities", permission: "offices.read" },
      { label: "Subcities", href: "/dashboard/locations/subcities", permission: "offices.read" },
      { label: "Woredas", href: "/dashboard/locations/woredas", permission: "offices.read" },
      { label: "Zones", href: "/dashboard/locations/zones", permission: "offices.read" },
    ]},
  ]},
  { title: "Citizens", items: [
    { label: "Citizen Registry", icon: IdCard, children: [
      { label: "All Citizens", href: "/dashboard/citizens", permission: "citizens.read" },
      { label: "Register Citizen", href: "/dashboard/citizens/create", permission: "citizens.create" },
    ]},
    { label: "Verification Workflow", icon: ClipboardCheck, children: [
      { label: "Pending", href: "/dashboard/citizens/pending", permission: "citizens.workflow.view" },
      { label: "Document Verification", href: "/dashboard/citizens/verification", permission: "citizens.workflow.review" },
      { label: "Approval", href: "/dashboard/citizens/approval", permission: "citizens.workflow.subcity-approve" },
      { label: "Duplicate Alerts", href: "/dashboard/citizens/duplicates", permission: "citizens.duplicates.view" },
    ]},
  ]},
  { title: "Operations", items: [
    { label: "Reports", href: "/dashboard/reports", icon: BarChart3, permission: "reports.view" },
    { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { label: "Audit Logs", href: "/dashboard/audit-logs", icon: Shield, permission: "audit.read" },
    { label: "Flagged Cases", href: "/dashboard/citizens/duplicates", icon: Flag, permission: "citizens.duplicates.view" },
  ]},
];

export const sidebarConfig: Record<AppRoleKey, RoleSidebar> = {
  "super-admin": { title: dashboardConfig["super-admin"].roleName, icon: Shield, sections: mainMenu },
  "admin-city": { title: dashboardConfig["admin-city"].roleName, icon: Home, sections: mainMenu },
  "admin-subcity": { title: dashboardConfig["admin-subcity"].roleName, icon: Home, sections: mainMenu },
  "admin-woreda": { title: dashboardConfig["admin-woreda"].roleName, icon: Home, sections: mainMenu },
  "admin-zone": { title: dashboardConfig["admin-zone"].roleName, icon: Home, sections: mainMenu },
};

export function getSidebarForRole(role?: string | null, adminLevel?: string | null): RoleSidebar {
  return sidebarConfig[normalizeRole(role, adminLevel)];
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
