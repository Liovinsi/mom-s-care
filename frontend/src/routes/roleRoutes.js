export const ROLES = {
  USER: "USER",
  WARDEN: "WARDEN",
  ADMIN: "ADMIN"
};

export const ROLE_DASHBOARD_PATHS = {
  [ROLES.USER]: "/pgbooking/user/dashboard",
  [ROLES.WARDEN]: "/pgbooking/warden/dashboard",
  [ROLES.ADMIN]: "/pgbooking/admin/dashboard"
};

export const getDashboardPathForRole = (role) => ROLE_DASHBOARD_PATHS[role] || "/";

export const getCurrentUserDashboardPath = (user) => getDashboardPathForRole(user?.role);
