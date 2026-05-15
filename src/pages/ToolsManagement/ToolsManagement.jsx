import { useState } from 'react';
import { Search, Wrench, MapPin, Calendar, User, AlertTriangle } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { tools as initialTools } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import './ToolsManagement.css';

export default function ToolsManagement() {
  const [toolsData, setToolsData] = useState(initialTools);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const { addToast } = useApp();

  const filtered = toolsData.filter(t => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.sku.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCheckout = (id) => {
    setToolsData(prev => prev.map(t => t.id === id ? { ...t, status: 'In Use', borrower: 'Current User', borrowDate: '2026-05-02' } : t));
    addToast('Alat berhasil dipinjam', 'success');
  };

  const handleReturn = (id) => {
    setToolsData(prev => prev.map(t => t.id === id ? { ...t, status: 'Available', borrower: null, borrowDate: null } : t));
    addToast('Alat berhasil dikembalikan', 'success');
  };

  const isCalibrationDue = (date) => {
    if (!date) return false;
    return new Date(date) <= new Date('2026-05-15');
  };

  return (
    <>
      <div className="page-header"><h1 className="page-title">Manajemen Alat & Peralatan</h1><p className="page-subtitle">Lacak ketersediaan alat, pinjam/kembalikan, dan status kalibrasi</p></div>
      <div className="tools-toolbar">
        <div className="data-table-search" style={{ width: 320 }}><Search size={16} /><input placeholder="Cari alat..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['All', 'Available', 'In Use', 'Maintenance'].map(s => {
            const labelMap = { 'All': 'Semua', 'Available': 'Tersedia', 'In Use': 'Dipakai', 'Maintenance': 'Perbaikan' };
            return <button key={s} className={`time-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>{labelMap[s]}</button>;
          })}
        </div>
      </div>
      <div className="tools-grid">
        {filtered.map(tool => (
          <div key={tool.id} className="tool-card">
            <div className="tool-card-header">
              <div className="tool-icon-wrapper"><Wrench size={24} /></div>
              <Badge variant={tool.status === 'Available' ? 'success' : tool.status === 'In Use' ? 'info' : 'warning'}>{tool.status}</Badge>
            </div>
            <h3 className="tool-name">{tool.name}</h3>
            <Badge variant="sku">{tool.sku}</Badge>
            <div className="tool-details">
              <div className="tool-detail-row"><MapPin size={13} /><span>{tool.location}</span></div>
              <div className="tool-detail-row"><span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{tool.category}</span></div>
              {tool.borrower && <div className="tool-detail-row"><User size={13} /><span>{tool.borrower}</span></div>}
              {tool.calibrationDue && (
                <div className={`tool-detail-row ${isCalibrationDue(tool.calibrationDue) ? 'calib-due' : ''}`}>
                  <Calendar size={13} />
                  <span>Cal: {tool.calibrationDue}</span>
                  {isCalibrationDue(tool.calibrationDue) && <AlertTriangle size={12} />}
                </div>
              )}
            </div>
            <div className="tool-card-action">
              {tool.status === 'Available' && <Button variant="primary" size="sm" onClick={() => handleCheckout(tool.id)}>Pinjam</Button>}
              {tool.status === 'In Use' && <Button variant="secondary" size="sm" onClick={() => handleReturn(tool.id)}>Kembalikan</Button>}
              {tool.status === 'Maintenance' && <Button variant="ghost" size="sm" disabled>Sedang Diperbaiki</Button>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
