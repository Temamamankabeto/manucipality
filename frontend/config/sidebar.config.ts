// frontend/config/sidebar.config.ts

import {
  Bell,
  BarChart3,
  Home,
  IdCard,
  KeyRound,
  LayoutDashboard,
  MapPinned,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getDashboardForRole } from "@/config/dashboard.config";

export type SidebarChildItem = {
  label: string;
  href: string;
  permission?: string;
  levels?: string[];
};

export type SidebarItem = {
  label: string;
  href?: string;
  icon: LucideIcon;
  permission?: string;
  levels?: string[];
  children?: SidebarChildItem[];
};

export type SidebarSection = {
  title: string;
  items: SidebarItem[];
};

export type RoleSidebar = {
  title: string;
  icon: LucideIcon;
  adminLevel?: string | null;
  sections: SidebarSection[];
};

const sections: SidebarSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Citizen Management",
    items: [
      {
        label: "Citizen Dashboard",
        href: "/dashboard/citizen-dashboard",
        icon: LayoutDashboard,
        permission: "dashboard.citizens.view",
      },
      {
        label: "Citizens",
        href: "/dashboard/citizens",
        icon: IdCard,
        permission: "citizens.read",
      },
      {
        label: "Register Citizen",
        href: "/dashboard/citizens/create",
        icon: IdCard,
        permission: "citizens.create",
        levels: ["zone"],
      },
      {
        label: "Verification Workflow",
        icon: ShieldCheck,
        children: [
          {
            label: "Pending",
            href: "/dashboard/citizens/pending",
            permission: "citizens.workflow.review",
            levels: ["woreda"],
          },
          {
            label: "Verification",
            href: "/dashboard/citizens/verification",
            permission: "citizens.workflow.woreda-verify",
            levels: ["woreda"],
          },
          {
            label: "Approval",
            href: "/dashboard/citizens/approval",
            permission: "citizens.workflow.subcity-approve",
            levels: ["subcity", "city"],
          },
          {
            label: "Duplicates",
            href: "/dashboard/citizens/duplicates",
            permission: "citizens.workflow.flag",
            levels: ["woreda", "subcity", "city"],
          },
        ],
      },
      {
        label: "Households",
        href: "/dashboard/households",
        icon: Home,
        permission: "households.read",
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        label: "User Management",
        icon: Users,
        permission: "users.read",
        children: [
          {
            label: "Users",
            href: "/dashboard/users",
            permission: "users.read",
            levels: ["city", "subcity", "woreda"],
          },
          {
            label: "Roles",
            href: "/dashboard/users/roles",
            permission: "roles.view",
          },
          {
            label: "Permissions",
            href: "/dashboard/users/permissions",
            permission: "permissions.view",
          },
        ],
      },
      {
        label: "Locations",
        href: "/dashboard/locations",
        icon: MapPinned,
        permission: "offices.read",
      },
      {
        label: "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
        permission: "notifications.read",
      },
      {
        label: "Citizen Reports",
        href: "/dashboard/reports/citizens",
        icon: BarChart3,
        permission: "reports.citizens.view",
        levels: ["city", "subcity", "woreda"],
      },
    ],
  },
];

export function getSidebarForRole(
  role?: string | null,
  adminLevel?: string | null
): RoleSidebar {
  const dashboard = getDashboardForRole(role, adminLevel);

  return {
    title: dashboard.roleName,
    icon: dashboard.icon,
    adminLevel,
    sections,
  };
}

function allowedByPermission(
  permission: string | undefined,
  permissions: string[]
) {
  if (!permission) return true;

  return (
    permissions.includes(permission) ||
    permissions.includes(permission.replace(".read", ".view")) ||
    permissions.includes(permission.replace(".view", ".read"))
  );
}

function allowedByLevel(
  levels: string[] | undefined,
  adminLevel?: string | null,
  isSuperAdmin = false
) {
  return isSuperAdmin || !levels?.length || levels.includes(String(adminLevel ?? ""));
}

export function filterSidebarByPermissions(
  roleSidebar: RoleSidebar,
  permissions: string[] = [],
  role?: string | null
) {
  const isSuperAdmin = String(role ?? "")
    .toLowerCase()
    .includes("super");

  return roleSidebar.sections
    .map((section) => ({
      ...section,
      items: section.items
        .map((item) => {
          const children = item.children?.filter(
            (child) =>
              allowedByPermission(child.permission, permissions) &&
              allowedByLevel(child.levels, roleSidebar.adminLevel, isSuperAdmin)
          );

          if (item.children) {
            return children?.length ? { ...item, children } : null;
          }

          return allowedByPermission(item.permission, permissions) &&
            allowedByLevel(item.levels, roleSidebar.adminLevel, isSuperAdmin)
            ? item
            : null;
        })
        .filter(Boolean) as SidebarItem[],
    }))
    .filter((section) => section.items.length > 0);
}