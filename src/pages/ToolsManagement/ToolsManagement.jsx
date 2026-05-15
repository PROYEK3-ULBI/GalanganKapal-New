import { useEffect, useMemo, useState } from 'react';
import { Search, Wrench, MapPin, Calendar, User, AlertTriangle } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { toolsApi } from '../../lib/api/tools';
import { ApiError } from '../../lib/apiClient';
import { useApp } from '../../context/AppContext';
import './ToolsManagement.css';

const STATUS_LABELS = {
  All: 'Semua',
  Available: 'Tersedia',
  'In Use': 'Dipakai',
  Maintenance: 'Perbaikan',
};

export default function ToolsManagement() {
  const { addToast } = useApp();
  const [toolsData, setToolsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const refresh = async () => {
    try {
      const res = await toolsApi.list();
      setToolsData(res?.data ?? []);
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Gagal memuat alat', 'error');
    }
  };

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return toolsData.filter(t => {
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.sku.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [toolsData, statusFilter, search]);

  const handleCheckout = async (tool) => {
    if (actingId) return;
    setActingId(tool.id);
    try {
      await toolsApi.checkout(tool.id);
      addToast(`${tool.name} berhasil dipinjam`, 'success');
      await refresh();
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Gagal meminjam alat', 'error');
    } finally {
      setActingId(null);
    }
  };

  const handleReturn = async (tool) => {
    if (actingId) return;
    setActingId(tool.id);
    try {
      await toolsApi.returnTool(tool.id);
      addToast(`${tool.name} berhasil dikembalikan`, 'success');
      await refresh();
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Gagal mengembalikan alat', 'error');
    } finally {
      setActingId(null);
    }
  };

  // Calibration is due if it's within 30 days from today.
  const isCalibrationDue = (date) => {
    if (!date) return false;
    const due = new Date(date);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + 30);
    return due <= cutoff;
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Manajemen Alat & Peralatan</h1>
        <p className="page-subtitle">Lacak ketersediaan alat, pinjam/kembalikan, dan status kalibrasi</p>
      </div>

      <div className="tools-toolbar">
        <div className="data-table-search" style={{ width: 320 }}>
          <Search size={16} />
          <input placeholder="Cari alat..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {Object.keys(STATUS_LABELS).map(s => (
            <button
              key={s}
              className={`time-btn ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-muted" style={{ padding: 24 }}>Memuat data...</div>
      ) : filtered.length === 0 ? (
        <div className="text-muted" style={{ padding: 24 }}>Tidak ada alat yang cocok dengan filter</div>
      ) : (
        <div className="tools-grid">
          {filtered.map(tool => (
            <div key={tool.id} className="tool-card">
              <div className="tool-card-header">
                <div className="tool-icon-wrapper"><Wrench size={24} /></div>
                <Badge variant={tool.status === 'Available' ? 'success' : tool.status === 'In Use' ? 'info' : 'warning'}>
                  {tool.status}
                </Badge>
              </div>
              <h3 className="tool-name">{tool.name}</h3>
              <Badge variant="sku">{tool.sku}</Badge>
              <div className="tool-details">
                {tool.location && (
                  <div className="tool-detail-row"><MapPin size={13} /><span>{tool.location}</span></div>
                )}
                <div className="tool-detail-row">
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{tool.category}</span>
                </div>
                {tool.borrower && (
                  <div className="tool-detail-row"><User size={13} /><span>{tool.borrower}</span></div>
                )}
                {tool.calibrationDue && (
                  <div className={`tool-detail-row ${isCalibrationDue(tool.calibrationDue) ? 'calib-due' : ''}`}>
                    <Calendar size={13} />
                    <span>Cal: {tool.calibrationDue}</span>
                    {isCalibrationDue(tool.calibrationDue) && <AlertTriangle size={12} />}
                  </div>
                )}
              </div>
              <div className="tool-card-action">
                {tool.status === 'Available' && (
                  <Button variant="primary" size="sm" onClick={() => handleCheckout(tool)} disabled={actingId === tool.id}>
                    {actingId === tool.id ? 'Memproses...' : 'Pinjam'}
                  </Button>
                )}
                {tool.status === 'In Use' && (
                  <Button variant="secondary" size="sm" onClick={() => handleReturn(tool)} disabled={actingId === tool.id}>
                    {actingId === tool.id ? 'Memproses...' : 'Kembalikan'}
                  </Button>
                )}
                {tool.status === 'Maintenance' && (
                  <Button variant="ghost" size="sm" disabled>Sedang Diperbaiki</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
