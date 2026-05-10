import { useState } from 'react';
import { Search, Send, Trash2, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { materials, projects } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import '../Dashboard/Dashboard.css';

export default function GoodsIssue() {
  const { addToast } = useApp();
  const [project, setProject] = useState('');
  const [mandor, setMandor] = useState('');
  const [skuSearch, setSkuSearch] = useState('');
  const [cart, setCart] = useState([]);

  const addToCart = (material) => {
    if (cart.find(c => c.id === material.id)) return addToast('Material sudah ada di keranjang', 'warning');
    setCart(prev => [...prev, { ...material, qtyRequested: 1 }]);
    setSkuSearch('');
  };

  const updateQty = (id, qty) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qtyRequested: Number(qty) } : c));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(c => c.id !== id));
  };

  const handleSubmit = () => {
    if (!project) return addToast('Silakan pilih proyek', 'error');
    if (!cart.length) return addToast('Keranjang kosong', 'error');
    addToast('Pengeluaran barang berhasil!', 'success');
    setCart([]);
    setProject('');
    setMandor('');
  };

  const searchResults = skuSearch.length >= 2 ? materials.filter(m => m.sku.toLowerCase().includes(skuSearch.toLowerCase()) || m.name.toLowerCase().includes(skuSearch.toLowerCase())).slice(0, 5) : [];
  const hasOverstock = cart.some(c => c.qtyRequested > c.stock);

  return (
    <>
      <div className="page-header"><h1 className="page-title">Pengeluaran Barang (Keluar)</h1><p className="page-subtitle">Keluarkan material ke proyek kapal</p></div>
      <Card title="Informasi Pengeluaran">
        <div className="form-grid">
          <div className="form-group"><label>Proyek / Nomor Hull <span className="required">*</span></label><select value={project} onChange={e => setProject(e.target.value)}><option value="">Pilih proyek...</option>{projects.map(p => <option key={p.id} value={p.id}>{p.id} — {p.name}</option>)}</select></div>
          <div className="form-group"><label>Mandor / Pengambil</label><input value={mandor} onChange={e => setMandor(e.target.value)} placeholder="Masukkan nama..." /></div>
          <div className="form-group"><label>Tanggal</label><input type="date" defaultValue="2026-05-02" /></div>
        </div>
      </Card>
      <Card title="Cari Material" className="mt-6">
        <div style={{ position: 'relative' }}>
          <div className="data-table-search" style={{ width: '100%', maxWidth: 'none' }}>
            <Search size={18} /><input placeholder="Scan barcode atau cari SKU / nama material..." value={skuSearch} onChange={e => setSkuSearch(e.target.value)} style={{ fontSize: 16 }} />
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
            <thead><tr><th>SKU</th><th>Nama Item</th><th>Stok Tersedia</th><th>Qty Diminta</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {cart.map(item => {
                const over = item.qtyRequested > item.stock;
                return (
                  <tr key={item.id}>
                    <td><Badge variant="sku">{item.sku}</Badge></td>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td>{item.stock} {item.unit}</td>
                    <td><input type="number" min={1} value={item.qtyRequested} onChange={e => updateQty(item.id, e.target.value)} style={{ width: 80, padding: '6px 10px', border: `1px solid ${over ? 'var(--color-danger)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', background: over ? 'var(--color-danger-bg)' : 'transparent' }} /></td>
                    <td>{over ? <span style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}><AlertCircle size={14} /> Melebihi stok</span> : <Badge variant="success">OK</Badge>}</td>
                    <td><button className="btn-icon" onClick={() => removeFromCart(item.id)}><Trash2 size={15} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" icon={Send} onClick={handleSubmit} disabled={hasOverstock}>Kirim Pengeluaran</Button>
          </div>
        </Card>
      )}
    </>
  );
}
