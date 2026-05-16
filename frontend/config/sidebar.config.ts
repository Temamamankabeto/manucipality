import {
  Bell,
  BarChart3,
  Home,
  IdCard,
  LayoutDashboard,
  MapPinned,
  ShieldCheck,
  Users,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import { getDashboardForRole } from "@/config/dashboard.config";

export type AdminLevel =
  | "city"
  | "subcity"
  | "woreda"
  | "zone";

export type SidebarChildItem = {
  label: string;
  href: string;
  permission?: string;
  levels?: AdminLevel[];
  superOnly?: boolean;
};

export type SidebarItem = {
  label: string;
  href?: string;
  icon: LucideIcon;
  permission?: string;
  levels?: AdminLevel[];
  superOnly?: boolean;
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
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
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
        permission:
          "dashboard.citizens.view",
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
            label: "Pending Review",

            href: "/dashboard/citizens/pending",

            permission:
              "citizens.workflow.review",

            levels: ["woreda"],
          },

          {
            label:
              "Document Verification",

            href: "/dashboard/citizens/verification",

            permission:
              "citizens.workflow.woreda-verify",

            levels: ["woreda"],
          },

          {
            label: "Citizen Approval",

            href: "/dashboard/citizens/approval",

            permission:
              "citizens.workflow.subcity-approve",

            levels: [
              "subcity",
              "city",
            ],
          },

          {
            label: "Duplicate Cases",

            href: "/dashboard/citizens/duplicates",

            permission:
              "citizens.workflow.flag",

            levels: [
              "woreda",
              "subcity",
              "city",
            ],
          },
        ],
      },

      {
        label: "Households",
        href: "/dashboard/households",
        icon: Home,
        permission: "households.read",
        levels: ["zone"],
      },
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | PROPERTY & TAX MANAGEMENT
  |--------------------------------------------------------------------------
  */

  {
    title: "Property & Tax Management",

    items: [
      {
        label: "Property Categories",
        href: "/dashboard/property-categories",
        icon: Home,
        permission:
          "property-categories.read",
        levels: [
          "city",
          "subcity",
          "woreda",
        ],
      },

      {
        label: "Properties",
        href: "/dashboard/properties",
        icon: Home,
        permission: "properties.read",
        levels: [
          "city",
          "subcity",
          "woreda",
        ],
      },

      {
        label: "Citizen Properties",
        href: "/dashboard/citizen-properties",
        icon: Users,
        permission:
          "citizen-properties.read",
        levels: [
          "city",
          "subcity",
          "woreda",
        ],
      },

      {
        label: "Valuations",
        href: "/dashboard/valuations",
        icon: BarChart3,
        permission: "valuations.read",
        levels: [
          "city",
          "subcity",
        ],
      },

      {
        label: "Tax Assessments",
        href: "/dashboard/tax-assessments",
        icon: BarChart3,
        permission: "taxes.read",
        levels: [
          "city",
          "subcity",
        ],
      },

      {
        label: "Tax Payments",
        href: "/dashboard/tax-payments",
        icon: BarChart3,
        permission: "payments.read",
        levels: [
          "city",
          "subcity",
          "woreda",
        ],
      },

      {
        label: "Payment Receipts",
        href: "/dashboard/payment-receipts",
        icon: BarChart3,
        permission: "receipts.read",
        levels: [
          "city",
          "subcity",
        ],
      },

      {
        label: "Tax Clearances",
        href: "/dashboard/tax-clearances",
        icon: ShieldCheck,
        permission:
          "taxes.clearance",
        levels: [
          "city",
          "subcity",
        ],
      },

      {
        label: "Reports",
        href: "/dashboard/reports",
        icon: BarChart3,
        permission: "reports.view",
        levels: [
          "city",
          "subcity",
        ],
      },

      {
        label: "GIS Dashboard",
        href: "/dashboard/gis",
        icon: MapPinned,
        permission: "gis.view",
        levels: ["city"],
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

        levels: [
          "city",
          "subcity",
          "woreda",
        ],

        children: [
          {
            label: "Users",
            href: "/dashboard/users",
            permission: "users.read",
            levels: [
              "city",
              "subcity",
              "woreda",
            ],
          },

          {
            label: "Roles",
            href: "/dashboard/users/roles",
            permission: "roles.view",
            superOnly: true,
          },

          {
            label: "Permissions",
            href: "/dashboard/users/permissions",
            permission:
              "permissions.view",
            superOnly: true,
          },
        ],
      },

      {
        label: "Locations",
        href: "/dashboard/locations",
        icon: MapPinned,
        permission: "offices.read",
        levels: [
          "city",
          "subcity",
          "woreda",
        ],
      },

      {
        label: "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
        permission:
          "notifications.read",
      },

      {
        label: "Citizen Reports",
        href: "/dashboard/reports/citizens",
        icon: BarChart3,
        permission:
          "reports.citizens.view",
        levels: [
          "city",
          "subcity",
          "woreda",
        ],
      },
    ],
  },
];

export function getSidebarForRole(
  role?: string | null,
  adminLevel?: string | null
): RoleSidebar {
  const dashboard =
    getDashboardForRole(
      role,
      adminLevel
    );

  return {
    title: dashboard.roleName,
    icon: dashboard.icon,
    adminLevel,
    sections,
  };
}

function isSuperAdminRole(
  role?: string | null
) {
  return String(role ?? "")
    .toLowerCase()
    .includes("super");
}

function allowedByPermission(
  permission:
    | string
    | undefined,
  permissions: string[]
) {
  if (!permission) return true;

  return (
    permissions.includes(permission) ||
    permissions.includes(
      permission.replace(
        ".read",
        ".view"
      )
    ) ||
    permissions.includes(
      permission.replace(
        ".view",
        ".read"
      )
    )
  );
}

function allowedByLevel(
  item: {
    levels?: AdminLevel[];
    superOnly?: boolean;
  },

  adminLevel?: string | null,

  isSuperAdmin = false
) {
  if (isSuperAdmin) return true;

  if (item.superOnly) return false;

  if (!item.levels?.length)
    return true;

  return item.levels.includes(
    String(
      adminLevel ?? ""
    ) as AdminLevel
  );
}

export function filterSidebarByPermissions(
  roleSidebar: RoleSidebar,

  permissions: string[] = [],

  role?: string | null
) {
  const isSuperAdmin =
    isSuperAdminRole(role);

  return roleSidebar.sections
    .map((section) => ({
      ...section,

      items: section.items
        .map((item) => {
          const children =
            item.children?.filter(
              (child) =>
                allowedByPermission(
                  child.permission,
                  permissions
                ) &&
                allowedByLevel(
                  child,
                  roleSidebar.adminLevel,
                  isSuperAdmin
                )
            );

          if (item.children) {
            return children?.length
              ? {
                  ...item,
                  children,
                }
              : null;
          }

          return allowedByPermission(
            item.permission,
            permissions
          ) &&
            allowedByLevel(
              item,
              roleSidebar.adminLevel,
              isSuperAdmin
            )
            ? item
            : null;
        })
        .filter(Boolean) as SidebarItem[],
    }))
    .filter(
      (section) =>
        section.items.length > 0
    );
}