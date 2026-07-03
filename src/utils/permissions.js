import { permissionModules } from '../configs/permissionModules';

/**
 * Returns true if this admin user has any specific module permission set,
 * meaning they are restricted staff rather than a full admin.
 */
const isRestrictedStaff = (user) =>
  user?.role === 'admin' &&
  permissionModules.some(m => m.permission && user?.permissions?.[m.permission] === true);

/**
 * Returns the first route path the user is allowed to access.
 * Used for post-login redirect and unauthorised-access redirect.
 */
export const getFirstAccessiblePath = (user) => {
  if (!user) return '/login';
  const { role, permissions } = user;

  if (role === 'platformAdmin') return '/platform-admin';
  if (role === 'superAdmin')    return '/dashboard';

  if (role === 'admin') {
    const restricted = isRestrictedStaff(user);

    for (const m of permissionModules) {
      if (!m.roles.includes('admin')) continue;
      // Restricted staff skip modules without a permission key (dashboard, settings, community)
      if (restricted && !m.permission) continue;
      if (!m.permission || permissions?.[m.permission] === true) return m.subItems?.[0]?.path || m.path;
    }

    return '/dashboard';
  }

  return '/login';
};

/**
 * Returns true if the user is allowed to access the given pathname.
 */
export const canAccessPath = (user, pathname) => {
  if (!user) return false;
  const { role, permissions } = user;

  if (role === 'superAdmin' || role === 'platformAdmin') return true;

  if (role === 'admin') {
    const restricted = isRestrictedStaff(user);

    for (const m of permissionModules) {
      const allPaths = [m.path, ...(m.subItems?.map(s => s.path) || [])];
      const matches  = allPaths.some(p => pathname === p || pathname.startsWith(p + '/'));
      if (!matches) continue;

      // Restricted staff cannot access modules without a permission key
      if (restricted && !m.permission) return false;

      return !m.permission || permissions?.[m.permission] === true;
    }

    // Path not in any module definition — allow (e.g. /analytics, /super-admin for superAdmin)
    return true;
  }

  return true;
};
