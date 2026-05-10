// Role-based permission configuration
export const PERMISSIONS = {
  admin: {
    label: 'System Admin',
    allowedRoutes: [
      '/', '/master-data', '/master-data/new', '/master-data/:id/edit',
      '/inventory/goods-receipt', '/inventory/goods-issue', '/inventory/scrap-return',
      '/material-request',
      '/traceability', '/tools', '/procurement', '/reports', '/settings', '/support'
    ],
    sidebarItems: ['Dashboard', 'Data Master', 'Operasi Inventaris', 'Permintaan Material', 'Penelusuran', 'Manajemen Alat', 'Pengadaan', 'Laporan', 'Pengaturan', 'Bantuan'],
    canEdit: ['master-data', 'users', 'settings', 'tools', 'inventory'],
    canApprove: true,
    canDelete: true,
  },
  supervisor: {
    label: 'Supervisor / PM',
    allowedRoutes: [
      '/', '/master-data',
      '/inventory/goods-receipt', '/inventory/goods-issue', '/inventory/scrap-return',
      '/material-request',
      '/traceability', '/tools', '/procurement', '/reports', '/settings', '/support'
    ],
    sidebarItems: ['Dashboard', 'Data Master', 'Operasi Inventaris', 'Permintaan Material', 'Penelusuran', 'Manajemen Alat', 'Pengadaan', 'Laporan', 'Pengaturan', 'Bantuan'],
    canEdit: ['inventory'],
    canApprove: true,
    canDelete: false,
  },
  staff: {
    label: 'Warehouse Staff',
    allowedRoutes: [
      '/',
      '/inventory/goods-receipt', '/inventory/goods-issue', '/inventory/scrap-return',
      '/material-request',
      '/traceability', '/tools', '/settings', '/support'
    ],
    sidebarItems: ['Dashboard', 'Operasi Inventaris', 'Permintaan Material', 'Penelusuran', 'Manajemen Alat', 'Pengaturan', 'Bantuan'],
    canEdit: ['inventory', 'tools'],
    canApprove: false,
    canDelete: false,
  },
};

export function hasAccess(role, route) {
  const perms = PERMISSIONS[role];
  if (!perms) return false;
  // Check exact match or pattern match for dynamic routes
  return perms.allowedRoutes.some(r => {
    if (r === route) return true;
    if (r.includes(':')) {
      const pattern = r.replace(/:[^/]+/g, '[^/]+');
      return new RegExp(`^${pattern}$`).test(route);
    }
    return false;
  });
}

export function canShowSidebarItem(role, label) {
  const perms = PERMISSIONS[role];
  if (!perms) return false;
  return perms.sidebarItems.includes(label);
}

export function canEditModule(role, module) {
  const perms = PERMISSIONS[role];
  if (!perms) return false;
  return perms.canEdit.includes(module);
}

export function canApprove(role) {
  return PERMISSIONS[role]?.canApprove ?? false;
}

export function canDelete(role) {
  return PERMISSIONS[role]?.canDelete ?? false;
}
