import { useApp } from '../../context/AppContext';
import { Users, DollarSign, ClipboardCheck, Package, Ship as ShipIcon, ArrowDownToLine, ArrowUpFromLine, RotateCcw, Eye, Edit, Check, X, CheckCircle, XCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { materialRequestsApi } from '../../lib/api/materialRequests';
import { usersApi } from '../../lib/api/users';
import { activityLogApi } from '../../lib/api/activityLog';
import { transactionsApi } from '../../lib/api/transactions';
import { reportsApi } from '../../lib/api/reports';
import { projectsApi } from '../../lib/api/projects';
import { purchaseOrdersApi } from '../../lib/api/purchaseOrders';
import { ApiError } from '../../lib/apiClient';
import { useCallback, useEffect, useState } from 'react';
import './Dashboard.css';

// ---- Top-level helpers shared across sub-dashboards ----

// Map a time-range button label to a number of days.
function rangeToDays(range) {
  switch (range) {
    case '30D': return 30;
    case '90D': return 90;
    case '7D':
    default:    return 7;
  }
}

// Map a transaction type to a Badge variant.
function typeBadgeVariant(type) {
  switch (type) {
    case 'receipt': return 'success';
    case 'issue':   return 'info';
    case 'scrap':   return 'warning';
    case 'return':  return 'default';
    default:        return 'default';
  }
}

// Friendly label with directional glyph for the transaction type.
function typeLabel(type) {
  switch (type) {
    case 'receipt': return '↓ Masuk';
    case 'issue':   return '↑ Keluar';
    case 'scrap':   return '♻ Scrap';
    case 'return':  return '↺ Retur';
    default:        return type;
  }
}

function formatDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('id-ID'); }
  catch { return iso; }
}

// Format a large IDR amount as 'Rp X.XB' / 'Rp X.XM' / 'Rp X.XK'.
// Mirror of the helper in Reports.jsx; kept duplicated here to avoid
// pulling in a shared util just for one function.
function formatIDRCompact(value) {
  if (!value || value < 1000) return `Rp ${(value || 0).toLocaleString('id-ID')}`;
  if (value >= 1e9) return `Rp ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `Rp ${(value / 1e6).toFixed(1)}M`;
  return `Rp ${(value / 1000).toFixed(1)}K`;
}

function AdminDashboard() {
  const { addToast, globalSearch, setGlobalSearch } = useApp();
  const [userData, setUserData] = useState([]);
  const [activityEntries, setActivityEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [poStats, setPoStats] = useState(null);
  const [actingId, setActingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [usersRes, activityRes] = await Promise.all([
        usersApi.list(),
        activityLogApi.list({ limit: 15 }),
      ]);
      setUserData(usersRes?.data ?? []);
      setActivityEntries(activityRes?.data ?? []);
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Gagal memuat data', 'error');
    }
  }, [addToast]);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refresh]);

  // Load summary KPIs (material count + active POs).
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      reportsApi.summary(),
      purchaseOrdersApi.stats(),
    ])
      .then(([s, ps]) => {
        if (cancelled) return;
        setSummary(s);
        setPoStats(ps);
      })
      .catch(err => {
        if (cancelled) return;
        addToast(err instanceof ApiError ? err.message : 'Gagal memuat ringkasan', 'error');
      });
    return () => { cancelled = true; };
  }, [addToast]);

  const toggleStatus = async (user) => {
    if (actingId) return;
    setActingId(user.id);
    try {
      await usersApi.toggleStatus(user.id);
      addToast(`Status ${user.name} diperbarui`, 'success');
      await refresh();
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Gagal mengubah status', 'error');
    } finally {
      setActingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await usersApi.remove(deleteTarget.id);
      addToast(`${deleteTarget.name} dihapus`, 'success');
      setDeleteTarget(null);
      await refresh();
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Gagal menghapus user', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const userColumns = [
    { header: 'Nama', accessor: 'name', render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="header-avatar" style={{ width: 28, height: 28, fontSize: 10 }}>{r.avatar || r.name?.split(' ').map(s => s[0]).slice(0, 2).join('')}</div>
        <div><div style={{ fontWeight: 500 }}>{r.name}</div><div className="text-xs text-muted">{r.email}</div></div>
      </div>
    )},
    { header: 'Peran', accessor: 'role', render: (r) => <Badge variant={r.role === 'admin' ? 'info' : r.role === 'supervisor' ? 'warning' : 'default'}>{r.role}</Badge> },
    { header: 'Departemen', accessor: 'department', render: (r) => r.department || '—' },
    { header: 'Status', accessor: 'status', render: (r) => (
      <button
        className={`status-toggle ${r.status}`}
        onClick={() => toggleStatus(r)}
        disabled={actingId === r.id}
      >
        <span className="status-toggle-dot" />{r.status}
      </button>
    )},
    { header: 'Login Terakhir', accessor: 'lastLoginAt', render: (r) => r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '—' },
    { header: 'Aksi', sortable: false, render: (r) => (
      <div style={{ display: 'flex', gap: 4 }}>
        <button className="btn-icon" title="Lihat detail"><Eye size={15} /></button>
        <button className="btn-icon" title="Edit"><Edit size={15} /></button>
        <button
          className="btn-icon"
          title="Hapus"
          style={{ color: 'var(--color-danger)' }}
          onClick={() => setDeleteTarget(r)}
        >
          <X size={15} />
        </button>
      </div>
    )},
  ];

  return (
    <>
      <div className="page-header"><h1 className="page-title">Dashboard Admin Sistem</h1><p className="page-subtitle">Kelola pengguna, peran, dan konfigurasi sistem</p></div>
      <div className="stats-grid-3">
        <StatCard icon={Users} label="Total Pengguna Aktif" value={userData.filter(u => u.status === 'active').length} color="primary" trendLabel="dari semua pengguna" />
        <StatCard icon={Package} label="Total Material" value={summary?.materialCount ?? '—'} color="info" trendLabel="Item di katalog" />
        <StatCard icon={ClipboardCheck} label="Total PO Aktif" value={poStats?.active ?? '—'} color="warning" trendLabel="PO sedang diproses" />
      </div>
      <Card title="Manajemen Pengguna" subtitle="Kelola pengguna dan peran sistem" noPadding>
        <DataTable
          columns={userColumns}
          data={userData}
          searchPlaceholder="Cari pengguna..."
          pageSize={10}
          emptyMessage={loading ? 'Memuat pengguna...' : 'Tidak ada pengguna'}
          searchTerm={globalSearch}
          onSearchChange={setGlobalSearch}
        />
      </Card>
      <Card title="Log Aktivitas Sistem" subtitle="Kegiatan sistem terbaru" className="mt-6">
        <div className="activity-log">
          {activityEntries.length === 0 ? (
            <div className="text-muted" style={{ padding: 24, textAlign: 'center' }}>
              {loading ? 'Memuat...' : 'Belum ada aktivitas tercatat'}
            </div>
          ) : (
            activityEntries.map(a => (
              <div key={a.id} className="activity-item">
                <div className={`status-dot ${a.type}`} />
                <div className="activity-content">
                  <div className="activity-header">
                    <span className="font-medium">{a.action}</span>
                    <span className="text-xs text-muted">{new Date(a.time).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  <p className="text-xs text-muted">{a.detail}{a.user ? ` — by ${a.user}` : ''}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Konfirmasi Hapus Pengguna"
        size="sm"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>Batal</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </>
        )}
      >
        <p>Apakah Anda yakin ingin menghapus <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email})?</p>
        <p className="text-sm text-muted" style={{ marginTop: 8 }}>Pengguna yang sudah pernah membuat permintaan atau transaksi tidak dapat dihapus untuk menjaga audit trail.</p>
      </Modal>
    </>
  );
}

function SupervisorDashboard() {
  const [timeRange, setTimeRange] = useState('7D');
  const { addToast } = useApp();
  const [requests, setRequests] = useState([]);
  const [actingId, setActingId] = useState(null); // id currently being approved/rejected

  // Summary KPIs.
  const [summary, setSummary] = useState(null);
  const [activeProjectsCount, setActiveProjectsCount] = useState(null);

  // Inventory trend chart state.
  const [chartPoints, setChartPoints] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(false);
  const [chartRetryKey, setChartRetryKey] = useState(0);

  // Load all material requests on mount and after every action.
  const refresh = useCallback(async () => {
    try {
      const res = await materialRequestsApi.list();
      setRequests(res?.data ?? []);
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Gagal memuat permintaan', 'error');
    }
  }, [addToast]);

  useEffect(() => {
    // Dispatching the network request from inside the effect intentionally;
    // the eslint rule wants us to avoid setState in effects but here the state
    // update happens asynchronously after the response.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  // Load summary KPIs (total inventory value, low stock count, active projects).
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      reportsApi.summary(),
      projectsApi.list({ activeOnly: true }),
    ])
      .then(([s, p]) => {
        if (cancelled) return;
        setSummary(s);
        setActiveProjectsCount(p?.total ?? p?.data?.length ?? 0);
      })
      .catch(err => {
        if (cancelled) return;
        addToast(err instanceof ApiError ? err.message : 'Gagal memuat ringkasan', 'error');
      });
    return () => { cancelled = true; };
  }, [addToast]);

  // Fetch the inventory trend whenever the user changes the time range or
  // hits the "Coba lagi" button. Reset of loading/error happens in the click
  // handlers so the effect body itself only triggers the network call.
  useEffect(() => {
    let cancelled = false;
    const days = rangeToDays(timeRange);
    reportsApi.inventoryTrend(days)
      .then(res => {
        if (cancelled) return;
        setChartPoints(res?.data ?? []);
      })
      .catch(err => {
        if (cancelled) return;
        setChartError(true);
        addToast(err instanceof ApiError ? err.message : 'Gagal memuat tren', 'error');
      })
      .finally(() => { if (!cancelled) setChartLoading(false); });
    return () => { cancelled = true; };
  }, [timeRange, chartRetryKey, addToast]);

  const handleTimeRange = (range) => {
    if (range === timeRange) return;
    setChartLoading(true);
    setChartError(false);
    setTimeRange(range);
  };

  const retryChart = () => {
    setChartLoading(true);
    setChartError(false);
    setChartRetryKey(k => k + 1);
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const recentApproved = requests.filter(r => r.status === 'approved' || r.status === 'rejected').slice(0, 5);

  const handleApproval = async (id, action) => {
    if (actingId) return;
    setActingId(id);
    try {
      if (action === 'approve') {
        await materialRequestsApi.approve(id);
        addToast('Request disetujui', 'success');
      } else {
        await materialRequestsApi.reject(id);
        addToast('Request ditolak', 'warning');
      }
      await refresh();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Gagal memproses request';
      addToast(msg, 'error');
    } finally {
      setActingId(null);
    }
  };

  const approvalColumns = [
    { header: 'No. Request', accessor: 'requestNo', render: (r) => <span className="font-mono text-xs">{r.requestNo}</span> },
    { header: 'Tipe', accessor: 'type', render: (r) => <Badge variant={r.type === 'Purchase Request' ? 'info' : r.type === 'Material Request' ? 'warning' : 'default'}>{r.type}</Badge> },
    { header: 'Pemohon', accessor: 'requester' },
    { header: 'Tanggal', accessor: 'date' },
    { header: 'Prioritas', accessor: 'priority', render: (r) => <Badge variant={r.priority === 'high' ? 'danger' : r.priority === 'medium' ? 'warning' : 'default'}>{r.priority}</Badge> },
    { header: 'Aksi', sortable: false, render: (r) => (
      <div style={{ display: 'flex', gap: 4 }}>
        <Button variant="success" size="sm" icon={Check} onClick={() => handleApproval(r.id, 'approve')} disabled={actingId === r.id}>Setujui</Button>
        <Button variant="danger" size="sm" icon={X} onClick={() => handleApproval(r.id, 'reject')} disabled={actingId === r.id}>Tolak</Button>
      </div>
    )},
  ];

  return (
    <>
      <div className="page-header"><h1 className="page-title">Ringkasan Dashboard</h1><p className="page-subtitle">Metrik inventaris galangan kapal real-time dan persetujuan tertunda</p></div>
      <div className="stats-grid">
        <StatCard icon={DollarSign} label="Total Nilai Inventaris" value={summary ? formatIDRCompact(summary.totalInventoryValue) : '—'} color="primary" />
        <StatCard icon={ClipboardCheck} label="Persetujuan Tertunda" value={pendingRequests.length} color="warning" trendLabel="Memerlukan tindakan segera" />
        <StatCard icon={Package} label="Stok Kritis" value={summary?.lowStockCount ?? '—'} color="danger" trendLabel="Di bawah batas minimum" />
        <StatCard icon={ShipIcon} label="Proyek Kapal Aktif" value={activeProjectsCount ?? '—'} color="info" trendLabel="Sedang di drydock" />
      </div>
      <div className="dashboard-grid">
        <Card title="Tingkat Perputaran Inventaris" subtitle={`Kinerja ${rangeToDays(timeRange)} hari terakhir`} className="chart-card" action={
          <div className="time-range-btns">
            {['7D','30D','90D'].map(r => (
              <button key={r} className={`time-btn ${timeRange === r ? 'active' : ''}`} onClick={() => handleTimeRange(r)}>{r}</button>
            ))}
          </div>
        }>
          <div style={{ height: 280 }}>
            {chartLoading ? (
              <div className="chart-state">Memuat tren...</div>
            ) : chartError ? (
              <div className="chart-state">
                <span>Gagal memuat tren</span>
                <Button variant="secondary" size="sm" onClick={retryChart}>Coba lagi</Button>
              </div>
            ) : (
              <ResponsiveContainer>
                <LineChart data={chartPoints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13 }} />
                  <Legend />
                  <Line type="monotone" dataKey="inbound" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} name="Masuk" />
                  <Line type="monotone" dataKey="outbound" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} name="Keluar" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
        <Card title="Pusat Persetujuan" subtitle={`${pendingRequests.length} permintaan tertunda`} noPadding>
          {pendingRequests.length > 0
            ? <DataTable columns={approvalColumns} data={pendingRequests} searchable={false} pageSize={4} />
            : <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <CheckCircle size={32} style={{ marginBottom: 8 }} />
                <p>Semua request sudah diproses 🎉</p>
              </div>
          }
        </Card>
      </div>
      {recentApproved.length > 0 && (
        <Card title="Riwayat Approval Terbaru" subtitle="5 terakhir" className="mt-6" noPadding>
          <div style={{ padding: 0 }}>
            {recentApproved.map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {r.status === 'approved' ? <CheckCircle size={16} color="#10B981" /> : <XCircle size={16} color="#EF4444" />}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{r.requestNo} — {r.type}</div>
                    <div className="text-xs text-muted">oleh {r.requester} {r.project ? `• ${r.project}` : ''}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="text-xs text-muted">{r.date}</span>
                  <Badge variant={r.status === 'approved' ? 'success' : 'danger'}>{r.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}

function StaffDashboard() {
  const { addToast, globalSearch, setGlobalSearch } = useApp();
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    transactionsApi.list({ limit: 8 })
      .then(res => {
        if (cancelled) return;
        setRecentTx(res?.data ?? []);
      })
      .catch(err => {
        if (cancelled) return;
        setError(true);
        addToast(err instanceof ApiError ? err.message : 'Gagal memuat transaksi', 'error');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [addToast]);

  const txColumns = [
    { header: 'No.', accessor: 'transactionNo', render: (r) => <span className="font-mono text-xs">{r.transactionNo}</span> },
    { header: 'Tipe', accessor: 'type', render: (r) => (
      <Badge variant={typeBadgeVariant(r.type)}>{typeLabel(r.type)}</Badge>
    )},
    { header: 'SKU', accessor: 'sku', render: (r) => <Badge variant="sku">{r.sku}</Badge> },
    { header: 'Material', accessor: 'material' },
    { header: 'Qty', accessor: 'qty', render: (r) => <span className="font-medium">{r.qty}{r.unit ? ` ${r.unit}` : ''}</span> },
    { header: 'Tanggal', accessor: 'date', render: (r) => formatDate(r.date) },
    { header: 'Pengguna', accessor: 'user', render: (r) => r.user || '—' },
  ];

  const emptyMessage = loading
    ? 'Memuat transaksi...'
    : error
      ? 'Gagal memuat transaksi'
      : 'Belum ada transaksi';

  return (
    <>
      <div className="page-header"><h1 className="page-title">Ruang Kerja Staf Gudang</h1><p className="page-subtitle">Aksi cepat dan aktivitas terbaru</p></div>
      <div className="quick-actions">
        <a href="/inventory/goods-receipt" className="quick-action-card receipt"><ArrowDownToLine size={28} /><span>Penerimaan Barang</span></a>
        <a href="/inventory/goods-issue" className="quick-action-card issue"><ArrowUpFromLine size={28} /><span>Pengeluaran Barang</span></a>
        <a href="/inventory/scrap-return" className="quick-action-card scrap"><RotateCcw size={28} /><span>Scrap & Retur</span></a>
      </div>
      <Card title="Transaksi Terbaru" subtitle="8 transaksi terakhir" noPadding className="mt-6">
        <DataTable
          columns={txColumns}
          data={recentTx}
          pageSize={8}
          searchPlaceholder="Cari transaksi..."
          searchTerm={globalSearch}
          onSearchChange={setGlobalSearch}
          emptyMessage={emptyMessage}
        />
      </Card>
    </>
  );
}

export default function Dashboard() {
  const { role } = useApp();
  if (role === 'admin') return <AdminDashboard />;
  if (role === 'supervisor') return <SupervisorDashboard />;
  return <StaffDashboard />;
}
