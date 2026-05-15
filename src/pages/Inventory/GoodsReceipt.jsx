import { useState } from 'react';
import { Check } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { purchaseOrders, vendors } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import '../Dashboard/Dashboard.css';

export default function GoodsReceipt() {
  const { addToast } = useApp();
  const [selectedPO, setSelectedPO] = useState('');
  const [receivedQty, setReceivedQty] = useState({});
  const po = purchaseOrders.find(p => p.id === selectedPO);

  const handleQtyChange = (sku, val) => {
    const item = po?.items.find(i => i.sku === sku);
    const max = item ? item.ordered - item.received : 0;
    setReceivedQty(prev => ({ ...prev, [sku]: Math.min(Number(val), max) }));
  };

  const handleConfirm = () => {
    addToast('Penerimaan barang berhasil dikonfirmasi!', 'success');
    setSelectedPO('');
    setReceivedQty({});
  };

  const totalReceiving = Object.values(receivedQty).reduce((a, b) => a + (Number(b) || 0), 0);

  return (
    <>
      <div className="page-header"><h1 className="page-title">Penerimaan Barang (Masuk)</h1><p className="page-subtitle">Catat material masuk dari vendor</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div>
          <Card title="Informasi Penerimaan">
            <div className="form-grid">
              <div className="form-group"><label>Vendor</label><select><option value="">Pilih vendor...</option>{vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
              <div className="form-group"><label>Purchase Order <span className="required">*</span></label><select value={selectedPO} onChange={e => { setSelectedPO(e.target.value); setReceivedQty({}); }}><option value="">Pilih PO...</option>{purchaseOrders.filter(p => p.status !== 'Completed').map(p => <option key={p.id} value={p.id}>{p.id} — {p.vendor}</option>)}</select></div>
              <div className="form-group"><label>Tanggal Penerimaan</label><input type="date" defaultValue="2026-05-02" /></div>
              <div className="form-group"><label>Lokasi Gudang</label><input placeholder="cth. WH-A1" defaultValue="WH-A1" /></div>
            </div>
          </Card>
          {po && (
            <Card title="Item yang Diterima" className="mt-6" noPadding>
              <table className="data-table">
                <thead><tr><th>SKU</th><th>Nama Item</th><th>Dipesan</th><th>Sudah Diterima</th><th>Terima Sekarang</th><th>Satuan</th></tr></thead>
                <tbody>
                  {po.items.map(item => {
                    const remaining = item.ordered - item.received;
                    return (
                      <tr key={item.sku}>
                        <td><Badge variant="sku">{item.sku}</Badge></td>
                        <td style={{ fontWeight: 500 }}>{item.name}</td>
                        <td>{item.ordered}</td>
                        <td>{item.received}</td>
                        <td><input type="number" min={0} max={remaining} value={receivedQty[item.sku] || ''} onChange={e => handleQtyChange(item.sku, e.target.value)} placeholder="0" style={{ width: 80, padding: '6px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)' }} /></td>
                        <td>{item.unit}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )}
        </div>
        <div>
          <Card title="Ringkasan Penerimaan" className="sticky-card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="summary-row"><span className="text-muted">Nomor PO</span><span className="font-medium">{selectedPO || '—'}</span></div>
              <div className="summary-row"><span className="text-muted">Vendor</span><span>{po?.vendor || '—'}</span></div>
              <div className="summary-row"><span className="text-muted">Item Diterima</span><span className="font-medium">{totalReceiving}</span></div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />
              <Button variant="success" icon={Check} onClick={handleConfirm} disabled={!totalReceiving} size="lg">Konfirmasi Penerimaan</Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
