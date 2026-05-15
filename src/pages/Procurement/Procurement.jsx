import { useState } from 'react';
import { ShoppingCart, Package, CheckCircle, Clock, Eye, Plus, Building2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import StatCard from '../../components/ui/StatCard';
import { purchaseOrders, vendors, materials } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import './Procurement.css';

export default function Procurement() {
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState('orders');
  const [viewPO, setViewPO] = useState(null);
  const [showNewPR, setShowNewPR] = useState(false);
  const [prForm, setPrForm] = useState({ vendor: '', items: [], notes: '' });
  const [skuSearch, setSkuSearch] = useState('');

  // Stats
  const totalPO = purchaseOrders.length;
  const activePO = purchaseOrders.filter(p => p.status !== 'Completed').length;
  const completedPO = purchaseOrders.filter(p => p.status === 'Completed').length;

  // PO Table
  const poColumns = [
    { header: 'No. PO', accessor: 'id', render: r => <span className="font-mono font-medium">{r.id}</span> },
    { header: 'Vendor', accessor: 'vendor', render: r => <span style={{ fontWeight: 500 }}>{r.vendor}</span> },
    { header: 'Tanggal', accessor: 'date' },
    { header: 'Item', render: r => <span>{r.items.length} item</span> },
    { header: 'Status', accessor: 'status', render: r => (
      <Badge variant={r.status === 'Completed' ? 'success' : r.status === 'Partially Received' ? 'warning' : 'info'}>
        {r.status}
      </Badge>
    )},
    { header: 'Progres', render: r => {
      const totalOrdered = r.items.reduce((s, i) => s + i.ordered, 0);
      const totalReceived = r.items.reduce((s, i) => s + i.received, 0);
      const pct = Math.round((totalReceived / totalOrdered) * 100);
      return (
        <div className="progress-cell">
          <div className="progress-bar-mini"><div className="progress-fill-mini" style={{ width: `${pct}%` }} /></div>
          <span className="text-xs">{pct}%</span>
        </div>
      );
    }},
    { header: 'Aksi', sortable: false, render: r => (
      <button className="btn-icon" onClick={() => setViewPO(r)} title="Lihat Detail"><Eye size={16} /></button>
    )},
  ];

  // Vendor Table
  const vendorColumns = [
    { header: 'Perusahaan', accessor: 'name', render: r => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="vendor-avatar"><Building2 size={16} /></div>
        <span style={{ fontWeight: 500 }}>{r.name}</span>
      </div>
    )},
    { header: 'Kontak', accessor: 'contact' },
    { header: 'Telepon', accessor: 'phone', render: r => <span className="font-mono">{r.phone}</span> },
    { header: 'Total PO', render: r => {
      const count = purchaseOrders.filter(po => po.vendor === r.name).length;
      return <Badge variant="default">{count} pesanan</Badge>;
    }},
    { header: 'Status', render: () => <Badge variant="success">Aktif</Badge> },
  ];

  // New PR handler
  const searchResults = skuSearch.length >= 2
    ? materials.filter(m => m.sku.toLowerCase().includes(skuSearch.toLowerCase()) || m.name.toLowerCase().includes(skuSearch.toLowerCase())).slice(0, 5)
    : [];

  const addItemToPR = (mat) => {
    if (prForm.items.find(i => i.id === mat.id)) return addToast('Material sudah ditambahkan', 'warning');
    setPrForm(p => ({ ...p, items: [...p.items, { ...mat, qtyOrder: 10 }] }));
    setSkuSearch('');
  };

  const submitPR = () => {
    if (!prForm.vendor) return addToast('Pilih vendor', 'error');
    if (prForm.items.length === 0) return addToast('Tambah minimal 1 item', 'error');
    addToast('Purchase Request berhasil diajukan! Menunggu approval.', 'success');
    setShowNewPR(false);
    setPrForm({ vendor: '', items: [], notes: '' });
  };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Pengadaan</h1>
          <p className="page-subtitle">Purchase order, manajemen vendor, dan pelacakan pengadaan</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowNewPR(true)}>Buat Purchase Request</Button>
      </div>

      <div className="stats-grid">
        <StatCard icon={ShoppingCart} label="Total Purchase Order" value={totalPO} color="primary" />
        <StatCard icon={Clock} label="Pesanan Aktif" value={activePO} color="warning" trendLabel="Menunggu pengiriman" />
        <StatCard icon={CheckCircle} label="Selesai" value={completedPO} color="success" trendLabel="Diterima penuh" />
        <StatCard icon={Building2} label="Vendor Aktif" value={vendors.length} color="info" trendLabel="Pemasok terdaftar" />
      </div>

      <div className="tab-bar">
        <button className={`tab-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          <Package size={16} /> Purchase Order
        </button>
        <button className={`tab-item ${activeTab === 'vendors' ? 'active' : ''}`} onClick={() => setActiveTab('vendors')}>
          <Building2 size={16} /> Daftar Vendor
        </button>
      </div>

      {activeTab === 'orders' && (
        <Card noPadding>
          <DataTable columns={poColumns} data={purchaseOrders} searchPlaceholder="Cari nomor PO atau vendor..." />
        </Card>
      )}

      {activeTab === 'vendors' && (
        <Card noPadding>
          <DataTable columns={vendorColumns} data={vendors} searchPlaceholder="Cari vendor..." />
        </Card>
      )}

      {/* PO Detail Modal */}
      <Modal isOpen={!!viewPO} onClose={() => setViewPO(null)} title={`Detail ${viewPO?.id || ''}`} size="lg">
        {viewPO && (
          <div className="po-detail">
            <div className="detail-grid">
              <div className="detail-field"><label>No. PO</label><span className="font-mono">{viewPO.id}</span></div>
              <div className="detail-field"><label>Vendor</label><span>{viewPO.vendor}</span></div>
              <div className="detail-field"><label>Tanggal</label><span>{viewPO.date}</span></div>
              <div className="detail-field"><label>Status</label>
                <Badge variant={viewPO.status === 'Completed' ? 'success' : 'warning'}>{viewPO.status}</Badge>
              </div>
            </div>
            <h4 style={{ marginTop: 20, marginBottom: 8, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>Item Pesanan</h4>
            <table className="data-table">
              <thead><tr><th>SKU</th><th>Material</th><th>Dipesan</th><th>Diterima</th><th>Satuan</th><th>Progres</th></tr></thead>
              <tbody>
                {viewPO.items.map((item, i) => {
                  const pct = Math.round((item.received / item.ordered) * 100);
                  return (
                    <tr key={i}>
                      <td><Badge variant="sku">{item.sku}</Badge></td>
                      <td style={{ fontWeight: 500 }}>{item.name}</td>
                      <td className="font-mono">{item.ordered}</td>
                      <td className="font-mono">{item.received}</td>
                      <td>{item.unit}</td>
                      <td>
                        <div className="progress-cell">
                          <div className="progress-bar-mini"><div className="progress-fill-mini" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--color-success)' : undefined }} /></div>
                          <span>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* New PR Modal */}
      <Modal isOpen={showNewPR} onClose={() => setShowNewPR(false)} title="Buat Purchase Request Baru" size="lg" footer={
        <><Button variant="secondary" onClick={() => setShowNewPR(false)}>Batal</Button><Button variant="primary" icon={ShoppingCart} onClick={submitPR}>Kirim PR</Button></>
      }>
        <div className="request-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Vendor <span className="required">*</span></label>
              <select value={prForm.vendor} onChange={e => setPrForm(p => ({ ...p, vendor: e.target.value }))}>
                <option value="">Pilih vendor...</option>
                {vendors.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Cari & Tambah Material</label>
            <div style={{ position: 'relative' }}>
              <input placeholder="Ketik SKU atau nama material..." value={skuSearch} onChange={e => setSkuSearch(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }} />
              {searchResults.length > 0 && (
                <div className="search-dropdown">
                  {searchResults.map(m => (
                    <button key={m.id} className="search-result-item" onClick={() => addItemToPR(m)}>
                      <Badge variant="sku">{m.sku}</Badge><span style={{ flex: 1 }}>{m.name}</span><span className="text-xs text-muted">Stok: {m.stock}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {prForm.items.length > 0 && (
            <table className="data-table" style={{ marginTop: 12 }}>
              <thead><tr><th>SKU</th><th>Material</th><th>Stok Saat Ini</th><th>Qty Pesan</th><th></th></tr></thead>
              <tbody>
                {prForm.items.map(item => (
                  <tr key={item.id}>
                    <td><Badge variant="sku">{item.sku}</Badge></td>
                    <td>{item.name}</td>
                    <td>{item.stock} {item.unit}</td>
                    <td><input type="number" min={1} value={item.qtyOrder} onChange={e => setPrForm(p => ({ ...p, items: p.items.map(i => i.id === item.id ? { ...i, qtyOrder: +e.target.value } : i) }))} style={{ width: 80, padding: '6px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }} /></td>
                    <td><button className="btn-icon" onClick={() => setPrForm(p => ({ ...p, items: p.items.filter(i => i.id !== item.id) }))}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Catatan</label>
            <textarea value={prForm.notes} onChange={e => setPrForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Catatan tambahan..." style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', resize: 'vertical' }} />
          </div>
        </div>
      </Modal>
    </>
  );
}
