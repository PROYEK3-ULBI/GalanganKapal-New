import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Users, AlertTriangle, Shield, DollarSign, ClipboardCheck, Package, Ship as ShipIcon, Activity, UserCheck, AlertCircle, ArrowDownToLine, ArrowUpFromLine, RotateCcw, Eye, Edit, Trash2, Check, X, CheckCircle, XCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import { users, transactions, activityLog, chartData } from '../../data/mockData';
import { useState } from 'react';
import './Dashboard.css';

function AdminDashboard() {
  const [userData, setUserData] = useState(users);
  const { addToast } = useApp();

  const toggleStatus = (id) => {
    setUserData(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
    addToast('User status updated', 'success');
  };

  const userColumns = [
    { header: 'Nama', accessor: 'name', render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="header-avatar" style={{ width: 28, height: 28, fontSize: 10 }}>{r.avatar}</div>
        <div><div style={{ fontWeight: 500 }}>{r.name}</div><div className="text-xs text-muted">{r.email}</div></div>
      </div>
    )},
    { header: 'Peran', accessor: 'role', render: (r) => <Badge variant={r.role === 'admin' ? 'info' : r.role === 'supervisor' ? 'warning' : 'default'}>{r.role}</Badge> },
    { header: 'Departemen', accessor: 'department' },
    { header: 'Status', accessor: 'status', render: (r) => (
      <button className={`status-toggle ${r.status}`} onClick={() => toggleStatus(r.id)}>
        <span className="status-toggle-dot" />{r.status}
      </button>
    )},
    { header: 'Login Terakhir', accessor: 'lastLogin' },
    { header: 'Aksi', sortable: false, render: (r) => (
      <div style={{ display: 'flex', gap: 4 }}>
        <button className="btn-icon"><Eye size={15} /></button>
        <button className="btn-icon"><Edit size={15} /></button>
      </div>
    )},
  ];

  return (
    <>
      <div className="page-header"><h1 className="page-title">Dashboard Admin Sistem</h1><p className="page-subtitle">Kelola pengguna, peran, dan konfigurasi sistem</p></div>
      <div className="stats-grid-3">
        <StatCard icon={Users} label="Total Pengguna Aktif" value={userData.filter(u => u.status === 'active').length} color="primary" trendLabel="dari semua pengguna" />
        <StatCard icon={AlertCircle} label="Log Error Sistem" value="3" color="danger" trendLabel="24 jam terakhir" />
        <StatCard icon={Shield} label="Persetujuan Peran Tertunda" value="12" color="warning" trendLabel="Memerlukan tindakan" />
      </div>
      <Card title="Manajemen Pengguna" subtitle="Kelola pengguna dan peran sistem" noPadding>
        <DataTable columns={userColumns} data={userData} searchPlaceholder="Cari pengguna..." pageSize={5} />
      </Card>
      <Card title="Log Aktivitas Sistem" subtitle="Kegiatan sistem terbaru" className="mt-6">
        <div className="activity-log">
          {activityLog.map(a => (
            <div key={a.id} className="activity-item">
              <div className={`status-dot ${a.type}`} />
              <div className="activity-content">
                <div className="activity-header"><span className="font-medium">{a.action}</span><span className="text-xs text-muted">{a.time}</span></div>
                <p className="text-xs text-muted">{a.detail} — by {a.user}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function SupervisorDashboard() {
  const [timeRange, setTimeRange] = useState('7D');
  const { addToast, requests, updateRequestStatus } = useApp();
  const { user } = useAuth();

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const recentApproved = requests.filter(r => r.status === 'approved' || r.status === 'rejected').slice(0, 5);

  const handleApproval = (id, action) => {
    updateRequestStatus(id, action === 'approve' ? 'approved' : 'rejected', user?.name || 'Supervisor');
    addToast(`Request ${action === 'approve' ? 'approved ✅' : 'rejected ❌'}`, action === 'approve' ? 'success' : 'warning');
  };

  const approvalColumns = [
    { header: 'Tipe', accessor: 'type', render: (r) => <Badge variant={r.type === 'Purchase Request' ? 'info' : r.type === 'Material Request' ? 'warning' : 'default'}>{r.type}</Badge> },
    { header: 'Judul', accessor: 'title', render: (r) => <span style={{ fontWeight: 500, maxWidth: 250, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</span> },
    { header: 'Pemohon', accessor: 'requester' },
    { header: 'Tanggal', accessor: 'date' },
    { header: 'Prioritas', accessor: 'priority', render: (r) => <Badge variant={r.priority === 'high' ? 'danger' : r.priority === 'medium' ? 'warning' : 'default'}>{r.priority}</Badge> },
    { header: 'Aksi', sortable: false, render: (r) => (
      <div style={{ display: 'flex', gap: 4 }}>
        <Button variant="success" size="sm" icon={Check} onClick={() => handleApproval(r.id, 'approve')}>Setujui</Button>
        <Button variant="danger" size="sm" icon={X} onClick={() => handleApproval(r.id, 'reject')}>Tolak</Button>
      </div>
    )},
  ];

  return (
    <>
      <div className="page-header"><h1 className="page-title">Ringkasan Dashboard</h1><p className="page-subtitle">Metrik inventaris galangan kapal real-time dan persetujuan tertunda</p></div>
      <div className="stats-grid">
        <StatCard icon={DollarSign} label="Total Nilai Inventaris" value="$2.4M" trend={2.4} color="primary" />
        <StatCard icon={ClipboardCheck} label="Persetujuan Tertunda" value={pendingRequests.length} color="warning" trendLabel="Memerlukan tindakan segera" />
        <StatCard icon={Package} label="Stok Kritis" value="15" color="danger" trendLabel="Di bawah batas minimum" />
        <StatCard icon={ShipIcon} label="Proyek Kapal Aktif" value="6" color="info" trendLabel="Sedang di drydock" />
      </div>
      <div className="dashboard-grid">
        <Card title="Tingkat Perputaran Inventaris" subtitle="Kinerja 30 hari terakhir" className="chart-card" action={
          <div className="time-range-btns">
            {['7D','30D','90D'].map(r => (
              <button key={r} className={`time-btn ${timeRange === r ? 'active' : ''}`} onClick={() => setTimeRange(r)}>{r}</button>
            ))}
          </div>
        }>
          <div style={{ height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={chartData.inventoryTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13 }} />
                <Legend />
                <Line type="monotone" dataKey="inbound" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} name="Masuk" />
                <Line type="monotone" dataKey="outbound" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} name="Keluar" />
              </LineChart>
            </ResponsiveContainer>
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
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{r.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="text-xs text-muted">{r.approvedDate || r.date}</span>
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
  const recentTx = transactions.slice(0, 8);
  const txColumns = [
    { header: 'ID', accessor: 'id', render: (r) => <span className="font-mono text-xs">{r.id}</span> },
    { header: 'Tipe', accessor: 'type', render: (r) => (
      <Badge variant={r.type === 'receipt' ? 'success' : r.type === 'issue' ? 'info' : 'warning'}>
        {r.type === 'receipt' ? '↓ Masuk' : r.type === 'issue' ? '↑ Keluar' : '♻ Scrap'}
      </Badge>
    )},
    { header: 'SKU', accessor: 'sku', render: (r) => <Badge variant="sku">{r.sku}</Badge> },
    { header: 'Material', accessor: 'material' },
    { header: 'Qty', accessor: 'qty', render: (r) => <span className="font-medium">{r.qty}</span> },
    { header: 'Tanggal', accessor: 'date' },
    { header: 'Pengguna', accessor: 'user' },
  ];

  return (
    <>
      <div className="page-header"><h1 className="page-title">Ruang Kerja Staf Gudang</h1><p className="page-subtitle">Aksi cepat dan aktivitas terbaru</p></div>
      <div className="quick-actions">
        <a href="/inventory/goods-receipt" className="quick-action-card receipt"><ArrowDownToLine size={28} /><span>Penerimaan Barang</span></a>
        <a href="/inventory/goods-issue" className="quick-action-card issue"><ArrowUpFromLine size={28} /><span>Pengeluaran Barang</span></a>
        <a href="/inventory/scrap-return" className="quick-action-card scrap"><RotateCcw size={28} /><span>Scrap & Retur</span></a>
      </div>
      <Card title="Transaksi Terbaru" subtitle="10 transaksi terakhir" noPadding className="mt-6">
        <DataTable columns={txColumns} data={recentTx} pageSize={8} searchPlaceholder="Cari transaksi..." />
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
