import { useEffect, useState } from 'react';
import { User, Lock, Bell, Warehouse, Save, Eye, EyeOff, Trash2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { settingsApi } from '../../lib/api/settings';
import { warehouseLocationsApi } from '../../lib/api/warehouseLocations';
import { ApiError } from '../../lib/apiClient';
import './Settings.css';

const NOTIF_OPTIONS = [
  { key: 'lowStock',         label: 'Peringatan Stok Rendah',          desc: 'Notifikasi saat stok material di bawah minimum' },
  { key: 'outOfStock',       label: 'Peringatan Stok Habis',           desc: 'Notifikasi segera saat material habis' },
  { key: 'prApproval',       label: 'Persetujuan Purchase Request',    desc: 'Notifikasi untuk persetujuan/penolakan PR' },
  { key: 'newReceipt',       label: 'Penerimaan Barang Baru',          desc: 'Notifikasi saat barang baru diterima' },
  { key: 'toolCalibration',  label: 'Kalibrasi Alat Jatuh Tempo',      desc: 'Pengingat untuk kalibrasi alat yang akan datang' },
  { key: 'dailyReport',      label: 'Laporan Ringkasan Harian',        desc: 'Terima ringkasan inventaris harian via email' },
];

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth();
  const { addToast, role } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPwd, setShowPwd] = useState(false);

  // Profile form (initialised from user, kept in sync as user updates).
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    department: '',
    phone: '',
    position: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [savingPwd, setSavingPwd] = useState(false);

  // Notification settings (initialised from user.notificationPreferences).
  const [notifSettings, setNotifSettings] = useState({});
  const [savingNotif, setSavingNotif] = useState(false);

  // Warehouse locations
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState('');
  const [savingLoc, setSavingLoc] = useState(false);

  // Initialize form values from authenticated user.
  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfile({
      name: user.name || '',
      email: user.email || '',
      department: user.department || '',
      phone: user.phone || '',
      position: user.position || '',
    });
    // Default notification toggles when prefs are empty.
    const prefs = user.notificationPreferences || {};
    setNotifSettings(NOTIF_OPTIONS.reduce((acc, opt) => {
      acc[opt.key] = prefs[opt.key] ?? false;
      return acc;
    }, {}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Load warehouse locations when tab opens.
  useEffect(() => {
    if (activeTab !== 'warehouse' || !isAuthenticated) return;
    let cancelled = false;
    warehouseLocationsApi.list()
      .then(res => { if (!cancelled) setLocations(res?.data ?? []); })
      .catch(err => {
        if (!cancelled) addToast(err instanceof ApiError ? err.message : 'Gagal memuat lokasi', 'error');
      });
    return () => { cancelled = true; };
  }, [activeTab, isAuthenticated, addToast]);

  const handleSaveProfile = async () => {
    if (savingProfile) return;
    setSavingProfile(true);
    try {
      await settingsApi.updateProfile({
        name: profile.name,
        department: profile.department || undefined,
        phone: profile.phone || undefined,
        position: profile.position || undefined,
      });
      addToast('Profil berhasil disimpan', 'success');
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Gagal menyimpan profil', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePwd = async () => {
    if (savingPwd) return;
    if (!pwdForm.current || !pwdForm.newPwd || !pwdForm.confirm) {
      return addToast('Semua field harus diisi', 'error');
    }
    if (pwdForm.newPwd !== pwdForm.confirm) return addToast('Password baru tidak cocok', 'error');
    if (pwdForm.newPwd.length < 6) return addToast('Password minimal 6 karakter', 'error');
    setSavingPwd(true);
    try {
      await settingsApi.changePassword(pwdForm.current, pwdForm.newPwd);
      addToast('Password berhasil diubah', 'success');
      setPwdForm({ current: '', newPwd: '', confirm: '' });
    } catch (err) {
      const msg = err instanceof ApiError && err.status === 401
        ? 'Password lama salah'
        : (err instanceof ApiError ? err.message : 'Gagal mengubah password');
      addToast(msg, 'error');
    } finally {
      setSavingPwd(false);
    }
  };

  const handleSaveNotif = async () => {
    if (savingNotif) return;
    setSavingNotif(true);
    try {
      await settingsApi.updateNotificationPreferences(notifSettings);
      addToast('Pengaturan notifikasi disimpan', 'success');
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Gagal menyimpan preferensi', 'error');
    } finally {
      setSavingNotif(false);
    }
  };

  const handleAddLocation = async () => {
    const code = newLocation.trim().toUpperCase();
    if (!code || savingLoc) return;
    setSavingLoc(true);
    try {
      const created = await warehouseLocationsApi.create({ code });
      setLocations(prev => [...prev, created]);
      setNewLocation('');
      addToast(`Lokasi ${code} ditambahkan`, 'success');
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Gagal menambah lokasi', 'error');
    } finally {
      setSavingLoc(false);
    }
  };

  const handleRemoveLocation = async (loc) => {
    if (!window.confirm(`Hapus lokasi ${loc.code}?`)) return;
    try {
      await warehouseLocationsApi.remove(loc.id);
      setLocations(prev => prev.filter(l => l.id !== loc.id));
      addToast(`Lokasi ${loc.code} dihapus`, 'success');
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Gagal menghapus lokasi', 'error');
    }
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
                  <Button variant="primary" icon={Save} onClick={handleSaveProfile} disabled={savingProfile}>
                    {savingProfile ? 'Menyimpan...' : 'Simpan Profil'}
                  </Button>
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
                  <Button variant="primary" icon={Lock} onClick={handleChangePwd} disabled={savingPwd}>
                    {savingPwd ? 'Memproses...' : 'Ubah Password'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card title="Preferensi Notifikasi" subtitle="Pilih notifikasi yang ingin Anda terima">
              <div className="settings-form">
                {NOTIF_OPTIONS.map(item => (
                  <div key={item.key} className="notif-toggle">
                    <div>
                      <div className="notif-label">{item.label}</div>
                      <div className="notif-desc">{item.desc}</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={Boolean(notifSettings[item.key])}
                        onChange={e => setNotifSettings(p => ({ ...p, [item.key]: e.target.checked }))}
                      />
                      <span className="slider" />
                    </label>
                  </div>
                ))}
                <div style={{ marginTop: 20 }}>
                  <Button variant="primary" icon={Save} onClick={handleSaveNotif} disabled={savingNotif}>
                    {savingNotif ? 'Menyimpan...' : 'Simpan Pengaturan'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'warehouse' && (
            <Card title="Lokasi Gudang" subtitle="Kelola lokasi penyimpanan">
              <div className="settings-form">
                {locations.length === 0 ? (
                  <div className="text-muted" style={{ padding: 16 }}>Belum ada lokasi</div>
                ) : (
                  <div className="location-grid">
                    {locations.map(loc => (
                      <div key={loc.id} className="location-tag" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Warehouse size={14} />
                        <span>{loc.code}{loc.type ? ` · ${loc.type}` : ''}</span>
                        {role === 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLocation(loc)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--color-text-muted)' }}
                            title="Hapus"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {role === 'admin' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <input
                      placeholder="Tambah lokasi baru (cth. WH-H1)"
                      value={newLocation}
                      onChange={e => setNewLocation(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddLocation()}
                      style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
                    />
                    <Button variant="primary" onClick={handleAddLocation} disabled={savingLoc || !newLocation.trim()}>
                      {savingLoc ? 'Menambah...' : 'Tambah'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
