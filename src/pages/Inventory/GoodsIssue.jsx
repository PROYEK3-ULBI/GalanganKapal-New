import { useEffect, useMemo, useState } from 'react';
import { Search, Send, Trash2, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { materialsApi } from '../../lib/api/materials';
import { projectsApi } from '../../lib/api/projects';
import { transactionsApi } from '../../lib/api/transactions';
import { ApiError } from '../../lib/apiClient';
import { useApp } from '../../context/AppContext';
import '../Dashboard/Dashboard.css';

export default function GoodsIssue() {
  const { addToast } = useApp();
  const [materials, setMaterials] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [project, setProject] = useState('');
  const [mandor, setMandor] = useState('');
  const [skuSearch, setSkuSearch] = useState('');
  const [cart, setCart] = useState([]);

  // Initial parallel load.
  useEffect(() => {
    let cancelled = false;
    Promise.all([materialsApi.list(), projectsApi.list({ activeOnly: true })])
      .then(([matRes, projRes]) => {
        if (cancelled) return;
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

  // Refresh material stock numbers (called after a successful issue).
  const refreshMaterials = async () => {
    try {
      const res = await materialsApi.list();
      setMaterials(res?.data ?? []);
    } catch { /* ignore */ }
  };

  const searchResults = useMemo(() => {
    if (skuSearch.length < 2) return [];
    const q = skuSearch.toLowerCase();
    return materials
      .filter(m => m.sku.toLowerCase().includes(q) || m.name.toLowerCase().includes(q))
      .slice(0, 5);
  }, [skuSearch, materials]);

  const addToCart = (material) => {
    if (cart.find(c => c.materialId === material.id)) {
      addToast('Material sudah ada di keranjang', 'warning');
      return;
    }
    setCart(prev => [...prev, {
      materialId: material.id,
      sku: material.sku,
      name: material.name,
      unit: material.unit,
      stock: material.stock,
      qtyRequested: 1,
    }]);
    setSkuSearch('');
  };

  const updateQty = (materialId, qty) => {
    const num = Math.max(1, Number(qty) || 0);
    setCart(prev => prev.map(c => c.materialId === materialId ? { ...c, qtyRequested: num } : c));
  };

  const removeFromCart = (materialId) => {
    setCart(prev => prev.filter(c => c.materialId !== materialId));
  };

  const hasOverstock = cart.some(c => c.qtyRequested > c.stock);

  const handleSubmit = async () => {
    if (!project) return addToast('Silakan pilih proyek', 'error');
    if (cart.length === 0) return addToast('Keranjang kosong', 'error');
    if (hasOverstock) return addToast('Ada item yang melebihi stok', 'error');
    setSubmitting(true);
    try {
      const res = await transactionsApi.issue({
        projectId: project,
        mandor: mandor.trim() || undefined,
        items: cart.map(c => ({ materialId: c.materialId, qty: c.qtyRequested })),
      });
      addToast(`Pengeluaran ${res.total} item berhasil`, 'success');
      setCart([]);
      setProject('');
      setMandor('');
      await refreshMaterials();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Gagal mengirim pengeluaran';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Pengeluaran Barang (Keluar)</h1>
        <p className="page-subtitle">Keluarkan material ke proyek kapal</p>
      </div>
      <Card title="Informasi Pengeluaran">
        <div className="form-grid">
          <div className="form-group">
            <label>Proyek / Nomor Hull <span className="required">*</span></label>
            <select value={project} onChange={e => setProject(e.target.value)} disabled={loading}>
              <option value="">{loading ? 'Memuat...' : 'Pilih proyek...'}</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Mandor / Pengambil</label>
            <input value={mandor} onChange={e => setMandor(e.target.value)} placeholder="Masukkan nama..." />
          </div>
          <div className="form-group">
            <label>Tanggal</label>
            <input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
        </div>
      </Card>
      <Card title="Cari Material" className="mt-6">
        <div style={{ position: 'relative' }}>
          <div className="data-table-search" style={{ width: '100%', maxWidth: 'none' }}>
            <Search size={18} />
            <input
              placeholder="Scan barcode atau cari SKU / nama material..."
              value={skuSearch}
              onChange={e => setSkuSearch(e.target.value)}
              style={{ fontSize: 16 }}
            />
          </div>
          {searchResults.length > 0 && (
            <div className="search-dropdown">
              {searchResults.map(m => (
                <button key={m.id} className="search-result-item" onClick={() => addToCart(m)}>
                  <Badge variant="sku">{m.sku}</Badge>
                  <span style={{ flex: 1 }}>{m.name}</span>
                  <span className="text-muted text-xs">Stok: {m.stock} {m.unit}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>
      {cart.length > 0 && (
        <Card title="Keranjang Pengeluaran" className="mt-6" noPadding>
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nama Item</th>
                <th>Stok Tersedia</th>
                <th>Qty Diminta</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => {
                const over = item.qtyRequested > item.stock;
                return (
                  <tr key={item.materialId}>
                    <td><Badge variant="sku">{item.sku}</Badge></td>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td>{item.stock} {item.unit}</td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        value={item.qtyRequested}
                        onChange={e => updateQty(item.materialId, e.target.value)}
                        style={{
                          width: 80, padding: '6px 10px',
                          border: `1px solid ${over ? 'var(--color-danger)' : 'var(--color-border)'}`,
                          borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)',
                          background: over ? 'var(--color-danger-bg)' : 'transparent',
                        }}
                      />
                    </td>
                    <td>
                      {over ? (
                        <span style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                          <AlertCircle size={14} /> Melebihi stok
                        </span>
                      ) : (
                        <Badge variant="success">OK</Badge>
                      )}
                    </td>
                    <td><button className="btn-icon" onClick={() => removeFromCart(item.materialId)}><Trash2 size={15} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" icon={Send} onClick={handleSubmit} disabled={submitting || hasOverstock}>
              {submitting ? 'Memproses...' : 'Kirim Pengeluaran'}
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
