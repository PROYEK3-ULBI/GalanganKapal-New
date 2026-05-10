import { useState } from 'react';
import { ScanSearch, ArrowDownToLine, ArrowUpFromLine, MapPin, FileText } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { materials, transactions } from '../../data/mockData';
import '../Dashboard/Dashboard.css';

export default function Traceability() {
  const [selected, setSelected] = useState(materials.find(m => m.heatNumber));
  const traceMaterials = materials.filter(m => m.heatNumber);
  const relatedTx = transactions.filter(t => t.sku === selected?.sku);

  const timeline = [
    { step: 'Diproduksi', detail: 'PT Krakatau Steel, Cilegon', date: '2026-03-15', icon: FileText, color: 'info' },
    { step: 'Penerimaan Barang', detail: `Diterima di ${selected?.location}`, date: '2026-04-10', icon: ArrowDownToLine, color: 'success' },
    { step: 'Pemeriksaan Kualitas', detail: 'Lulus — Sertifikat terverifikasi', date: '2026-04-11', icon: ScanSearch, color: 'success' },
    { step: 'Disimpan', detail: `Lokasi: ${selected?.location}`, date: '2026-04-11', icon: MapPin, color: 'info' },
    ...(relatedTx.filter(t => t.type === 'issue').map(t => ({
      step: 'Pengeluaran Barang', detail: `Dikeluarkan ke ${t.project} — Qty: ${t.qty}`, date: t.date, icon: ArrowUpFromLine, color: 'warning'
    }))),
  ];

  return (
    <>
      <div className="page-header"><h1 className="page-title">Penelusuran Material</h1><p className="page-subtitle">Lacak asal material, pergerakan, dan sertifikasi</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
        <Card title="Material dengan Nomor Heat" noPadding>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {traceMaterials.map(m => (
              <button key={m.id} onClick={() => setSelected(m)} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 16px', width: '100%', background: selected?.id === m.id ? 'var(--color-primary-50)' : 'transparent', border: 'none', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', textAlign: 'left', transition: 'background 150ms' }}>
                <Badge variant="sku">{m.sku}</Badge>
                <span style={{ fontWeight: 500, fontSize: 13, marginTop: 4 }}>{m.name}</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>Heat: {m.heatNumber}</span>
              </button>
            ))}
          </div>
        </Card>
        {selected && (
          <div>
            <Card title="Informasi Material" className="mb-6">
              <div className="detail-grid">
                <div className="detail-field"><label>SKU</label><Badge variant="sku">{selected.sku}</Badge></div>
                <div className="detail-field"><label>Nama</label><span>{selected.name}</span></div>
                <div className="detail-field"><label>Nomor Heat</label><span className="font-mono" style={{ fontSize: 16, fontWeight: 600 }}>{selected.heatNumber}</span></div>
                <div className="detail-field"><label>Kategori</label><span>{selected.category}</span></div>
                <div className="detail-field"><label>Lokasi</label><span>{selected.location}</span></div>
                <div className="detail-field"><label>Stok Saat Ini</label><span className="font-medium">{selected.stock} {selected.unit}</span></div>
              </div>
            </Card>
            <Card title="Timeline Pergerakan">
              <div className="timeline">
                {timeline.map((t, i) => (
                  <div key={i} className="timeline-item">
                    <div className={`timeline-dot ${t.color}`}><t.icon size={14} /></div>
                    <div className="timeline-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="font-medium">{t.step}</span>
                        <span className="text-xs text-muted">{t.date}</span>
                      </div>
                      <p className="text-xs text-muted" style={{ marginTop: 2 }}>{t.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
