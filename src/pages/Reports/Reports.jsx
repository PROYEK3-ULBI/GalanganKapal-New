import { useEffect, useState } from 'react';
import { FileBarChart, Download, TrendingUp, Package, DollarSign, BarChart3, PieChart as PieIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import StatCard from '../../components/ui/StatCard';
import DataTable from '../../components/ui/DataTable';
import { reportsApi } from '../../lib/api/reports';
import { transactionsApi } from '../../lib/api/transactions';
import { ApiError } from '../../lib/apiClient';
import { useApp } from '../../context/AppContext';
import { exportTabAsPDF, exportTabAsExcel } from './exportHelpers';
import './Reports.css';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// Format a large IDR amount as 'Rp X.XB' / 'Rp X.XM' / 'Rp X.XK'.
function formatIDRCompact(value) {
  if (!value || value < 1000) return `Rp ${(value || 0).toLocaleString('id-ID')}`;
  if (value >= 1e9) return `Rp ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `Rp ${(value / 1e6).toFixed(1)}M`;
  return `Rp ${(value / 1000).toFixed(1)}K`;
}

const TYPE_FILL = {
  receipt: '#10B981',
  issue:   '#3B82F6',
  scrap:   '#F59E0B',
  return:  '#8B5CF6',
};

export default function Reports() {
  const { addToast, globalSearch, setGlobalSearch } = useApp();
  const [activeReport, setActiveReport] = useState('stock-summary');

  // Data state for each report.
  const [summary, setSummary] = useState(null);
  const [stockValuation, setStockValuation] = useState([]);
  const [categories, setCategories] = useState([]);
  const [txSummary, setTxSummary] = useState([]);
  const [recentTx, setRecentTx] = useState([]);
  const [projectConsumption, setProjectConsumption] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      reportsApi.summary(),
      reportsApi.stockValuation(),
      reportsApi.categoryBreakdown(),
      reportsApi.transactionSummary(),
      reportsApi.projectConsumption(),
      transactionsApi.list({ limit: 8 }),
    ])
      .then(([s, sv, cb, ts, pc, tx]) => {
        if (cancelled) return;
        setSummary(s);
        setStockValuation(sv?.data ?? []);
        setCategories(cb?.data ?? []);
        setTxSummary(ts?.data ?? []);
        setProjectConsumption(pc?.data ?? []);
        setRecentTx(tx?.data ?? []);
      })
      .catch(err => {
        if (cancelled) return;
        addToast(err instanceof ApiError ? err.message : 'Gagal memuat laporan', 'error');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [addToast]);

  // Derived chart data.
  const pieData = categories.map(c => ({ name: c.category, value: c.qty }));
  const txBarData = txSummary.map(t => ({
    type: t.label,
    count: t.count,
    fill: TYPE_FILL[t.type] || '#94A3B8',
  }));

  const stockColumns = [
    { header: 'SKU', accessor: 'sku', render: r => <Badge variant="sku">{r.sku}</Badge> },
    { header: 'Material', accessor: 'name', render: r => <span style={{ fontWeight: 500 }}>{r.name}</span> },
    { header: 'Kategori', accessor: 'category', render: r => <Badge variant="default">{r.category}</Badge> },
    { header: 'Stok', accessor: 'stock', render: r => <span className="font-mono">{r.stock} {r.unit}</span> },
    { header: 'Harga Satuan', accessor: 'price', render: r => <span className="font-mono">Rp {r.price.toLocaleString('id-ID')}</span> },
    { header: 'Nilai Total', accessor: 'totalValue', render: r => <span className="font-mono font-medium">Rp {r.totalValue.toLocaleString('id-ID')}</span> },
    { header: 'Status', accessor: 'status', render: r => (
      <Badge variant={r.status === 'In Stock' ? 'success' : r.status === 'Low Stock' ? 'warning' : 'danger'}>{r.status}</Badge>
    )},
  ];

  const handleExport = async (format) => {
    if (exporting || loading) return;
    setExporting(true);
    const payload = {
      stockValuation,
      categories,
      txSummary,
      recentTx,
      projectConsumption,
    };
    try {
      if (format === 'PDF') {
        await exportTabAsPDF(activeReport, payload, addToast);
      } else {
        await exportTabAsExcel(activeReport, payload, addToast);
      }
    } catch (err) {
      // Helper already toasts a friendly message; this catch prevents
      // unhandled promise rejections from leaking to the console.
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Laporan & Analitik</h1>
          <p className="page-subtitle">Valuasi inventaris, analitik konsumsi, dan laporan operasional</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" icon={Download} disabled={loading || exporting} onClick={() => handleExport('PDF')}>Ekspor PDF</Button>
          <Button variant="secondary" icon={Download} disabled={loading || exporting} onClick={() => handleExport('Excel')}>Ekspor Excel</Button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={DollarSign}
          label="Total Nilai Inventaris"
          value={summary ? formatIDRCompact(summary.totalInventoryValue) : '—'}
          color="primary"
        />
        <StatCard
          icon={Package}
          label="Total Item Stok"
          value={summary?.totalItems?.toLocaleString('id-ID') ?? '—'}
          color="info"
          trendLabel={summary ? `${summary.materialCount} material` : undefined}
        />
        <StatCard
          icon={TrendingUp}
          label="Peringatan Stok Rendah"
          value={summary?.lowStockCount ?? 0}
          color="warning"
          trendLabel="Perlu reorder"
        />
        <StatCard
          icon={BarChart3}
          label="Stok Habis"
          value={summary?.outOfStockCount ?? 0}
          color="danger"
          trendLabel="Perhatian segera"
        />
      </div>

      <div className="tab-bar">
        {[
          { id: 'stock-summary', label: 'Valuasi Stok', icon: DollarSign },
          { id: 'category', label: 'Rincian Kategori', icon: PieIcon },
          { id: 'transactions', label: 'Ringkasan Transaksi', icon: BarChart3 },
          { id: 'project', label: 'Konsumsi Proyek', icon: FileBarChart },
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab-item ${activeReport === tab.id ? 'active' : ''}`}
            onClick={() => setActiveReport(tab.id)}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {activeReport === 'stock-summary' && (
        <Card title="Laporan Valuasi Stok" subtitle="Nilai inventaris saat ini per material" noPadding>
          <DataTable
            columns={stockColumns}
            data={stockValuation}
            searchPlaceholder="Cari material..."
            pageSize={8}
            emptyMessage={loading ? 'Memuat data...' : 'Tidak ada data'}
            searchTerm={globalSearch}
            onSearchChange={setGlobalSearch}
          />
        </Card>
      )}

      {activeReport === 'category' && (
        <div className="report-grid">
          <Card title="Distribusi Kategori" subtitle="Kuantitas stok per kategori">
            <div style={{ height: 300 }}>
              {pieData.length === 0 ? (
                <div className="text-muted" style={{ padding: 40, textAlign: 'center' }}>
                  {loading ? 'Memuat data...' : 'Belum ada data kategori'}
                </div>
              ) : (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(val) => [`${val} unit`, 'Kuantitas']} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
          <Card title="Rincian Nilai Kategori" noPadding>
            <table className="data-table">
              <thead><tr><th>Kategori</th><th>Material</th><th>Qty</th><th>Nilai Total</th></tr></thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr><td colSpan={4} className="text-muted" style={{ padding: 24, textAlign: 'center' }}>{loading ? 'Memuat...' : 'Belum ada data'}</td></tr>
                ) : (
                  categories.map(c => (
                    <tr key={c.category}>
                      <td style={{ fontWeight: 500 }}>{c.category}</td>
                      <td className="font-mono">{c.items}</td>
                      <td className="font-mono">{c.qty.toLocaleString('id-ID')}</td>
                      <td className="font-mono">Rp {c.value.toLocaleString('id-ID')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {activeReport === 'transactions' && (
        <div className="report-grid">
          <Card title="Ringkasan Tipe Transaksi" subtitle="Total transaksi berdasarkan tipe">
            <div style={{ height: 300 }}>
              {txBarData.length === 0 ? (
                <div className="text-muted" style={{ padding: 40, textAlign: 'center' }}>
                  {loading ? 'Memuat data...' : 'Belum ada transaksi'}
                </div>
              ) : (
                <ResponsiveContainer>
                  <BarChart data={txBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="type" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="Transaksi" radius={[6, 6, 0, 0]}>
                      {txBarData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
          <Card title="Transaksi Terbaru" noPadding>
            <table className="data-table">
              <thead><tr><th>No.</th><th>Tipe</th><th>Material</th><th>Qty</th><th>Tanggal</th></tr></thead>
              <tbody>
                {recentTx.length === 0 ? (
                  <tr><td colSpan={5} className="text-muted" style={{ padding: 24, textAlign: 'center' }}>{loading ? 'Memuat...' : 'Belum ada transaksi'}</td></tr>
                ) : (
                  recentTx.map(t => (
                    <tr key={t.id}>
                      <td className="font-mono text-xs">{t.transactionNo}</td>
                      <td>
                        <Badge variant={t.type === 'receipt' ? 'success' : t.type === 'issue' ? 'info' : 'warning'}>
                          {t.type}
                        </Badge>
                      </td>
                      <td>{t.material}</td>
                      <td className="font-mono">{t.qty}</td>
                      <td className="text-xs">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {activeReport === 'project' && (
        <Card title="Konsumsi Material per Proyek" subtitle="Pelacakan penggunaan material di seluruh proyek kapal" noPadding>
          <table className="data-table">
            <thead><tr><th>Proyek</th><th>Nama Proyek</th><th>Transaksi</th><th>Total Qty Digunakan</th></tr></thead>
            <tbody>
              {projectConsumption.length === 0 ? (
                <tr><td colSpan={4} className="text-muted" style={{ padding: 24, textAlign: 'center' }}>{loading ? 'Memuat...' : 'Belum ada konsumsi material'}</td></tr>
              ) : (
                projectConsumption.map(p => (
                  <tr key={p.projectId}>
                    <td><Badge variant="sku">{p.project}</Badge></td>
                    <td style={{ fontWeight: 500 }}>{p.projectName}</td>
                    <td className="font-mono">{p.txCount}</td>
                    <td className="font-mono font-medium">{p.totalQty.toLocaleString('id-ID')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
