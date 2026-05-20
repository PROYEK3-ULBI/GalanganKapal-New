import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, LogOut, User, Shield, Menu, Sun, Moon, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationsApi } from '../../lib/api/notifications';
import { ApiError } from '../../lib/apiClient';
import { PERMISSIONS } from '../../config/permissions';
import './Header.css';

const breadcrumbMap = {
  '/': 'Dashboard',
  '/master-data': 'Data Master',
  '/master-data/new': 'Data Master / Tambah Material',
  '/inventory/goods-receipt': 'Operasi Inventaris / Penerimaan Barang',
  '/inventory/goods-issue': 'Operasi Inventaris / Pengeluaran Barang',
  '/inventory/scrap-return': 'Operasi Inventaris / Scrap & Retur',
  '/material-request': 'Permintaan Material',
  '/traceability': 'Penelusuran',
  '/tools': 'Manajemen Alat',
  '/procurement': 'Pengadaan',
  '/reports': 'Laporan',
  '/settings': 'Pengaturan',
  '/support': 'Bantuan & Dukungan',
};

const NOTIF_POLL_INTERVAL_MS = 30_000; // 30s polling for unread badge

// Format an ISO timestamp as a short relative time in Indonesian.
function formatRelativeTime(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Math.floor((Date.now() - then) / 1000);
  if (diff < 60) return 'baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)} hari lalu`;
  return new Date(iso).toLocaleDateString('id-ID');
}

export default function Header() {
  const { role, setRole, addToast, setMobileMenuOpen, globalSearch, setGlobalSearch } = useApp();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const breadcrumb = breadcrumbMap[location.pathname] || 'Dashboard';
  const { theme, toggleTheme } = useTheme();

  // Clear the shared search query whenever the user navigates to a new page
  // so leftover queries do not silently filter the next page.
  useEffect(() => {
    setGlobalSearch('');
  }, [location.pathname, setGlobalSearch]);

  // Refresh both list and unread count.
  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [list, stats] = await Promise.all([
        notificationsApi.list({ limit: 20 }),
        notificationsApi.stats(),
      ]);
      setNotifications(list?.data ?? []);
      setUnreadCount(stats?.unread ?? 0);
    } catch (err) {
      // Silent on auth errors (handled globally); other failures are non-fatal here.
      if (!(err instanceof ApiError && err.status === 401)) {
        // do nothing
      }
    }
  }, [isAuthenticated]);

  // Initial load + polling.
  useEffect(() => {
    if (!isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotifications([]);
      setUnreadCount(0);
      return undefined;
    }
    refresh();
    const id = setInterval(refresh, NOTIF_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isAuthenticated, refresh]);

  // Click-outside to close dropdowns.
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    navigate('/');
    addToast(`Beralih ke ${PERMISSIONS[newRole]?.label || newRole}`, 'info');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotifClick = async (notif) => {
    if (!notif.read) {
      try {
        await notificationsApi.markRead(notif.id);
      } catch { /* non-fatal */ }
    }
    setShowNotif(false);
    if (notif.link) navigate(notif.link);
    refresh();
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      addToast('Semua notifikasi ditandai dibaca', 'success');
      refresh();
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Gagal menandai notifikasi', 'error');
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="btn-icon mobile-hamburger" onClick={() => setMobileMenuOpen(v => !v)}>
          <Menu size={22} />
        </button>
        <span className="header-breadcrumb">{breadcrumb}</span>
      </div>
      <div className="header-center">
        <div className="header-search">
          <Search size={16} />
          <input placeholder="Cari SKU, material, nomor heat..." value={globalSearch} onChange={e => setGlobalSearch(e.target.value)} />
        </div>
      </div>
      <div className="header-right">
        <div className="header-role-switcher">
          <Shield size={14} />
          <select value={role} onChange={e => handleRoleSwitch(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="supervisor">Supervisor</option>
            <option value="staff">Staff</option>
          </select>
        </div>
        <button className="btn-icon theme-toggle" onClick={toggleTheme} title="Toggle tema">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="header-notif" ref={notifRef}>
          <button className="btn-icon header-bell" onClick={() => setShowNotif(v => !v)}>
            <Bell size={20} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>
          {showNotif && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                <h4>Notifikasi</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{unreadCount} belum dibaca</span>
                  {unreadCount > 0 && (
                    <button
                      className="btn-icon"
                      title="Tandai semua dibaca"
                      onClick={handleMarkAllRead}
                      style={{ padding: 4 }}
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
                  Belum ada notifikasi
                </div>
              ) : (
                notifications.map(n => (
                  <button
                    type="button"
                    key={n.id}
                    className={`notif-item ${!n.read ? 'unread' : ''}`}
                    onClick={() => handleNotifClick(n)}
                    style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <div className={`notif-dot ${n.type}`} />
                    <div className="notif-content">
                      <p className="notif-title">{n.title}</p>
                      <p className="notif-message">{n.message}</p>
                      <span className="notif-time">{formatRelativeTime(n.createdAt)}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="header-profile" ref={profileRef}>
          <button className="header-profile-btn" onClick={() => setShowProfile(v => !v)}>
            <div className="header-avatar">{user?.avatar || 'U'}</div>
            <span className="header-username">{user?.name || 'User'}</span>
            <ChevronDown size={14} />
          </button>
          {showProfile && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-info">
                <div className="header-avatar lg">{user?.avatar || 'U'}</div>
                <div><p className="font-medium">{user?.name}</p><p className="text-xs text-muted">{user?.email}</p></div>
              </div>
              <button className="profile-dropdown-item" onClick={() => { navigate('/settings'); setShowProfile(false); }}>
                <User size={16} /> Pengaturan Profil
              </button>
              <button className="profile-dropdown-item danger" onClick={handleLogout}>
                <LogOut size={16} /> Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
