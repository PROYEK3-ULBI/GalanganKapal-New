import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, AlertTriangle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { categories } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

export default function MaterialForm() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const [form, setForm] = useState({ name: '', sku: '', category: '', unit: 'Pcs', minStock: '', reorderPoint: '', hazmat: false, specifications: '' });

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const generateSKU = () => {
    const prefix = { 'Steel Plates': 'PLT', 'Welding Consumables': 'WLD', 'Paint & Coating': 'PNT', 'Piping': 'PPE', 'Fasteners': 'BLT', 'Gas & Chemicals': 'GAS', 'Electrical': 'CBL', 'Insulation': 'INS', 'Valves & Fittings': 'VLV' };
    const cat = prefix[form.category] || 'MAT';
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    update('sku', `${cat}-${rand}-${new Date().getFullYear().toString().slice(-2)}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addToast('Material berhasil dibuat!', 'success');
    setTimeout(() => navigate('/master-data'), 500);
  };

  return (
    <>
      <div className="page-header"><h1 className="page-title">Tambah Material Baru</h1><p className="page-subtitle">Buat entri spesifikasi material baru</p></div>
      <form onSubmit={handleSubmit}>
        <Card title="Informasi Material">
          <div className="form-grid">
            <div className="form-group"><label>Nama Material <span className="required">*</span></label><input value={form.name} onChange={e => update('name', e.target.value)} placeholder="cth. Steel Plate AH36 10mm" required /></div>
            <div className="form-group"><label>Kode SKU <span className="required">*</span></label><div style={{ display: 'flex', gap: 8 }}><input value={form.sku} onChange={e => update('sku', e.target.value)} placeholder="Otomatis atau masukkan manual" required style={{ flex: 1, fontFamily: 'var(--font-mono)' }} /><Button type="button" variant="secondary" size="sm" onClick={generateSKU}>Generate</Button></div></div>
            <div className="form-group"><label>Kategori <span className="required">*</span></label><select value={form.category} onChange={e => update('category', e.target.value)} required><option value="">Pilih kategori</option>{categories.filter(c => c !== 'All Categories').map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="form-group"><label>Satuan Dasar <span className="required">*</span></label><select value={form.unit} onChange={e => update('unit', e.target.value)}><option>Pcs</option><option>Kg</option><option>Sheet</option><option>Length</option><option>Roll</option><option>Pail</option><option>Cylinder</option><option>Meter</option></select></div>
            <div className="form-group"><label>Level Stok Minimum <span className="required">*</span></label><input type="number" value={form.minStock} onChange={e => update('minStock', e.target.value)} placeholder="cth. 50" required /></div>
            <div className="form-group"><label>Titik Reorder</label><input type="number" value={form.reorderPoint} onChange={e => update('reorderPoint', e.target.value)} placeholder="cth. 75" /></div>
          </div>
          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="filter-checkbox"><input type="checkbox" checked={form.hazmat} onChange={e => update('hazmat', e.target.checked)} /><AlertTriangle size={16} color="#F97316" /><span>Ini adalah Material Berbahaya (HAZMAT)</span></label>
          </div>
          <div className="form-group" style={{ marginTop: 16 }}><label>Spesifikasi / Catatan</label><textarea value={form.specifications} onChange={e => update('specifications', e.target.value)} placeholder="Masukkan spesifikasi material..." rows={4} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', resize: 'vertical' }} /></div>
        </Card>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
          <Button type="button" variant="secondary" icon={X} onClick={() => navigate('/master-data')}>Batal</Button>
          <Button type="submit" variant="primary" icon={Save}>Simpan Material</Button>
        </div>
      </form>
    </>
  );
}
