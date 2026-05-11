import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Database, ArrowDownToLine, ArrowUpFromLine, RotateCcw, ScanSearch, Wrench, ShoppingCart, FileBarChart, Settings, HelpCircle, ChevronDown, ChevronRight, PanelLeftClose, PanelLeft, ClipboardList } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { canShowSidebarItem } from '../../config/permissions';
import logoNaviStock from '../../assets/NaviStock.png';
import './Sidebar.css';

const allMenuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Data Master', icon: Database, path: '/master-data' },
  {
    label: 'Operasi Inventaris', icon: ArrowDownToLine, children: [
      { label: 'Penerimaan Barang', icon: ArrowDownToLine, path: '/inventory/goods-receipt' },
      { label: 'Pengeluaran Barang', icon: ArrowUpFromLine, path: '/inventory/goods-issue' },
      { label: 'Scrap & Retur', icon: RotateCcw, path: '/inventory/scrap-return' },
    ]
  },
  { label: 'Permintaan Material', icon: ClipboardList, path: '/material-request' },
  { label: 'Penelusuran', icon: ScanSearch, path: '/traceability' },
  { label: 'Manajemen Alat', icon: Wrench, path: '/tools' },
  { label: 'Pengadaan', icon: ShoppingCart, path: '/procurement' },
  { label: 'Laporan', icon: FileBarChart, path: '/reports' },
];

const allBottomItems = [
  { label: 'Pengaturan', icon: Settings, path: '/settings' },
  { label: 'Bantuan', icon: HelpCircle, path: '/support' },
];

export default function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed, role, mobileMenuOpen, setMobileMenuOpen } = useApp();
  const [expandedMenu, setExpandedMenu] = useState('Operasi Inventaris');
  const location = useLocation();
  const navigate = useNavigate();

  const handleMobileClose = () => {
    if (window.innerWidth <= 768) {
      setMobileMenuOpen(false);
    }
  };

  const menuItems = useMemo(() => allMenuItems.filter(item => canShowSidebarItem(role, item.label)), [role]);
  const bottomItems = useMemo(() => allBottomItems.filter(item => canShowSidebarItem(role, item.label)), [role]);

  const isActive = (path) => location.pathname === path;
  const isChildActive = (children) => children?.some(c => location.pathname === c.path);

  const toggleSubmenu = (label) => {
    setExpandedMenu(prev => prev === label ? null : label);
  };

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img 
            src={logoNaviStock} 
            alt="NaviStock Logo" 
            className="sidebar-img-logo"
          />
          {!sidebarCollapsed && (
            <div className="sidebar-brand">
              {/* Teks diubah dari SIMS menjadi NaviStock */}
              <h1>NaviStock</h1>
              <span>Inventaris Galangan</span>
            </div>
          )}
        </div>
        <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(v => !v)}>
          {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map(item => (
            <li key={item.label}>
              {item.children ? (
                <>
                  <button
                    className={`sidebar-item ${isChildActive(item.children) ? 'active' : ''}`}
                    onClick={() => toggleSubmenu(item.label)}
                  >
                    <item.icon size={20} />
                    {!sidebarCollapsed && (
                      <>
                        <span className="sidebar-label">{item.label}</span>
                        {expandedMenu === item.label ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </>
                    )}
                  </button>
                  {expandedMenu === item.label && !sidebarCollapsed && (
                    <ul className="sidebar-submenu">
                      {item.children.map(child => (
                        <li key={child.path}>
                          <NavLink to={child.path} className={`sidebar-subitem ${isActive(child.path) ? 'active' : ''}`} onClick={handleMobileClose}>
                            <child.icon size={16} />
                            <span>{child.label}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <NavLink to={item.path} className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`} end={item.path === '/'} onClick={handleMobileClose}>
                  <item.icon size={20} />
                  {!sidebarCollapsed && <span className="sidebar-label">{item.label}</span>}
                </NavLink>
              )}
            </li>
          ))}
        </ul>

        <ul className="sidebar-menu sidebar-bottom">
          {bottomItems.map(item => (
            <li key={item.path}>
              <NavLink to={item.path} className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`} onClick={handleMobileClose}>
                <item.icon size={20} />
                {!sidebarCollapsed && <span className="sidebar-label">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}