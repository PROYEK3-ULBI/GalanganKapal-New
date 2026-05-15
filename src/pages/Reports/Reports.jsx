import { useState } from 'react';
import { FileBarChart, Download, TrendingUp, Package, DollarSign, BarChart3, PieChart as PieIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import StatCard from '../../components/ui/StatCard';
import DataTable from '../../components/ui/DataTable';
import { materials, transactions, projects } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import './Reports.css';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function Reports() {
  const { addToast } = useApp();
  const [activeReport, setActiveReport] = useState('stock-summary');

  // Stock Summary data
  const totalValue = materials.reduce((s, m) => s + (m.stock * m.price), 0);
  const lowStockItems = materials.filter(m => m.stock <= m.minStock);
  const outOfStock = materials.filter(m => m.stock === 0);
  const totalItems = materials.reduce((s, m) => s + m.stock, 0);

  // Category breakdown
  const categoryBreakdown = {};
  materials.forEach(m => {
    if (!categoryBreakdown[m.category]) categoryBreakdown[m.category] = { category: m.category, items: 0, value: 0, qty: 0 };
    categoryBreakdown[m.category].items++;
    categoryBreakdown[m.category].value += m.stock * m.price;
    categoryBreakdown[m.category].qty += m.stock;
  });
  const categoryData = Object.values(categoryBreakdown).sort((a, b) => b.value - a.value);
  const pieData = categoryData.map(c => ({ name: c.category, value: c.qty }));

  // Transaction summary per type
  const receiptCount = transactions.filter(t => t.type === 'receipt').length;
  const issueCount = transactions.filter(t => t.type === 'issue').length;
  const scrapCount = transactions.filter(t => t.type === 'scrap').length;
  const txBarData = [
    { type: 'Penerimaan', count: receiptCount, fill: '#10B981' },
    { type: 'Pengeluaran', count: issueCount, fill: '#3B82F6' },
    { type: 'Scrap', count: scrapCount, fill: '#F59E0B' },
  ];

  // Project consumption
  const projectConsumption = {};
  transactions.filter(t => t.project).forEach(t => {
    if (!projectConsumption[t.project]) projectConsumption[t.project] = { project: t.project, totalQty: 0, txCount: 0 };
    projectConsumption[t.project].totalQty += t.qty;
    projectConsumption[t.project].txCount++;
  });
  const projectData = Object.values(projectConsumption);
  const projName = (id) => { const p = projects.find(p => p.id === id); return p ? p.name : id; };

  // Stock valuation table
  const stockColumns = [
    { header: 'SKU', accessor: 'sku', render: r => <Badge variant="sku">{r.sku}</Badge> },
    { header: 'Material', accessor: 'name', render: r => <span style={{ fontWeight: 500 }}>{r.name}</span> },
    { header: 'Kategori', accessor: 'category', render: r => <Badge variant="default">{r.category}</Badge> },
    { header: 'Stok', accessor: 'stock', render: r => <span className="font-mono">{r.stock} {r.unit}</span> },
    { header: 'Harga Satuan', render: r => <span className="font-mono">Rp {r.price.toLocaleString('id-ID')}</span> },
    { header: 'Nilai Total', render: r => <span className="font-mono font-medium">Rp {(r.stock * r.price).toLocaleString('id-ID')}</span> },
    { header: 'Status', accessor: 'status', render: r => (
      <Badge variant={r.status === 'In Stock' ? 'success' : r.status === 'Low Stock' ? 'warning' : 'danger'}>{r.status}</Badge>
    )},
  ];

  const handleExport = (format) => {
    addToast(`Laporan berhasil di-export sebagai ${format}! (Demo)`, 'success');
  };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Laporan & Analitik</h1>
          <p className="page-subtitle">Valuasi inventaris, analitik konsumsi, dan laporan operasional</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" icon={Download} onClick={() => handleExport('PDF')}>Ekspor PDF</Button>
          <Button variant="secondary" icon={Download} onClick={() => handleExport('Excel')}>Ekspor Excel</Button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon={DollarSign} label="Total Nilai Inventaris" value={`Rp ${(totalValue / 1e9).toFixed(1)}B`} color="primary" />
        <StatCard icon={Package} label="Total Item Stok" value={totalItems.toLocaleString()} color="info" trendLabel={`${materials.length} material`} />
        <StatCard icon={TrendingUp} label="Peringatan Stok Rendah" value={lowStockItems.length} color="warning" trendLabel="Perlu reorder" />
        <StatCard icon={BarChart3} label="Stok Habis" value={outOfStock.length} color="danger" trendLabel="Perhatian segera" />
      </div>

      {/* Report Tabs */}
      <div className="tab-bar">
        {[
          { id: 'stock-summary', label: 'Valuasi Stok', icon: DollarSign },
          { id: 'category', label: 'Rincian Kategori', icon: PieIcon },
          { id: 'transactions', label: 'Ringkasan Transaksi', icon: BarChart3 },
          { id: 'project', label: 'Konsumsi Proyek', icon: FileBarChart },
        ].map(tab => (
          <button key={tab.id} className={`tab-item ${activeReport === tab.id ? 'active' : ''}`} onClick={() => setActiveReport(tab.id)}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {activeReport === 'stock-summary' && (
        <Card title="Laporan Valuasi Stok" subtitle="Nilai inventaris saat ini per material" noPadding>
          <DataTable columns={stockColumns} data={materials} searchPlaceholder="Cari material..." pageSize={8} />
        </Card>
      )}

      {activeReport === 'category' && (
        <div className="report-grid">
          <Card title="Distribusi Kategori" subtitle="Kuantitas stok per kategori">
            <div style={{ height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(val) => [val + ' unit', 'Kuantitas']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card title="Rincian Nilai Kategori" noPadding>
            <table className="data-table">
              <thead><tr><th>Kategori</th><th>Material</th><th>Qty</th><th>Nilai Total</th></tr></thead>
              <tbody>
                {categoryData.map(c => (
                  <tr key={c.category}>
                    <td style={{ fontWeight: 500 }}>{c.category}</td>
                    <td className="font-mono">{c.items}</td>
                    <td className="font-mono">{c.qty.toLocaleString()}</td>
                    <td className="font-mono">Rp {c.value.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {activeReport === 'transactions' && (
        <div className="report-grid">
          <Card title="Ringkasan Tipe Transaksi" subtitle="Total transaksi berdasarkan tipe">
            <div style={{ height: 300 }}>
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
            </div>
          </Card>
          <Card title="Transaksi Terbaru" noPadding>
            <table className="data-table">
              <thead><tr><th>ID</th><th>Tipe</th><th>Material</th><th>Qty</th><th>Tanggal</th></tr></thead>
              <tbody>
                {transactions.slice(0, 8).map(t => (
                  <tr key={t.id}>
                    <td className="font-mono text-xs">{t.id}</td>
                    <td><Badge variant={t.type === 'receipt' ? 'success' : t.type === 'issue' ? 'info' : 'warning'}>{t.type}</Badge></td>
                    <td>{t.material}</td>
                    <td className="font-mono">{t.qty}</td>
                    <td className="text-xs">{t.date}</td>
                  </tr>
                ))}
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
              {projectData.map(p => (
                <tr key={p.project}>
                  <td><Badge variant="sku">{p.project}</Badge></td>
                  <td style={{ fontWeight: 500 }}>{projName(p.project)}</td>
                  <td className="font-mono">{p.txCount}</td>
                  <td className="font-mono font-medium">{p.totalQty.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
