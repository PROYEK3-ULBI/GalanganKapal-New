import { useEffect, useMemo, useState } from 'react';
import { Send } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { materialsApi } from '../../lib/api/materials';
import { projectsApi } from '../../lib/api/projects';
import { transactionsApi } from '../../lib/api/transactions';
import { ApiError } from '../../lib/apiClient';
import { useApp } from '../../context/AppContext';
import './Inventory.css';

const RETURN_TYPES = [
  { value: 'scrap', label: 'Scrap (Kurangi Stok)' },
  { value: 'return', label: 'Retur (Tambah Stok)' },
];

export default function ScrapReturn() {
  const { addToast } = useApp();
  const [materials, setMaterials] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: 'scrap',
    materialId: '',
    projectId: '',
    qty: '',
    heatNumber: '',
    reason: '',
  });

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

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const selectedMaterial = useMemo(
    () => materials.find(m => m.id === form.materialId) || null,
    [materials, form.materialId],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!form.materialId) return addToast('Pilih material', 'error');
    if (!form.qty || Number(form.qty) <= 0) return addToast('Masukkan jumlah yang valid', 'error');
    if (!form.reason.trim()) return addToast('Isi alasan pengembalian', 'error');

    if (form.type === 'scrap' && selectedMaterial && Number(form.qty) > selectedMaterial.stock) {
      return addToast(`Jumlah scrap melebihi stok (tersedia ${selectedMaterial.stock} ${selectedMaterial.unit})`, 'error');
    }

    setSubmitting(true);
    try {
      await transactionsApi.scrapReturn({
        type: form.type,
        materialId: form.materialId,
        projectId: form.projectId || undefined,
        qty: Number(form.qty),
        reason: form.reason.trim(),
        heatNumber: form.heatNumber.trim() || undefined,
      });
      const verb = form.type === 'scrap' ? 'Scrap' : 'Retur';
      addToast(`${verb} berhasil dicatat`, 'success');
      setForm({ type: 'scrap', materialId: '', projectId: '', qty: '', heatNumber: '', reason: '' });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Gagal mencatat scrap/retur';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Scrap & Retur Sisa</h1>
        <p className="page-subtitle">Catat material rusak (scrap) atau material yang dapat digunakan kembali (retur)</p>
      </div>
      <form onSubmit={handleSubmit}>
        <Card title="Detail Pengembalian">
          <div className="form-grid">
            <div className="form-group">
              <label>Tipe <span className="required">*</span></label>
              <div style={{ display: 'flex', gap: 8 }}>
                {RETURN_TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    className={`time-btn ${form.type === t.value ? 'active' : ''}`}
                    onClick={() => update('type', t.value)}
                    style={{ flex: 1, padding: '10px' }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Proyek Asal</label>
              <select value={form.projectId} onChange={e => update('projectId', e.target.value)} disabled={loading}>
                <option value="">{loading ? 'Memuat...' : 'Pilih proyek (opsional)...'}</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Material <span className="required">*</span></label>
              <select value={form.materialId} onChange={e => update('materialId', e.target.value)} disabled={loading} required>
                <option value="">{loading ? 'Memuat...' : 'Pilih material...'}</option>
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.sku} — {m.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Kuantitas <span className="required">*</span></label>
              <input
                type="number"
                min={1}
                value={form.qty}
                onChange={e => update('qty', e.target.value)}
                placeholder="Masukkan jumlah"
                required
              />
            </div>
            <div className="form-group">
              <label>Heat Number</label>
              <input
                value={form.heatNumber}
                onChange={e => update('heatNumber', e.target.value)}
                placeholder="opsional, untuk material baja"
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>
            {selectedMaterial && (
              <div className="form-group">
                <label>Material Dipilih</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Badge variant="sku">{selectedMaterial.sku}</Badge>
                  <span>{selectedMaterial.name}</span>
                  <span className="text-muted text-xs">Stok: {selectedMaterial.stock} {selectedMaterial.unit}</span>
                </div>
              </div>
            )}
          </div>
          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Alasan / Catatan <span className="required">*</span></label>
            <textarea
              value={form.reason}
              onChange={e => update('reason', e.target.value)}
              placeholder="Jelaskan alasan pengembalian..."
              rows={4}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', resize: 'vertical' }}
              required
            />
          </div>
        </Card>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          <Button type="submit" variant="primary" icon={Send} disabled={submitting}>
            {submitting ? 'Memproses...' : 'Kirim Pengembalian'}
          </Button>
        </div>
      </form>
    </>
  );
}
