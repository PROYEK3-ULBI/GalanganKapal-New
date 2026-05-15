import { useState } from 'react';
import { Send } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { materials, projects } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import './Inventory.css';

export default function ScrapReturn() {
  const { addToast } = useApp();
  const [form, setForm] = useState({ type: 'Scrap', material: '', project: '', qty: '', condition: 'Damaged', reason: '' });
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const selectedMat = materials.find(m => m.id === Number(form.material));

  const handleSubmit = (e) => {
    e.preventDefault();
    addToast('Scrap/Retur berhasil dicatat!', 'success');
    setForm({ type: 'Scrap', material: '', project: '', qty: '', condition: 'Damaged', reason: '' });
  };

  return (
    <>
      <div className="page-header"><h1 className="page-title">Scrap & Retur Sisa</h1><p className="page-subtitle">Catat pengembalian material, scrap, dan sisa potongan</p></div>
      <form onSubmit={handleSubmit}>
        <Card title="Detail Pengembalian">
          <div className="form-grid">
            <div className="form-group"><label>Tipe Pengembalian <span className="required">*</span></label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Scrap', 'Offcut', 'Unused'].map(t => (
                  <button key={t} type="button" className={`time-btn ${form.type === t ? 'active' : ''}`} onClick={() => update('type', t)} style={{ flex: 1, padding: '10px' }}>{t}</button>
                ))}
              </div>
            </div>
            <div className="form-group"><label>Proyek Asal</label><select value={form.project} onChange={e => update('project', e.target.value)}><option value="">Pilih proyek...</option>{projects.map(p => <option key={p.id} value={p.id}>{p.id} — {p.name}</option>)}</select></div>
            <div className="form-group"><label>Material <span className="required">*</span></label><select value={form.material} onChange={e => update('material', e.target.value)} required><option value="">Pilih material...</option>{materials.map(m => <option key={m.id} value={m.id}>{m.sku} — {m.name}</option>)}</select></div>
            <div className="form-group"><label>Kuantitas <span className="required">*</span></label><input type="number" min={1} value={form.qty} onChange={e => update('qty', e.target.value)} placeholder="Masukkan jumlah" required /></div>
            <div className="form-group"><label>Penilaian Kondisi</label><select value={form.condition} onChange={e => update('condition', e.target.value)}><option>Rusak</option><option>Dapat Digunakan</option><option>Sebagian</option><option>Scrap Saja</option></select></div>
            {selectedMat && (
              <div className="form-group"><label>Material Dipilih</label><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Badge variant="sku">{selectedMat.sku}</Badge><span>{selectedMat.name}</span></div></div>
            )}
          </div>
          <div className="form-group" style={{ marginTop: 16 }}><label>Alasan / Catatan <span className="required">*</span></label><textarea value={form.reason} onChange={e => update('reason', e.target.value)} placeholder="Jelaskan alasan pengembalian..." rows={4} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', resize: 'vertical' }} required /></div>
        </Card>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          <Button type="submit" variant="primary" icon={Send}>Kirim Pengembalian</Button>
        </div>
      </form>
    </>
  );
}
