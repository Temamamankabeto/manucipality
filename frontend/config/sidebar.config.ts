import { Bell, BarChart3, Home, IdCard, LayoutDashboard, MapPinned, PlusCircle, ShieldCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getDashboardForRole } from "@/config/dashboard.config";

type AdminLevel = "city" | "subcity" | "woreda" | "zone";

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

function isSuperAdmin(role?: string | null) {
  return String(role ?? "").toLowerCase().includes("super");
}

function adminLevel(value?: string | null): AdminLevel | null {
  const level = String(value ?? "").toLowerCase();
  return level === "city" || level === "subcity" || level === "woreda" || level === "zone" ? level : null;
}

function section(title: string, items: Array<SidebarItem | false | null | undefined>): SidebarSection {
  return { title, items: items.filter(Boolean) as SidebarItem[] };
}

export function getSidebarForRole(role?: string | null, levelValue?: string | null): RoleSidebar {
  const superAdmin = isSuperAdmin(role);
  const level = adminLevel(levelValue);
  const dashboard = getDashboardForRole(role, level);

  const canRegister = superAdmin || level === "zone";
  const canReview = superAdmin || level === "woreda";
  const canApprove = superAdmin || level === "subcity" || level === "city";
  const canGenerateId = superAdmin || level === "city";
  const canManageSystem = superAdmin || level === "city" || level === "subcity" || level === "woreda";

  const workflowChildren: SidebarChildItem[] = [
    ...(canReview ? [
      { label: "Pending Review", href: "/dashboard/citizens/pending", permission: "citizens.workflow.review" },
      { label: "Document Verification", href: "/dashboard/citizens/verification", permission: "citizens.workflow.woreda-verify" },
      { label: "Duplicate Alerts", href: "/dashboard/citizens/duplicates", permission: "citizens.workflow.flag" },
    ] : []),
    ...(canApprove ? [
      { label: "Approval / ID", href: "/dashboard/citizens/approval", permission: level === "city" || superAdmin ? "citizens.workflow.generate-id" : "citizens.workflow.subcity-approve" },
    ] : []),
  ];

  return {
    title: dashboard.roleName,
    icon: dashboard.icon,
    sections: [
      section("Main", [
        { label: "Dashboard", href: dashboard.route, icon: LayoutDashboard },
      ]),
      section("Citizen Management", [
        { label: "Citizen Dashboard", href: "/dashboard/citizen-dashboard", icon: LayoutDashboard, permission: "dashboard.citizens.view" },
        { label: "Citizens", href: "/dashboard/citizens", icon: IdCard, permission: "citizens.read" },
        canRegister && { label: "Register Citizen", href: "/dashboard/citizens/create", icon: PlusCircle, permission: "citizens.create" },
        workflowChildren.length > 0 && { label: "Verification Workflow", icon: ShieldCheck, children: workflowChildren },
        { label: "Households", href: "/dashboard/households", icon: Home, permission: "households.read" },
      ]),
      section("Administration", [
        canManageSystem && { label: "Users", href: "/dashboard/users", icon: Users, permission: "users.read" },
        { label: "Locations", href: "/dashboard/locations", icon: MapPinned, permission: "offices.read" },
        { label: "Notifications", href: "/dashboard/notifications", icon: Bell, permission: "notifications.read" },
        (superAdmin || level === "city" || level === "subcity" || level === "woreda") && { label: "Citizen Reports", href: "/dashboard/reports/citizens", icon: BarChart3, permission: "reports.citizens.view" },
      ]),
    ].filter((s) => s.items.length > 0),
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
