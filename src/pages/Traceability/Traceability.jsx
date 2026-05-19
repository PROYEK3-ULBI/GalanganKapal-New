import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Trash2,
  Undo2,
  Inbox,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { materialsApi } from '../../lib/api/materials';
import { transactionsApi } from '../../lib/api/transactions';
import { ApiError } from '../../lib/apiClient';
import { useApp } from '../../context/AppContext';
import '../Dashboard/Dashboard.css';
import './Traceability.css';

// Map a transaction row from the API into a timeline event.
// Returns null for unknown types so the page does not crash if the backend
// adds a new type in the future.
function toTimelineEvent(t) {
  const qtyDetail = `Qty: ${t.qty}${t.unit ? ` ${t.unit}` : ''}`;
  const joinDetails = (parts) => parts.filter(Boolean).join(' · ');

  switch (t.type) {
    case 'receipt':
      return {
        key: t.id,
        step: t.vendor ? `Diterima dari ${t.vendor}` : 'Diterima dari vendor',
        detail: joinDetails([t.poNumber && `PO ${t.poNumber}`, qtyDetail, t.notes]),
        date: t.date,
        txNo: t.transactionNo,
        icon: ArrowDownToLine,
        color: 'success',
      };
    case 'issue':
      return {
        key: t.id,
        step: t.project ? `Dikeluarkan ke proyek ${t.project}` : 'Dikeluarkan',
        detail: joinDetails([qtyDetail, t.notes]),
        date: t.date,
        txNo: t.transactionNo,
        icon: ArrowUpFromLine,
        color: 'warning',
      };
    case 'scrap':
      return {
        key: t.id,
        step: 'Scrap',
        detail: joinDetails([qtyDetail, t.notes]),
        date: t.date,
        txNo: t.transactionNo,
        icon: Trash2,
        color: 'danger',
      };
    case 'return':
      return {
        key: t.id,
        step: t.project ? `Dikembalikan dari proyek ${t.project}` : 'Dikembalikan',
        detail: joinDetails([qtyDetail, t.notes]),
        date: t.date,
        txNo: t.transactionNo,
        icon: Undo2,
        color: 'info',
      };
    default:
      return null;
  }
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('id-ID');
  } catch {
    return iso;
  }
}

export default function Traceability() {
  const { addToast } = useApp();

  // Materials list state.
  const [materialsList, setMaterialsList] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [materialsError, setMaterialsError] = useState(false);

  // Currently selected material.
  const [selected, setSelected] = useState(null);

  // Transactions for the selected material.
  const [tx, setTx] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState(false);

  // Counter to retrigger the transactions fetch on demand ("Coba lagi").
  const [retryKey, setRetryKey] = useState(0);

  // Effect A: load materials once on mount and pick the first heat-numbered one.
  // Initial state is already loading=true / error=false, so no reset is needed
  // before the fetch.
  useEffect(() => {
    let cancelled = false;

    materialsApi.list()
      .then(res => {
        if (cancelled) return;
        const all = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        const withHeat = all.filter(m => !!m.heatNumber);
        setMaterialsList(withHeat);
        if (withHeat[0]) {
          setSelected(withHeat[0]);
          // Prime the transaction loading state so Effect B's fetch shows
          // "Memuat pergerakan..." immediately rather than briefly flashing
          // the empty state.
          setTxLoading(true);
          setTxError(false);
          setTx([]);
        }
      })
      .catch(err => {
        if (cancelled) return;
        setMaterialsError(true);
        const msg = err instanceof ApiError ? err.message : 'Gagal memuat material';
        addToast(msg, 'error');
      })
      .finally(() => {
        if (!cancelled) setMaterialsLoading(false);
      });

    return () => { cancelled = true; };
  }, [addToast]);

  // Effect B: load transactions whenever the selected material changes
  // or the user clicks "Coba lagi". The `loading` and `error` resets happen
  // in click handlers (see `selectMaterial` and `retryTx`) so the effect body
  // only triggers the async fetch.
  useEffect(() => {
    if (!selected?.id) return undefined;

    let cancelled = false;

    transactionsApi.list({ materialId: selected.id })
      .then(res => {
        if (cancelled) return;
        setTx(Array.isArray(res?.data) ? res.data : []);
      })
      .catch(err => {
        if (cancelled) return;
        setTxError(true);
        setTx([]);
        const msg = err instanceof ApiError ? err.message : 'Gagal memuat pergerakan';
        addToast(msg, 'error');
      })
      .finally(() => {
        if (!cancelled) setTxLoading(false);
      });

    return () => { cancelled = true; };
  }, [selected?.id, retryKey, addToast]);

  const timeline = useMemo(
    () => tx.map(toTimelineEvent).filter(Boolean),
    [tx],
  );

  const retryTx = () => {
    setTxLoading(true);
    setTxError(false);
    setRetryKey(k => k + 1);
  };

  // When the user clicks a different material in the sidebar we reset the
  // transaction state in the click handler so the effect body itself only
  // performs the async fetch (avoids the react-hooks/set-state-in-effect lint).
  const selectMaterial = (m) => {
    if (m?.id === selected?.id) return;
    setSelected(m);
    setTxLoading(true);
    setTxError(false);
    setTx([]);
  };

  // ---- Render helpers ----

  const renderSidebarBody = () => {
    if (materialsLoading) {
      return <div className="trace-sidebar-state">Memuat material...</div>;
    }
    if (materialsError) {
      return (
        <div className="trace-sidebar-state">
          <AlertCircle size={16} /> Gagal memuat
        </div>
      );
    }
    if (materialsList.length === 0) {
      return (
        <div className="trace-sidebar-state">
          <Inbox size={16} /> Belum ada material dengan nomor heat
        </div>
      );
    }
    return materialsList.map(m => (
      <button
        key={m.id}
        type="button"
        onClick={() => selectMaterial(m)}
        className={`trace-material-item ${selected?.id === m.id ? 'is-active' : ''}`}
      >
        <Badge variant="sku">{m.sku}</Badge>
        <span className="trace-material-name">{m.name}</span>
        <span className="trace-material-heat">Heat: {m.heatNumber}</span>
      </button>
    ));
  };

  const renderTimelineBody = () => {
    if (txLoading) {
      return <div className="trace-state">Memuat pergerakan...</div>;
    }
    if (txError) {
      return (
        <div className="trace-state">
          <AlertCircle size={20} />
          <span>Gagal memuat pergerakan</span>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={retryTx}>
            Coba lagi
          </Button>
        </div>
      );
    }
    if (timeline.length === 0) {
      return (
        <div className="trace-state">
          <Inbox size={20} />
          <span>Belum ada pergerakan material ini</span>
        </div>
      );
    }
    return (
      <div className="timeline">
        {timeline.map(t => (
          <div key={t.key} className="timeline-item">
            <div className={`timeline-dot ${t.color}`}><t.icon size={14} /></div>
            <div className="timeline-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span className="font-medium">{t.step}</span>
                <span className="text-xs text-muted">{formatDate(t.date)}</span>
              </div>
              {t.detail && (
                <p className="text-xs text-muted" style={{ marginTop: 2 }}>{t.detail}</p>
              )}
              {t.txNo && (
                <p
                  className="text-xs text-muted font-mono"
                  style={{ marginTop: 4 }}
                >
                  {t.txNo}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const timelineSubtitle =
    !txLoading && !txError && timeline.length > 0
      ? `${timeline.length} pergerakan tercatat`
      : undefined;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Penelusuran Material</h1>
        <p className="page-subtitle">Lacak asal material, pergerakan, dan sertifikasi</p>
      </div>
      <div className="trace-grid">
        <Card title="Material dengan Nomor Heat" noPadding>
          <div className="trace-sidebar-list">{renderSidebarBody()}</div>
        </Card>

        {selected ? (
          <div>
            <Card title="Informasi Material" className="mb-6">
              <div className="detail-grid">
                <div className="detail-field">
                  <label>SKU</label>
                  <Badge variant="sku">{selected.sku}</Badge>
                </div>
                <div className="detail-field">
                  <label>Nama</label>
                  <span>{selected.name}</span>
                </div>
                <div className="detail-field">
                  <label>Nomor Heat</label>
                  <span className="font-mono" style={{ fontSize: 16, fontWeight: 600 }}>
                    {selected.heatNumber}
                  </span>
                </div>
                <div className="detail-field">
                  <label>Kategori</label>
                  <span>{selected.category}</span>
                </div>
                <div className="detail-field">
                  <label>Lokasi</label>
                  <span>{selected.location || '—'}</span>
                </div>
                <div className="detail-field">
                  <label>Stok Saat Ini</label>
                  <span className="font-medium">
                    {selected.stock} {selected.unit}
                  </span>
                </div>
              </div>
            </Card>
            <Card title="Timeline Pergerakan" subtitle={timelineSubtitle}>
              {renderTimelineBody()}
            </Card>
          </div>
        ) : (
          <Card title="Informasi Material">
            <div className="trace-state">
              <Inbox size={20} />
              <span>Pilih material untuk melihat penelusuran</span>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
