import { Bell, BarChart3, Home, IdCard, LayoutDashboard, MapPinned, ShieldCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getDashboardForRole } from "@/config/dashboard.config";

export type SidebarChildItem = { label: string; href: string; permission?: string };
export type SidebarItem = { label: string; href?: string; icon: LucideIcon; permission?: string; children?: SidebarChildItem[] };
export type SidebarSection = { title: string; items: SidebarItem[] };
export type RoleSidebar = { title: string; icon: LucideIcon; sections: SidebarSection[] };

const sections: SidebarSection[] = [
  { title: "Main", items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] },
  { title: "Citizen Management", items: [
    { label: "Citizen Dashboard", href: "/dashboard/citizen-dashboard", icon: LayoutDashboard, permission: "dashboard.citizens.view" },
    { label: "Citizens", href: "/dashboard/citizens", icon: IdCard, permission: "citizens.view" },
    { label: "Verification Workflow", icon: ShieldCheck, children: [
      { label: "Pending", href: "/dashboard/citizens/pending", permission: "citizens.workflow.review" },
      { label: "Verification", href: "/dashboard/citizens/verification", permission: "citizens.workflow.woreda-verify" },
      { label: "Approval", href: "/dashboard/citizens/approval", permission: "citizens.workflow.subcity-approve" },
      { label: "Duplicates", href: "/dashboard/citizens/duplicates", permission: "citizens.workflow.flag" },
    ] },
    { label: "Households", href: "/dashboard/households", icon: Home, permission: "households.read" },
  ] },
  { title: "Administration", items: [
    { label: "Users", href: "/dashboard/users", icon: Users, permission: "users.read" },
    { label: "Locations", href: "/dashboard/locations", icon: MapPinned, permission: "offices.read" },
    { label: "Notifications", href: "/dashboard/notifications", icon: Bell, permission: "notifications.read" },
    { label: "Citizen Reports", href: "/dashboard/reports/citizens", icon: BarChart3, permission: "reports.citizens.view" },
  ] },
];

export function getSidebarForRole(role?: string | null): RoleSidebar {
  const dashboard = getDashboardForRole(role);
  return { title: dashboard.roleName, icon: dashboard.icon, sections };
}

export function filterSidebarByPermissions(roleSidebar: RoleSidebar, permissions: string[] = []) {
  return roleSidebar.sections.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      const children = item.children?.filter((child) => !child.permission || permissions.includes(child.permission));
      if (item.children) return children?.length ? { ...item, children } : null;
      return !item.permission || permissions.includes(item.permission) ? item : null;
    }).filter(Boolean) as SidebarItem[],
  })).filter((section) => section.items.length > 0);
}
