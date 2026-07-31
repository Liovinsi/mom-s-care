export const ROLES = {
  USER: "USER",
  GUEST: "GUEST",
  GUEST_LABEL: "Guest",
  USER_LABEL: "User",
  WARDEN_LABEL: "Warden",
  ADMIN_LABEL: "Admin",
  WARDEN: "WARDEN",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN"
};

export const normalizeRole = (role) => ({
  User: ROLES.USER,
  Guest: ROLES.USER,
  GUEST: ROLES.USER,
  Warden: ROLES.WARDEN,
  Admin: ROLES.ADMIN,
  SUPER_ADMIN: ROLES.ADMIN
}[role] || role);

export const ROLE_DASHBOARD_PATHS = {
  [ROLES.USER]: "/",
  [ROLES.GUEST]: "/",
  [ROLES.GUEST_LABEL]: "/",
  [ROLES.USER_LABEL]: "/",
  [ROLES.WARDEN]: "/pgbooking/warden/dashboard",
  [ROLES.WARDEN_LABEL]: "/pgbooking/warden/dashboard",
  [ROLES.ADMIN]: "/pgbooking/admin/dashboard",
  [ROLES.ADMIN_LABEL]: "/pgbooking/admin/dashboard",
  [ROLES.SUPER_ADMIN]: "/pgbooking/admin/dashboard"
};

export const getDashboardPathForRole = (role) => ROLE_DASHBOARD_PATHS[role] || ROLE_DASHBOARD_PATHS[normalizeRole(role)] || "/";

export const getCurrentUserDashboardPath = (user) => getDashboardPathForRole(user?.role);
