export type AdminRole = "superAdmin" | "admin" | "moderator" | "user";

export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  superAdmin: [
    "manage_users",
    "view_analytics",
    "edit_content",
    "system_settings",
  ],
  admin: ["manage_users", "view_analytics", "edit_content"],
  moderator: ["edit_content"],
  user: [],
};

export function hasPermission(role: AdminRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export const ROLE_LABELS: Record<string, string> = {
  superAdmin: "Super Admin",
  admin: "Admin",
  moderator: "Moderator",
  user: "User",
};

export const ROLE_COLORS: Record<string, string> = {
  superAdmin:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  moderator:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  user: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};
