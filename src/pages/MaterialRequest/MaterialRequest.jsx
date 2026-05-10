import { useState } from 'react';
import { Send, Plus, Trash2, ClipboardList, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { materials, projects } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import './MaterialRequest.css';

export default function MaterialRequest() {
  const { requests, addRequest, addToast } = useApp();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [viewDetail, setViewDetail] = useState(null);

  // Form state
  const [form, setForm] = useState({
    type: 'Material Request',
    project: '',
    priority: 'medium',
    reason: '',
    items: [],
  });
  const [skuSearch, setSkuSearch] = useState('');

  const updateForm = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Add item to request
  const addItem = (material) => {
    if (form.items.find(i => i.id === material.id)) {
      addToast('Material sudah ada di daftar', 'warning');
      return;
    }
    updateForm('items', [...form.items, { ...material, qtyRequested: 1 }]);
    setSkuSearch('');
  };

  const updateItemQty = (id, qty) => {
    updateForm('items', form.items.map(i => i.id === id ? { ...i, qtyRequested: Number(qty) } : i));
  };

  const removeItem = (id) => {
    updateForm('items', form.items.filter(i => i.id !== id));
  };

  const searchResults = skuSearch.length >= 2
    ? materials.filter(m =>
        m.sku.toLowerCase().includes(skuSearch.toLowerCase()) ||
        m.name.toLowerCase().includes(skuSearch.toLowerCase())
      ).slice(0, 5)
    : [];

  // Submit request
  const handleSubmit = () => {
    if (!form.project) return addToast('Pilih proyek terlebih dahulu', 'error');
    if (form.items.length === 0) return addToast('Tambahkan minimal 1 material', 'error');
    if (!form.reason) return addToast('Berikan alasan permintaan', 'error');

    const itemNames = form.items.map(i => `${i.name} (${i.qtyRequested} ${i.unit})`).join(', ');
    const proj = projects.find(p => p.id === form.project);

    const newReq = addRequest({
      type: form.type,
      title: `${form.type} — ${itemNames}`,
      requester: user?.name || 'Staff',
      priority: form.priority,
      project: proj?.name || form.project,
      items: form.items.map(i => ({ sku: i.sku, name: i.name, qty: i.qtyRequested, unit: i.unit })),
      reason: form.reason,
    });

    addToast(`Request ${newReq.id} berhasil diajukan!`, 'success');
    setShowForm(false);
    setForm({ type: 'Material Request', project: '', priority: 'medium', reason: '', items: [] });
  };

  // Filter requests by current user
  const myRequests = requests.filter(r => r.requester === (user?.name || 'Staff') || r.requester === 'Citra Dewi');
  const pendingCount = myRequests.filter(r => r.status === 'pending').length;
  const approvedCount = myRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = myRequests.filter(r => r.status === 'rejected').length;

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

      {/* Summary Cards */}
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

      {/* Request History */}
      <Card title="Riwayat Permintaan Saya" subtitle="Daftar semua request yang pernah diajukan" noPadding>
        <div className="request-list">
          {myRequests.length === 0 ? (
            <div className="request-empty">
              <ClipboardList size={40} />
              <p>Belum ada permintaan. Klik "Buat Request Baru" untuk memulai.</p>
            </div>
          ) : (
            myRequests.map(req => (
              <div key={req.id} className="request-item" onClick={() => setViewDetail(req)}>
                <div className="request-item-left">
                  {getStatusIcon(req.status)}
                  <div>
                    <div className="request-item-id">{req.id}</div>
                    <div className="request-item-title">{req.title}</div>
                    <div className="request-item-meta">
                      <span>{req.date}</span>
                      {req.project && <span>• {req.project}</span>}
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
        onClose={() => setShowForm(false)}
        title="Buat Request Material Baru"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Batal</Button>
            <Button variant="primary" icon={Send} onClick={handleSubmit}>Kirim Request</Button>
          </>
        }
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
              <label>Proyek Tujuan <span className="required">*</span></label>
              <select value={form.project} onChange={e => updateForm('project', e.target.value)}>
                <option value="">Pilih proyek...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.id} — {p.name}</option>)}
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

          {/* Material Picker */}
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

          {/* Item List */}
          {form.items.length > 0 && (
            <div className="request-items-table" style={{ marginTop: 12 }}>
              <table className="data-table">
                <thead>
                  <tr><th>SKU</th><th>Nama Material</th><th>Stok Saat Ini</th><th>Qty Diminta</th><th></th></tr>
                </thead>
                <tbody>
                  {form.items.map(item => (
                    <tr key={item.id}>
                      <td><Badge variant="sku">{item.sku}</Badge></td>
                      <td style={{ fontWeight: 500 }}>{item.name}</td>
                      <td>{item.stock} {item.unit}</td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          value={item.qtyRequested}
                          onChange={e => updateItemQty(item.id, e.target.value)}
                          style={{ width: 80, padding: '6px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)' }}
                        />
                      </td>
                      <td>
                        <button className="btn-icon" onClick={() => removeItem(item.id)}>
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Reason */}
          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Alasan Permintaan <span className="required">*</span></label>
            <textarea
              value={form.reason}
              onChange={e => updateForm('reason', e.target.value)}
              placeholder="Jelaskan alasan permintaan material ini (misal: untuk tahap pemasangan lambung Hull 001)..."
              rows={3}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
        </div>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={!!viewDetail}
        onClose={() => setViewDetail(null)}
        title={`Detail Request ${viewDetail?.id || ''}`}
        size="md"
      >
        {viewDetail && (
          <div className="request-detail">
            <div className="detail-grid">
              <div className="detail-field"><label>ID</label><span className="font-mono">{viewDetail.id}</span></div>
              <div className="detail-field"><label>Status</label>{getStatusBadge(viewDetail.status)}</div>
              <div className="detail-field"><label>Tipe</label><span>{viewDetail.type}</span></div>
              <div className="detail-field"><label>Prioritas</label>
                <Badge variant={viewDetail.priority === 'high' ? 'danger' : viewDetail.priority === 'medium' ? 'warning' : 'default'}>
                  {viewDetail.priority}
                </Badge>
              </div>
              <div className="detail-field"><label>Tanggal Request</label><span>{viewDetail.date}</span></div>
              <div className="detail-field"><label>Pemohon</label><span>{viewDetail.requester}</span></div>
              {viewDetail.project && <div className="detail-field"><label>Proyek</label><span>{viewDetail.project}</span></div>}
              {viewDetail.approvedBy && <div className="detail-field"><label>Diproses oleh</label><span>{viewDetail.approvedBy}</span></div>}
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600 }}>Request</label>
              <p style={{ fontSize: 14, marginTop: 4 }}>{viewDetail.title}</p>
            </div>
            {viewDetail.reason && (
              <div style={{ marginTop: 12 }}>
                <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600 }}>Alasan</label>
                <p style={{ fontSize: 14, marginTop: 4 }}>{viewDetail.reason}</p>
              </div>
            )}
            {viewDetail.status === 'pending' && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--color-warning-bg)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--color-warning-text)' }}>
                ⏳ Request ini sedang menunggu persetujuan Supervisor
              </div>
            )}
            {viewDetail.status === 'approved' && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--color-success-bg)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--color-success-text)' }}>
                ✅ Disetujui pada {viewDetail.approvedDate || '-'} oleh {viewDetail.approvedBy || 'Supervisor'}
              </div>
            )}
            {viewDetail.status === 'rejected' && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--color-danger-bg)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--color-danger-text)' }}>
                ❌ Ditolak pada {viewDetail.approvedDate || '-'} oleh {viewDetail.approvedBy || 'Supervisor'}
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
