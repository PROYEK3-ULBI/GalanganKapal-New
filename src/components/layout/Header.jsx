import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, LogOut, User, Shield, Menu, Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notifications as notifData } from '../../data/mockData';
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

export default function Header() {
  const { role, setRole, addToast, mobileMenuOpen, setMobileMenuOpen } = useApp();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifData.filter(n => !n.read).length;
  const breadcrumb = breadcrumbMap[location.pathname] || 'Dashboard';
  const roleLabel = PERMISSIONS[role]?.label || role;
  const { theme, toggleTheme } = useTheme();

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
          <input placeholder="Cari SKU, material, nomor heat..." value={searchVal} onChange={e => setSearchVal(e.target.value)} />
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
              <div className="notif-dropdown-header"><h4>Notifikasi</h4><span>{unreadCount} belum dibaca</span></div>
              {notifData.map(n => (
                <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`}>
                  <div className={`notif-dot ${n.type}`} />
                  <div className="notif-content">
                    <p className="notif-title">{n.title}</p>
                    <p className="notif-message">{n.message}</p>
                    <span className="notif-time">{n.time}</span>
                  </div>
                </div>
              ))}
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
