import { useEffect, useMemo, useState } from 'react';
import { Send, Plus, Trash2, ClipboardList, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { materialsApi } from '../../lib/api/materials';
import { projectsApi } from '../../lib/api/projects';
import { materialRequestsApi } from '../../lib/api/materialRequests';
import { ApiError } from '../../lib/apiClient';
import { useApp } from '../../context/AppContext';
import './MaterialRequest.css';

export default function MaterialRequest() {
  const { addToast } = useApp();

  // Data from API
  const [requests, setRequests] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewDetail, setViewDetail] = useState(null);

  // Form state
  const [form, setForm] = useState({
    type: 'Material Request',
    projectId: '',
    priority: 'medium',
    reason: '',
    items: [],
  });
  const [skuSearch, setSkuSearch] = useState('');

  // Initial parallel load.
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      materialRequestsApi.list(),
      materialsApi.list(),
      projectsApi.list({ activeOnly: true }),
    ])
      .then(([reqRes, matRes, projRes]) => {
        if (cancelled) return;
        setRequests(reqRes?.data ?? []);
        setMaterials(matRes?.data ?? []);
        setProjects(projRes?.data ?? []);
      })
      .catch(err => {
        if (cancelled) return;
        addToast(err instanceof ApiError ? err.message : 'Gagal memuat data', 'error');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [addToast]);

  const refreshRequests = async () => {
    try {
      const res = await materialRequestsApi.list();
      setRequests(res?.data ?? []);
    } catch { /* ignore */ }
  };

  // Form helpers
  const updateForm = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const searchResults = useMemo(() => {
    if (skuSearch.length < 2) return [];
    const q = skuSearch.toLowerCase();
    return materials
      .filter(m => m.sku.toLowerCase().includes(q) || m.name.toLowerCase().includes(q))
      .slice(0, 5);
  }, [skuSearch, materials]);

  const addItem = (material) => {
    if (form.items.find(i => i.materialId === material.id)) {
      addToast('Material sudah ada di daftar', 'warning');
      return;
    }
    updateForm('items', [...form.items, {
      materialId: material.id,
      sku: material.sku,
      name: material.name,
      unit: material.unit,
      stock: material.stock,
      qty: 1,
    }]);
    setSkuSearch('');
  };

  const updateItemQty = (materialId, qty) => {
    const num = Math.max(1, Number(qty) || 0);
    updateForm('items', form.items.map(i => i.materialId === materialId ? { ...i, qty: num } : i));
  };

  const removeItem = (materialId) => {
    updateForm('items', form.items.filter(i => i.materialId !== materialId));
  };

  const resetForm = () => {
    setForm({ type: 'Material Request', projectId: '', priority: 'medium', reason: '', items: [] });
    setSkuSearch('');
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!form.reason.trim()) return addToast('Berikan alasan permintaan', 'error');
    if (form.items.length === 0) return addToast('Tambahkan minimal 1 material', 'error');

    setSubmitting(true);
    try {
      const created = await materialRequestsApi.create({
        type: form.type,
        projectId: form.projectId || undefined,
        priority: form.priority,
        reason: form.reason.trim(),
        items: form.items.map(i => ({ materialId: i.materialId, qty: i.qty })),
      });
      addToast(`Request ${created.requestNo} berhasil diajukan`, 'success');
      setShowForm(false);
      resetForm();
      await refreshRequests();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Gagal membuat request';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Stats
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  const getStatusBadge = (status) => {
    if (status === 'approved') return <Badge variant="success">Disetujui</Badge>;
    if (status === 'rejected') return <Badge variant="danger">Ditolak</Badge>;
    return <Badge variant="warning">Menunggu</Badge>;
  };

  const getStatusIcon = (status) => {
    if (status === 'approved') return <CheckCircle size={16} color="#10B981" />;
    if (status === 'rejected') return <XCircle size={16} color="#EF4444" />;
    return <Clock size={16} color="#F59E0B" />;
  };

  const formatItems = (items) => {
    if (!items || items.length === 0) return '—';
    return items.map(i => `${i.name} (${i.qty} ${i.unit})`).join(', ');
  };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Material Request</h1>
          <p className="page-subtitle">Ajukan permintaan material ke Supervisor untuk disetujui</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowForm(true)}>
          Buat Request Baru
        </Button>
      </div>

      <div className="request-stats">
        <div className="request-stat-card pending">
          <Clock size={20} />
          <div>
            <span className="request-stat-value">{pendingCount}</span>
            <span className="request-stat-label">Menunggu Approval</span>
          </div>
        </div>
        <div className="request-stat-card approved">
          <CheckCircle size={20} />
          <div>
            <span className="request-stat-value">{approvedCount}</span>
            <span className="request-stat-label">Disetujui</span>
          </div>
        </div>
        <div className="request-stat-card rejected">
          <XCircle size={20} />
          <div>
            <span className="request-stat-value">{rejectedCount}</span>
            <span className="request-stat-label">Ditolak</span>
          </div>
        </div>
      </div>

      <Card title="Riwayat Permintaan" subtitle="Daftar request yang pernah diajukan" noPadding>
        <div className="request-list">
          {loading ? (
            <div className="request-empty"><p>Memuat data...</p></div>
          ) : requests.length === 0 ? (
            <div className="request-empty">
              <ClipboardList size={40} />
              <p>Belum ada permintaan. Klik "Buat Request Baru" untuk memulai.</p>
            </div>
          ) : (
            requests.map(req => (
              <div key={req.id} className="request-item" onClick={() => setViewDetail(req)}>
                <div className="request-item-left">
                  {getStatusIcon(req.status)}
                  <div>
                    <div className="request-item-id">{req.requestNo}</div>
                    <div className="request-item-title">{req.type} — {formatItems(req.items)}</div>
                    <div className="request-item-meta">
                      <span>{req.date}</span>
                      {req.project && <span>• {req.project}</span>}
                      <span>• oleh {req.requester}</span>
                    </div>
                  </div>
                </div>
                <div className="request-item-right">
                  <Badge variant={req.priority === 'high' ? 'danger' : req.priority === 'medium' ? 'warning' : 'default'}>
                    {req.priority}
                  </Badge>
                  {getStatusBadge(req.status)}
                  <Eye size={16} className="request-item-eye" />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* New Request Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => !submitting && setShowForm(false)}
        title="Buat Request Material Baru"
        size="lg"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)} disabled={submitting}>Batal</Button>
            <Button variant="primary" icon={Send} onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Mengirim...' : 'Kirim Request'}
            </Button>
          </>
        )}
      >
        <div className="request-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Tipe Request <span className="required">*</span></label>
              <select value={form.type} onChange={e => updateForm('type', e.target.value)}>
                <option>Material Request</option>
                <option>Tool Request</option>
                <option>Purchase Request</option>
              </select>
            </div>
            <div className="form-group">
              <label>Proyek Tujuan</label>
              <select value={form.projectId} onChange={e => updateForm('projectId', e.target.value)}>
                <option value="">Pilih proyek (opsional)...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Prioritas</label>
              <div className="priority-btns">
                {[
                  { value: 'low', label: 'Rendah', color: '#94A3B8' },
                  { value: 'medium', label: 'Sedang', color: '#F59E0B' },
                  { value: 'high', label: 'Tinggi', color: '#EF4444' },
                ].map(p => (
                  <button
                    key={p.value}
                    type="button"
                    className={`priority-btn ${form.priority === p.value ? 'active' : ''}`}
                    style={{ '--btn-color': p.color }}
                    onClick={() => updateForm('priority', p.value)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Cari & Tambah Material</label>
            <div style={{ position: 'relative' }}>
              <input
                placeholder="Ketik SKU atau nama material..."
                value={skuSearch}
                onChange={e => setSkuSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
              />
              {searchResults.length > 0 && (
                <div className="search-dropdown">
                  {searchResults.map(m => (
                    <button key={m.id} className="search-result-item" onClick={() => addItem(m)}>
                      <Badge variant="sku">{m.sku}</Badge>
                      <span style={{ flex: 1 }}>{m.name}</span>
                      <span className="text-xs text-muted">Stok: {m.stock} {m.unit}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {form.items.length > 0 && (
            <div className="request-items-table" style={{ marginTop: 12 }}>
              <table className="data-table">
                <thead>
                  <tr><th>SKU</th><th>Nama Material</th><th>Stok Saat Ini</th><th>Qty Diminta</th><th></th></tr>
                </thead>
                <tbody>
                  {form.items.map(item => (
                    <tr key={item.materialId}>
                      <td><Badge variant="sku">{item.sku}</Badge></td>
                      <td style={{ fontWeight: 500 }}>{item.name}</td>
                      <td>{item.stock} {item.unit}</td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          value={item.qty}
                          onChange={e => updateItemQty(item.materialId, e.target.value)}
                          style={{ width: 80, padding: '6px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)' }}
                        />
                      </td>
                      <td>
                        <button type="button" className="btn-icon" onClick={() => removeItem(item.materialId)}>
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Alasan Permintaan <span className="required">*</span></label>
            <textarea
              value={form.reason}
              onChange={e => updateForm('reason', e.target.value)}
              placeholder="Jelaskan alasan permintaan material ini..."
              rows={3}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={!!viewDetail}
        onClose={() => setViewDetail(null)}
        title={`Detail Request ${viewDetail?.requestNo || ''}`}
        size="md"
      >
        {viewDetail && (
          <div className="request-detail">
            <div className="detail-grid">
              <div className="detail-field"><label>No. Request</label><span className="font-mono">{viewDetail.requestNo}</span></div>
              <div className="detail-field"><label>Status</label>{getStatusBadge(viewDetail.status)}</div>
              <div className="detail-field"><label>Tipe</label><span>{viewDetail.type}</span></div>
              <div className="detail-field"><label>Prioritas</label>
                <Badge variant={viewDetail.priority === 'high' ? 'danger' : viewDetail.priority === 'medium' ? 'warning' : 'default'}>
                  {viewDetail.priority}
                </Badge>
              </div>
              <div className="detail-field"><label>Tanggal</label><span>{viewDetail.date}</span></div>
              <div className="detail-field"><label>Pemohon</label><span>{viewDetail.requester}</span></div>
              {viewDetail.project && <div className="detail-field"><label>Proyek</label><span>{viewDetail.project}</span></div>}
              {viewDetail.approvedBy && <div className="detail-field"><label>Diproses oleh</label><span>{viewDetail.approvedBy}</span></div>}
            </div>
            {viewDetail.items && viewDetail.items.length > 0 && (
              <>
                <h4 style={{ marginTop: 16, marginBottom: 8, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>Item</h4>
                <table className="data-table">
                  <thead><tr><th>SKU</th><th>Material</th><th>Qty</th></tr></thead>
                  <tbody>
                    {viewDetail.items.map(it => (
                      <tr key={it.id}>
                        <td><Badge variant="sku">{it.sku}</Badge></td>
                        <td>{it.name}</td>
                        <td className="font-mono">{it.qty} {it.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            {viewDetail.reason && (
              <div style={{ marginTop: 12 }}>
                <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600 }}>Alasan</label>
                <p style={{ fontSize: 14, marginTop: 4 }}>{viewDetail.reason}</p>
              </div>
            )}
            {viewDetail.approvalNotes && (
              <div style={{ marginTop: 12 }}>
                <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600 }}>Catatan Approval</label>
                <p style={{ fontSize: 14, marginTop: 4 }}>{viewDetail.approvalNotes}</p>
              </div>
            )}
            {viewDetail.status === 'pending' && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--color-warning-bg)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--color-warning-text)' }}>
                ⏳ Request ini sedang menunggu persetujuan Supervisor
              </div>
            )}
            {viewDetail.status === 'approved' && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--color-success-bg)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--color-success-text)' }}>
                ✅ Disetujui oleh {viewDetail.approvedBy}
              </div>
            )}
            {viewDetail.status === 'rejected' && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--color-danger-bg)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--color-danger-text)' }}>
                ❌ Ditolak oleh {viewDetail.approvedBy}
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
