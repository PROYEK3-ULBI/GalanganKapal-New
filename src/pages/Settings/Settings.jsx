import { useState } from 'react';
import { Settings, User, Lock, Bell, Warehouse, Save, Eye, EyeOff } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import './Settings.css';

export default function SettingsPage() {
  const { user } = useAuth();
  const { addToast, role } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPwd, setShowPwd] = useState(false);

  // Profile form
  const [profile, setProfile] = useState({
    name: user?.name || 'Ahmad Fauzi',
    email: user?.email || 'admin@shipyard.co.id',
    department: 'IT',
    phone: '081234567890',
    position: 'System Administrator',
  });

  // Password form
  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' });

  // Notification settings
  const [notifSettings, setNotifSettings] = useState({
    lowStock: true,
    outOfStock: true,
    prApproval: true,
    newReceipt: false,
    toolCalibration: true,
    dailyReport: false,
  });

  // Warehouse config
  const [warehouseConfig, setWarehouseConfig] = useState({
    locations: ['Yard-A1', 'Yard-A2', 'Yard-A3', 'Yard-A4', 'Yard-D1', 'WH-B1', 'WH-C1', 'WH-D2', 'WH-E1', 'WH-F1', 'WH-G1', 'GAS-YARD'],
    newLocation: '',
  });

  const handleSaveProfile = () => addToast('Profil berhasil disimpan! (Demo)', 'success');
  const handleChangePwd = () => {
    if (!pwdForm.current || !pwdForm.newPwd || !pwdForm.confirm) return addToast('Semua field harus diisi', 'error');
    if (pwdForm.newPwd !== pwdForm.confirm) return addToast('Password baru tidak cocok', 'error');
    if (pwdForm.newPwd.length < 6) return addToast('Password minimal 6 karakter', 'error');
    addToast('Password berhasil diubah! (Demo)', 'success');
    setPwdForm({ current: '', newPwd: '', confirm: '' });
  };
  const handleSaveNotif = () => addToast('Pengaturan notifikasi disimpan! (Demo)', 'success');
  const addLocation = () => {
    if (!warehouseConfig.newLocation.trim()) return;
    setWarehouseConfig(p => ({
      locations: [...p.locations, p.newLocation.trim().toUpperCase()],
      newLocation: '',
    }));
    addToast('Lokasi baru ditambahkan (Demo)', 'success');
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Pengaturan</h1>
        <p className="page-subtitle">Konfigurasi sistem, preferensi pengguna, dan pengaturan gudang</p>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar">
          {[
            { id: 'profile', label: 'Profil Saya', icon: User },
            { id: 'password', label: 'Ubah Kata Sandi', icon: Lock },
            { id: 'notifications', label: 'Notifikasi', icon: Bell },
            { id: 'warehouse', label: 'Konfigurasi Gudang', icon: Warehouse },
          ].map(tab => (
            <button key={tab.id} className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && (
            <Card title="Profil Saya" subtitle="Kelola informasi pribadi Anda">
              <div className="settings-form">
                <div className="profile-header">
                  <div className="profile-avatar">{profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                  <div>
                    <h3>{profile.name}</h3>
                    <Badge variant={role === 'admin' ? 'danger' : role === 'supervisor' ? 'warning' : 'info'}>{role}</Badge>
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nama Lengkap</label>
                    <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input value={profile.email} disabled style={{ opacity: 0.6 }} />
                  </div>
                  <div className="form-group">
                    <label>Departemen</label>
                    <input value={profile.department} onChange={e => setProfile(p => ({ ...p, department: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Telepon</label>
                    <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Jabatan</label>
                    <input value={profile.position} onChange={e => setProfile(p => ({ ...p, position: e.target.value }))} />
                  </div>
                </div>
                <div style={{ marginTop: 20 }}>
                  <Button variant="primary" icon={Save} onClick={handleSaveProfile}>Simpan Profil</Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'password' && (
            <Card title="Ubah Kata Sandi" subtitle="Perbarui kata sandi akun Anda">
              <div className="settings-form" style={{ maxWidth: 400 }}>
                <div className="form-group">
                  <label>Password Saat Ini</label>
                  <div className="password-input">
                    <input type={showPwd ? 'text' : 'password'} value={pwdForm.current} onChange={e => setPwdForm(p => ({ ...p, current: e.target.value }))} placeholder="Masukkan password lama" />
                    <button type="button" className="pwd-toggle" onClick={() => setShowPwd(v => !v)}>
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Password Baru</label>
                  <input type="password" value={pwdForm.newPwd} onChange={e => setPwdForm(p => ({ ...p, newPwd: e.target.value }))} placeholder="Minimal 6 karakter" />
                </div>
                <div className="form-group">
                  <label>Konfirmasi Password Baru</label>
                  <input type="password" value={pwdForm.confirm} onChange={e => setPwdForm(p => ({ ...p, confirm: e.target.value }))} placeholder="Ketik ulang password baru" />
                </div>
                <div style={{ marginTop: 20 }}>
                  <Button variant="primary" icon={Lock} onClick={handleChangePwd}>Ubah Password</Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card title="Preferensi Notifikasi" subtitle="Pilih notifikasi yang ingin Anda terima">
              <div className="settings-form">
                {[
                  { key: 'lowStock', label: 'Peringatan Stok Rendah', desc: 'Dapatkan notifikasi saat stok material di bawah minimum' },
                  { key: 'outOfStock', label: 'Peringatan Stok Habis', desc: 'Notifikasi segera saat material habis' },
                  { key: 'prApproval', label: 'Persetujuan Purchase Request', desc: 'Notifikasi untuk persetujuan/penolakan PR' },
                  { key: 'newReceipt', label: 'Penerimaan Barang Baru', desc: 'Dapatkan notifikasi saat barang baru diterima' },
                  { key: 'toolCalibration', label: 'Kalibrasi Alat Jatuh Tempo', desc: 'Pengingat untuk kalibrasi alat yang akan datang' },
                  { key: 'dailyReport', label: 'Laporan Ringkasan Harian', desc: 'Terima ringkasan inventaris harian via email' },
                ].map(item => (
                  <div key={item.key} className="notif-toggle">
                    <div>
                      <div className="notif-label">{item.label}</div>
                      <div className="notif-desc">{item.desc}</div>
                    </div>
                    <label className="switch">
                      <input type="checkbox" checked={notifSettings[item.key]} onChange={e => setNotifSettings(p => ({ ...p, [item.key]: e.target.checked }))} />
                      <span className="slider" />
                    </label>
                  </div>
                ))}
                <div style={{ marginTop: 20 }}>
                  <Button variant="primary" icon={Save} onClick={handleSaveNotif}>Simpan Pengaturan</Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'warehouse' && (
            <Card title="Lokasi Gudang" subtitle="Kelola lokasi penyimpanan">
              <div className="settings-form">
                <div className="location-grid">
                  {warehouseConfig.locations.map(loc => (
                    <div key={loc} className="location-tag">
                      <Warehouse size={14} /> {loc}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <input
                    placeholder="Tambah lokasi baru (cth. WH-H1)"
                    value={warehouseConfig.newLocation}
                    onChange={e => setWarehouseConfig(p => ({ ...p, newLocation: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addLocation()}
                    style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
                  />
                  <Button variant="primary" onClick={addLocation}>Tambah</Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
