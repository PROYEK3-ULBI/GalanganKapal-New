import { useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { purchaseOrdersApi } from '../../lib/api/purchaseOrders';
import { transactionsApi } from '../../lib/api/transactions';
import { ApiError } from '../../lib/apiClient';
import { useApp } from '../../context/AppContext';
import '../Dashboard/Dashboard.css';

export default function GoodsReceipt() {
  const { addToast } = useApp();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPOId, setSelectedPOId] = useState('');
  // receivedQty keyed by poItemId so each line is independent.
  const [receivedQty, setReceivedQty] = useState({});
  const [heatNumbers, setHeatNumbers] = useState({});

  useEffect(() => {
    let cancelled = false;
    purchaseOrdersApi.list()
      .then(res => {
        if (cancelled) return;
        // Only show POs that still have items to receive.
        const open = (res?.data ?? []).filter(p => p.status !== 'Completed' && p.status !== 'Cancelled');
        setPurchaseOrders(open);
      })
      .catch(err => {
        if (cancelled) return;
        addToast(err instanceof ApiError ? err.message : 'Gagal memuat data PO', 'error');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [addToast]);

  const po = useMemo(
    () => purchaseOrders.find(p => p.id === selectedPOId) || null,
    [purchaseOrders, selectedPOId],
  );

  const handlePOChange = (id) => {
    setSelectedPOId(id);
    setReceivedQty({});
    setHeatNumbers({});
  };

  const handleQtyChange = (poItemId, val) => {
    const item = po?.items.find(i => i.id === poItemId);
    const max = item ? item.ordered - item.received : 0;
    const num = Math.max(0, Math.min(Number(val) || 0, max));
    setReceivedQty(prev => ({ ...prev, [poItemId]: num }));
  };

  const handleHeatChange = (poItemId, val) => {
    setHeatNumbers(prev => ({ ...prev, [poItemId]: val }));
  };

  const totalReceiving = useMemo(
    () => Object.values(receivedQty).reduce((sum, v) => sum + (Number(v) || 0), 0),
    [receivedQty],
  );

  const handleConfirm = async () => {
    if (!po) return;
    if (submitting) return;
    const items = (po.items || [])
      .filter(it => Number(receivedQty[it.id]) > 0)
      .map(it => ({
        poItemId: it.id,
        materialId: it.materialId,
        qty: Number(receivedQty[it.id]),
        heatNumber: (heatNumbers[it.id] || '').trim() || undefined,
      }));
    if (items.length === 0) {
      addToast('Masukkan jumlah penerimaan minimal pada satu item', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const res = await transactionsApi.receipt({
        purchaseOrderId: po.id,
        items,
      });
      addToast(`Penerimaan ${res.total} item berhasil dikonfirmasi`, 'success');
      // Refresh PO list to reflect updated received_qty + status.
      const refreshed = await purchaseOrdersApi.list();
      const open = (refreshed?.data ?? []).filter(p => p.status !== 'Completed' && p.status !== 'Cancelled');
      setPurchaseOrders(open);
      // Keep the same PO selected if it's still open, else clear.
      if (!open.find(p => p.id === po.id)) {
        setSelectedPOId('');
      }
      setReceivedQty({});
      setHeatNumbers({});
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Gagal mengkonfirmasi penerimaan';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Penerimaan Barang (Masuk)</h1>
        <p className="page-subtitle">Catat material masuk dari vendor berdasarkan Purchase Order</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div>
          <Card title="Informasi Penerimaan">
            <div className="form-grid">
              <div className="form-group">
                <label>Vendor</label>
                <input value={po?.vendor || ''} placeholder="Pilih PO untuk menampilkan vendor" disabled />
              </div>
              <div className="form-group">
                <label>Purchase Order <span className="required">*</span></label>
                <select value={selectedPOId} onChange={e => handlePOChange(e.target.value)} disabled={loading}>
                  <option value="">{loading ? 'Memuat...' : 'Pilih PO...'}</option>
                  {purchaseOrders.map(p => (
                    <option key={p.id} value={p.id}>{p.poNumber} — {p.vendor}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tanggal Penerimaan</label>
                <input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label>Status PO</label>
                <input value={po?.status || '—'} disabled />
              </div>
            </div>
          </Card>
          {po && (
            <Card title="Item yang Diterima" className="mt-6" noPadding>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Nama Item</th>
                    <th>Dipesan</th>
                    <th>Sudah Diterima</th>
                    <th>Terima Sekarang</th>
                    <th>Heat Number</th>
                    <th>Satuan</th>
                  </tr>
                </thead>
                <tbody>
                  {po.items.map(item => {
                    const remaining = item.ordered - item.received;
                    const fully = remaining === 0;
                    return (
                      <tr key={item.id} style={fully ? { opacity: 0.5 } : undefined}>
                        <td><Badge variant="sku">{item.sku}</Badge></td>
                        <td style={{ fontWeight: 500 }}>{item.name}</td>
                        <td>{item.ordered}</td>
                        <td>{item.received}</td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            max={remaining}
                            value={receivedQty[item.id] ?? ''}
                            disabled={fully}
                            onChange={e => handleQtyChange(item.id, e.target.value)}
                            placeholder={fully ? 'Lengkap' : '0'}
                            style={{ width: 90, padding: '6px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)' }}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={heatNumbers[item.id] ?? ''}
                            disabled={fully}
                            onChange={e => handleHeatChange(item.id, e.target.value)}
                            placeholder="opsional"
                            style={{ width: 130, padding: '6px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)' }}
                          />
                        </td>
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
              <div className="summary-row"><span className="text-muted">Nomor PO</span><span className="font-medium font-mono">{po?.poNumber || '—'}</span></div>
              <div className="summary-row"><span className="text-muted">Vendor</span><span>{po?.vendor || '—'}</span></div>
              <div className="summary-row"><span className="text-muted">Total Item Diterima</span><span className="font-medium">{totalReceiving}</span></div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />
              <Button
                variant="success"
                icon={Check}
                onClick={handleConfirm}
                disabled={submitting || !totalReceiving || !po}
                size="lg"
              >
                {submitting ? 'Memproses...' : 'Konfirmasi Penerimaan'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
