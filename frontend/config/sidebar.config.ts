import { Bell, BarChart3, Home, IdCard, LayoutDashboard, MapPinned, ShieldCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getDashboardForRole } from "@/config/dashboard.config";

export type AdminLevelKey = "super" | "city" | "subcity" | "woreda" | "zone";

export type SidebarChildItem = {
  label: string;
  href: string;
  permission?: string;
  levels?: AdminLevelKey[];
};

export type SidebarItem = {
  label: string;
  href?: string;
  icon: LucideIcon;
  permission?: string;
  levels?: AdminLevelKey[];
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

function resolveLevel(role?: string | null, adminLevel?: string | null): AdminLevelKey {
  const roleName = String(role ?? "").toLowerCase();

  if (roleName.includes("super")) {
    return "super";
  }

  const level = String(adminLevel ?? "").toLowerCase();

  if (level === "city" || level === "subcity" || level === "woreda" || level === "zone") {
    return level;
  }

  return "city";
}

function canSeeLevel(levels: AdminLevelKey[] | undefined, currentLevel: AdminLevelKey) {
  return !levels?.length || levels.includes(currentLevel);
}

function filterByLevel(sections: SidebarSection[], currentLevel: AdminLevelKey): SidebarSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items
        .map((item) => {
          if (!canSeeLevel(item.levels, currentLevel)) {
            return null;
          }

          if (item.children) {
            const children = item.children.filter((child) => canSeeLevel(child.levels, currentLevel));

            return children.length ? { ...item, children } : null;
          }

          return item;
        })
        .filter(Boolean) as SidebarItem[],
    }))
    .filter((section) => section.items.length > 0);
}

const allLevels: AdminLevelKey[] = ["super", "city", "subcity", "woreda", "zone"];

const baseSections: SidebarSection[] = [
  {
    title: "Main",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        levels: allLevels,
      },
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
        levels: allLevels,
      },
      {
        label: "Citizens",
        href: "/dashboard/citizens",
        icon: IdCard,
        permission: "citizens.view",
        levels: allLevels,
      },
      {
        label: "Verification Workflow",
        icon: ShieldCheck,
        levels: ["super", "city", "subcity", "woreda"],
        children: [
          {
            label: "Pending Review",
            href: "/dashboard/citizens/pending",
            permission: "citizens.workflow.review",
            levels: ["super", "woreda"],
          },
          {
            label: "Document Verification",
            href: "/dashboard/citizens/verification",
            permission: "citizens.workflow.woreda-verify",
            levels: ["super", "woreda"],
          },
          {
            label: "Approval / ID / Activation",
            href: "/dashboard/citizens/approval",
            permission: "citizens.workflow.subcity-approve",
            levels: ["super", "city", "subcity"],
          },
          {
            label: "Duplicate Investigation",
            href: "/dashboard/citizens/duplicates",
            permission: "citizens.workflow.flag",
            levels: ["super", "woreda"],
          },
        ],
      },
      {
        label: "Households",
        href: "/dashboard/households",
        icon: Home,
        permission: "households.read",
        levels: allLevels,
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        label: "Users",
        href: "/dashboard/users",
        icon: Users,
        permission: "users.read",
        levels: ["super", "city", "subcity", "woreda"],
      },
      {
        label: "Locations",
        href: "/dashboard/locations",
        icon: MapPinned,
        permission: "offices.read",
        levels: ["super", "city", "subcity", "woreda", "zone"],
      },
      {
        label: "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
        permission: "notifications.read",
        levels: allLevels,
      },
      {
        label: "Citizen Reports",
        href: "/dashboard/reports/citizens",
        icon: BarChart3,
        permission: "reports.citizens.view",
        levels: ["super", "city", "subcity", "woreda"],
      },
    ],
  },
];

export function getSidebarForRole(role?: string | null, adminLevel?: string | null): RoleSidebar {
  const level = resolveLevel(role, adminLevel);
  const dashboard = getDashboardForRole(role, adminLevel);

  return {
    title: dashboard.roleName,
    icon: dashboard.icon,
    sections: filterByLevel(baseSections, level),
  };
}

export function filterSidebarByPermissions(roleSidebar: RoleSidebar, permissions: string[] = []) {
  return roleSidebar.sections
    .map((section) => ({
      ...section,
      items: section.items
        .map((item) => {
          const children = item.children?.filter((child) => !child.permission || permissions.includes(child.permission));

          if (item.children) {
            return children?.length ? { ...item, children } : null;
          }

          return !item.permission || permissions.includes(item.permission) ? item : null;
        })
        .filter(Boolean) as SidebarItem[],
    }))
    .filter((section) => section.items.length > 0);
}
