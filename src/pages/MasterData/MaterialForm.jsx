import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, AlertTriangle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { materialsApi } from '../../lib/api/materials';
import { ApiError } from '../../lib/apiClient';
import { useApp } from '../../context/AppContext';

const FALLBACK_CATEGORIES = [
  'Steel Plates', 'Welding Consumables', 'Paint & Coating', 'Piping',
  'Fasteners', 'Gas & Chemicals', 'Electrical', 'Insulation', 'Valves & Fittings',
];

const SKU_PREFIX = {
  'Steel Plates': 'PLT',
  'Welding Consumables': 'WLD',
  'Paint & Coating': 'PNT',
  'Piping': 'PPE',
  'Fasteners': 'BLT',
  'Gas & Chemicals': 'GAS',
  'Electrical': 'CBL',
  'Insulation': 'INS',
  'Valves & Fittings': 'VLV',
};

const emptyForm = {
  name: '',
  sku: '',
  category: '',
  unit: 'Pcs',
  stock: '',
  minStock: '',
  reorderPoint: '',
  price: '',
  location: '',
  hazmat: false,
  specifications: '',
};

export default function MaterialForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { addToast } = useApp();

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  // Initial loading state derives from edit mode so we don't call setLoading(true) inside the effect.
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const generateSKU = () => {
    const prefix = SKU_PREFIX[form.category] || 'MAT';
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const yr = new Date().getFullYear().toString().slice(-2);
    update('sku', `${prefix}-${rand}-${yr}`);
  };

  // Load category list for the dropdown.
  useEffect(() => {
    let cancelled = false;
    materialsApi.categories()
      .then(res => {
        if (cancelled) return;
        const cats = res?.data ?? [];
        if (cats.length) setCategories(cats);
      })
      .catch(() => { /* keep fallback */ });
    return () => { cancelled = true; };
  }, []);

  // When editing, fetch the material and prefill the form.
  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    materialsApi.get(id)
      .then(material => {
        if (cancelled) return;
        setForm({
          name: material.name ?? '',
          sku: material.sku ?? '',
          category: material.category ?? '',
          unit: material.unit ?? 'Pcs',
          stock: material.stock?.toString() ?? '',
          minStock: material.minStock?.toString() ?? '',
          reorderPoint: material.reorderPoint?.toString() ?? '',
          price: material.price?.toString() ?? '',
          location: material.location ?? '',
          hazmat: Boolean(material.hazmat),
          specifications: material.specifications ?? '',
        });
      })
      .catch(err => {
        if (cancelled) return;
        const msg = err instanceof ApiError ? err.message : 'Gagal memuat data material';
        setLoadError(msg);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const numOrUndef = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));
    const payload = {
      name: form.name.trim(),
      category: form.category,
      unit: form.unit,
      stock: numOrUndef(form.stock),
      minStock: numOrUndef(form.minStock),
      reorderPoint: numOrUndef(form.reorderPoint),
      price: numOrUndef(form.price),
      hazmat: form.hazmat,
      location: form.location.trim() || undefined,
      specifications: form.specifications.trim() || undefined,
    };
    if (!isEdit) payload.sku = form.sku.trim();

    setSubmitting(true);
    try {
      if (isEdit) {
        await materialsApi.update(id, payload);
        addToast('Material berhasil diperbarui', 'success');
      } else {
        await materialsApi.create(payload);
        addToast('Material berhasil dibuat', 'success');
      }
      navigate('/master-data');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Gagal menyimpan material';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="page-header"><h1 className="page-title">Memuat...</h1></div>
        <Card><p className="text-muted">Sedang mengambil data material.</p></Card>
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <div className="page-header"><h1 className="page-title">Tidak Dapat Memuat Material</h1></div>
        <Card>
          <p>{loadError}</p>
          <div style={{ marginTop: 16 }}>
            <Button variant="secondary" onClick={() => navigate('/master-data')}>Kembali ke Katalog</Button>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Edit Material' : 'Tambah Material Baru'}</h1>
        <p className="page-subtitle">{isEdit ? 'Perbarui spesifikasi material yang sudah ada' : 'Buat entri spesifikasi material baru'}</p>
      </div>
      <form onSubmit={handleSubmit}>
        <Card title="Informasi Material">
          <div className="form-grid">
            <div className="form-group">
              <label>Nama Material <span className="required">*</span></label>
              <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="cth. Steel Plate AH36 10mm" required />
            </div>
            <div className="form-group">
              <label>Kode SKU <span className="required">*</span></label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={form.sku}
                  onChange={e => update('sku', e.target.value)}
                  placeholder="Otomatis atau masukkan manual"
                  required
                  disabled={isEdit}
                  style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
                />
                {!isEdit && <Button type="button" variant="secondary" size="sm" onClick={generateSKU}>Generate</Button>}
              </div>
            </div>
            <div className="form-group">
              <label>Kategori <span className="required">*</span></label>
              <select value={form.category} onChange={e => update('category', e.target.value)} required>
                <option value="">Pilih kategori</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Satuan Dasar <span className="required">*</span></label>
              <select value={form.unit} onChange={e => update('unit', e.target.value)}>
                <option>Pcs</option><option>Kg</option><option>Sheet</option><option>Length</option>
                <option>Roll</option><option>Pail</option><option>Cylinder</option><option>Meter</option>
              </select>
            </div>
            <div className="form-group">
              <label>Stok Awal</label>
              <input type="number" min={0} value={form.stock} onChange={e => update('stock', e.target.value)} placeholder="cth. 100" />
            </div>
            <div className="form-group">
              <label>Level Stok Minimum <span className="required">*</span></label>
              <input type="number" min={0} value={form.minStock} onChange={e => update('minStock', e.target.value)} placeholder="cth. 50" required />
            </div>
            <div className="form-group">
              <label>Titik Reorder</label>
              <input type="number" min={0} value={form.reorderPoint} onChange={e => update('reorderPoint', e.target.value)} placeholder="cth. 75" />
            </div>
            <div className="form-group">
              <label>Harga (Rp)</label>
              <input type="number" min={0} value={form.price} onChange={e => update('price', e.target.value)} placeholder="cth. 2850000" />
            </div>
            <div className="form-group">
              <label>Lokasi</label>
              <input value={form.location} onChange={e => update('location', e.target.value)} placeholder="cth. WH-A1" />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="filter-checkbox">
              <input type="checkbox" checked={form.hazmat} onChange={e => update('hazmat', e.target.checked)} />
              <AlertTriangle size={16} color="#F97316" />
              <span>Ini adalah Material Berbahaya (HAZMAT)</span>
            </label>
          </div>
          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Spesifikasi / Catatan</label>
            <textarea
              value={form.specifications}
              onChange={e => update('specifications', e.target.value)}
              placeholder="Masukkan spesifikasi material..."
              rows={4}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
        </Card>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
          <Button type="button" variant="secondary" icon={X} onClick={() => navigate('/master-data')} disabled={submitting}>Batal</Button>
          <Button type="submit" variant="primary" icon={Save} disabled={submitting}>
            {submitting ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Simpan Material')}
          </Button>
        </div>
      </form>
    </>
  );
}
