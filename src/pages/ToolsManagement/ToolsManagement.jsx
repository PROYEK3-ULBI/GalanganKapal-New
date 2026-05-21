import { useEffect, useMemo, useState } from 'react';
import { Search, Wrench, MapPin, Calendar, User, AlertTriangle, Plus, Edit2, Trash2, Settings, CheckCircle } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { toolsApi } from '../../lib/api/tools';
import { ApiError } from '../../lib/apiClient';
import { useApp } from '../../context/AppContext';
import './ToolsManagement.css';

const STATUS_LABELS = {
  All: 'Semua',
  Available: 'Tersedia',
  'In Use': 'Dipakai',
  Maintenance: 'Perbaikan',
};

const CATEGORY_OPTIONS = [
  'Cutting Tools',
  'Welding Equipment',
  'Measuring Instruments',
  'Power Tools',
  'Hand Tools',
  'Safety Equipment',
  'Lifting Equipment',
  'Painting Tools',
  'Lainnya',
];

const CONDITION_OPTIONS = [
  { value: 'Good', label: 'Baik' },
  { value: 'Fair', label: 'Cukup' },
  { value: 'Needs Repair', label: 'Perlu Perbaikan' },
  { value: 'Out of Order', label: 'Rusak' },
];

const emptyForm = {
  sku: '',
  name: '',
  category: '',
  condition: 'Good',
  location: '',
  calibrationDue: '',
  notes: '',
};

export default function ToolsManagement() {
  const { addToast, role } = useApp();
  const isAdmin = role === 'admin';

  const [toolsData, setToolsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form modal state.
  const [showForm, setShowForm] = useState(false);
  const [formEditId, setFormEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete confirmation state.
  const [toolToDelete, setToolToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = async () => {
    try {
      const res = await toolsApi.list();
      setToolsData(res?.data ?? []);
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Gagal memuat alat', 'error');
    }
  };

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return toolsData.filter(t => {
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.sku.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [toolsData, statusFilter, search]);

  const handleCheckout = async (tool) => {
    if (actingId) return;
    setActingId(tool.id);
    try {
      await toolsApi.checkout(tool.id);
      addToast(`${tool.name} berhasil dipinjam`, 'success');
      await refresh();
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Gagal meminjam alat', 'error');
    } finally {
      setActingId(null);
    }
  };

  const handleReturn = async (tool) => {
    if (actingId) return;
    setActingId(tool.id);
    try {
      await toolsApi.returnTool(tool.id);
      addToast(`${tool.name} berhasil dikembalikan`, 'success');
      await refresh();
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Gagal mengembalikan alat', 'error');
    } finally {
      setActingId(null);
    }
  };

  const handleSetMaintenance = async (tool) => {
    if (actingId) return;
    setActingId(tool.id);
    try {
      await toolsApi.setMaintenance(tool.id);
      addToast(`${tool.name} diset ke Perbaikan`, 'success');
      await refresh();
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Gagal mengubah status', 'error');
    } finally {
      setActingId(null);
    }
  };

  const handleSetAvailable = async (tool) => {
    if (actingId) return;
    setActingId(tool.id);
    try {
      await toolsApi.setAvailable(tool.id);
      addToast(`${tool.name} ditandai Tersedia`, 'success');
      await refresh();
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Gagal mengubah status', 'error');
    } finally {
      setActingId(null);
    }
  };

  // Form handlers.
  const openCreateForm = () => {
    setForm(emptyForm);
    setFormEditId(null);
    setShowForm(true);
  };

  const openEditForm = (tool) => {
    setForm({
      sku: tool.sku ?? '',
      name: tool.name ?? '',
      category: tool.category ?? '',
      condition: tool.condition ?? 'Good',
      location: tool.location ?? '',
      calibrationDue: tool.calibrationDue ?? '',
      notes: tool.notes ?? '',
    });
    setFormEditId(tool.id);
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setForm(emptyForm);
    setFormEditId(null);
  };

  const submitForm = async () => {
    const sku = form.sku.trim();
    const name = form.name.trim();
    const category = form.category.trim();
    if (!sku) return addToast('SKU wajib diisi', 'error');
    if (!name) return addToast('Nama alat wajib diisi', 'error');
    if (!category) return addToast('Kategori wajib diisi', 'error');

    setSaving(true);
    try {
      const payload = {
        sku,
        name,
        category,
        condition: form.condition || undefined,
        location: form.location.trim() || undefined,
        calibrationDue: form.calibrationDue || undefined,
        notes: form.notes.trim() || undefined,
      };

      if (formEditId) {
        // Update only sends partial fields (no sku).
        const { sku: _sku, ...updatePayload } = payload;
        void _sku;
        await toolsApi.update(formEditId, updatePayload);
        addToast('Alat berhasil diperbarui', 'success');
      } else {
        await toolsApi.create(payload);
        addToast('Alat berhasil ditambahkan', 'success');
      }
      closeForm();
      await refresh();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Gagal menyimpan alat';
      addToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toolToDelete) return;
    setDeleting(true);
    try {
      await toolsApi.remove(toolToDelete.id);
      addToast('Alat berhasil dihapus', 'success');
      setToolToDelete(null);
      await refresh();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Gagal menghapus alat';
      addToast(msg, 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Calibration is due if it's within 30 days from today.
  const isCalibrationDue = (date) => {
    if (!date) return false;
    const due = new Date(date);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + 30);
    return due <= cutoff;
  };

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Manajemen Alat & Peralatan</h1>
          <p className="page-subtitle">Lacak ketersediaan alat, pinjam/kembalikan, dan status kalibrasi</p>
        </div>
        {isAdmin && (
          <Button variant="primary" icon={Plus} onClick={openCreateForm}>Tambah Alat</Button>
        )}
      </div>

      <div className="tools-toolbar">
        <div className="data-table-search" style={{ width: 320 }}>
          <Search size={16} />
          <input placeholder="Cari alat..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {Object.keys(STATUS_LABELS).map(s => (
            <button
              key={s}
              className={`time-btn ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-muted" style={{ padding: 24 }}>Memuat data...</div>
      ) : filtered.length === 0 ? (
        <div className="text-muted" style={{ padding: 24 }}>Tidak ada alat yang cocok dengan filter</div>
      ) : (
        <div className="tools-grid">
          {filtered.map(tool => (
            <div key={tool.id} className="tool-card">
              <div className="tool-card-header">
                <div className="tool-icon-wrapper"><Wrench size={24} /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Badge variant={tool.status === 'Available' ? 'success' : tool.status === 'In Use' ? 'info' : 'warning'}>
                    {tool.status}
                  </Badge>
                  {isAdmin && (
                    <div className="tool-admin-actions">
                      <button className="btn-icon" onClick={() => openEditForm(tool)} title="Ubah Alat"><Edit2 size={14} /></button>
                      <button className="btn-icon" onClick={() => setToolToDelete(tool)} title="Hapus Alat"><Trash2 size={14} /></button>
                    </div>
                  )}
                </div>
              </div>
              <h3 className="tool-name">{tool.name}</h3>
              <Badge variant="sku">{tool.sku}</Badge>
              <div className="tool-details">
                {tool.location && (
                  <div className="tool-detail-row"><MapPin size={13} /><span>{tool.location}</span></div>
                )}
                <div className="tool-detail-row">
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{tool.category}</span>
                </div>
                {tool.condition && (
                  <div className="tool-detail-row">
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Kondisi: {tool.condition}</span>
                  </div>
                )}
                {tool.borrower && (
                  <div className="tool-detail-row"><User size={13} /><span>{tool.borrower}</span></div>
                )}
                {tool.calibrationDue && (
                  <div className={`tool-detail-row ${isCalibrationDue(tool.calibrationDue) ? 'calib-due' : ''}`}>
                    <Calendar size={13} />
                    <span>Cal: {tool.calibrationDue}</span>
                    {isCalibrationDue(tool.calibrationDue) && <AlertTriangle size={12} />}
                  </div>
                )}
              </div>
              <div className="tool-card-action">
                {tool.status === 'Available' && (
                  <div className="tool-action-row">
                    <Button variant="primary" size="sm" onClick={() => handleCheckout(tool)} disabled={actingId === tool.id}>
                      {actingId === tool.id ? 'Memproses...' : 'Pinjam'}
                    </Button>
                    {isAdmin && (
                      <Button variant="ghost" size="sm" onClick={() => handleSetMaintenance(tool)} disabled={actingId === tool.id} title="Set Perbaikan">
                        <Settings size={14} />
                      </Button>
                    )}
                  </div>
                )}
                {tool.status === 'In Use' && (
                  <Button variant="secondary" size="sm" onClick={() => handleReturn(tool)} disabled={actingId === tool.id}>
                    {actingId === tool.id ? 'Memproses...' : 'Kembalikan'}
                  </Button>
                )}
                {tool.status === 'Maintenance' && (
                  <div className="tool-action-row">
                    <Button variant="ghost" size="sm" disabled>Sedang Diperbaiki</Button>
                    {isAdmin && (
                      <Button variant="success" size="sm" onClick={() => handleSetAvailable(tool)} disabled={actingId === tool.id} title="Tandai Tersedia">
                        <CheckCircle size={14} />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tool Form Modal (Create / Edit) */}
      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={formEditId ? 'Ubah Alat' : 'Tambah Alat Baru'}
        size="md"
        footer={(
          <>
            <Button variant="secondary" onClick={closeForm} disabled={saving}>Batal</Button>
            <Button variant="primary" onClick={submitForm} disabled={saving}>
              {saving ? 'Menyimpan...' : formEditId ? 'Simpan Perubahan' : 'Simpan Alat'}
            </Button>
          </>
        )}
      >
        <div className="request-form">
          <div className="form-grid">
            <div className="form-group">
              <label>SKU <span className="required">*</span></label>
              <input
                type="text"
                value={form.sku}
                onChange={e => setField('sku', e.target.value)}
                placeholder="TL-001"
                disabled={!!formEditId}
              />
              {formEditId && <span className="text-xs text-muted">SKU tidak bisa diubah</span>}
            </div>
            <div className="form-group">
              <label>Nama Alat <span className="required">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={e => setField('name', e.target.value)}
                placeholder="Mesin Las SMAW"
              />
            </div>
            <div className="form-group">
              <label>Kategori <span className="required">*</span></label>
              <select value={form.category} onChange={e => setField('category', e.target.value)}>
                <option value="">Pilih kategori...</option>
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Kondisi</label>
              <select value={form.condition} onChange={e => setField('condition', e.target.value)}>
                {CONDITION_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Lokasi</label>
              <input
                type="text"
                value={form.location}
                onChange={e => setField('location', e.target.value)}
                placeholder="Gudang A, Rak 3"
              />
            </div>
            <div className="form-group">
              <label>Kalibrasi Berikutnya</label>
              <input
                type="date"
                value={form.calibrationDue}
                onChange={e => setField('calibrationDue', e.target.value)}
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Catatan</label>
              <textarea
                value={form.notes}
                onChange={e => setField('notes', e.target.value)}
                rows={2}
                placeholder="Catatan tambahan..."
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!toolToDelete}
        onClose={() => !deleting && setToolToDelete(null)}
        title="Hapus Alat"
        size="sm"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setToolToDelete(null)} disabled={deleting}>Batal</Button>
            <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </>
        )}
      >
        {toolToDelete && (
          <div>
            <p>Hapus alat <strong>{toolToDelete.name}</strong> ({toolToDelete.sku})?</p>
            <p className="text-xs text-muted" style={{ marginTop: 8 }}>
              Alat yang sedang dipinjam atau memiliki riwayat tidak bisa dihapus.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
