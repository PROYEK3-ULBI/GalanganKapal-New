import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, AlertTriangle, Filter } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { materialsApi } from '../../lib/api/materials';
import { ApiError } from '../../lib/apiClient';
import { useApp } from '../../context/AppContext';
import { canEditModule, canDelete as canDeleteCheck } from '../../config/permissions';
import './MasterData.css';

const ALL_CATEGORIES = 'All Categories';

export default function MasterMaterialCatalog() {
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([ALL_CATEGORIES]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES);
  const [hazmatOnly, setHazmatOnly] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const { addToast, role } = useApp();
  const navigate = useNavigate();
  const canEdit = canEditModule(role, 'master-data');
  const canDel = canDeleteCheck(role);

  // Reload materials whenever filters change.
  useEffect(() => {
    let cancelled = false;
    async function fetchMaterials() {
      setLoading(true);
      setLoadError('');
      try {
        const res = await materialsApi.list({
          category: categoryFilter === ALL_CATEGORIES ? undefined : categoryFilter,
          hazmat: hazmatOnly,
        });
        if (!cancelled) setMaterials(res?.data ?? []);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof ApiError ? err.message : 'Gagal memuat data material';
        setLoadError(msg);
        setMaterials([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchMaterials();
    return () => { cancelled = true; };
  }, [categoryFilter, hazmatOnly]);

  // Fetch category list once on mount.
  useEffect(() => {
    let cancelled = false;
    materialsApi.categories()
      .then(res => {
        if (cancelled) return;
        const cats = res?.data ?? [];
        setCategories([ALL_CATEGORIES, ...cats]);
      })
      .catch(() => { /* fall back to default */ });
    return () => { cancelled = true; };
  }, []);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await materialsApi.remove(deleteModal.id);
      setMaterials(prev => prev.filter(m => m.id !== deleteModal.id));
      addToast(`${deleteModal.name} telah dihapus`, 'success');
      setDeleteModal(null);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Gagal menghapus material';
      addToast(msg, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { header: 'SKU', accessor: 'sku', width: '160px', render: (r) => <Badge variant="sku">{r.sku}</Badge> },
    { header: 'Nama Item', accessor: 'name', render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontWeight: 500 }}>{r.name}</span>
        {r.hazmat && <span title="Material HAZMAT" style={{ cursor: 'pointer' }}><AlertTriangle size={14} color="#F97316" /></span>}
      </div>
    )},
    { header: 'Kategori', accessor: 'category' },
    { header: 'Stok', accessor: 'stock', render: (r) => <span className="font-medium">{r.stock} {r.unit}</span> },
    { header: 'Stok Min', accessor: 'minStock' },
    { header: 'Status', accessor: 'status', render: (r) => (
      <Badge variant={r.status === 'In Stock' ? 'success' : r.status === 'Low Stock' ? 'warning' : 'danger'}>{r.status}</Badge>
    )},
    { header: 'Lokasi', accessor: 'location' },
    { header: 'Aksi', sortable: false, width: '120px', render: (r) => (
      <div style={{ display: 'flex', gap: 4 }}>
        <button className="btn-icon" onClick={() => setViewModal(r)}><Eye size={15} /></button>
        {canEdit && <button className="btn-icon" onClick={() => navigate(`/master-data/${r.id}/edit`)}><Edit size={15} /></button>}
        {canDel && <button className="btn-icon" style={{ color: 'var(--color-danger)' }} onClick={() => setDeleteModal(r)}><Trash2 size={15} /></button>}
      </div>
    )},
  ];

  const emptyMessage = loading
    ? 'Memuat data...'
    : loadError
      ? loadError
      : 'Tidak ada material yang sesuai dengan filter';

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1 className="page-title">Katalog Material Master</h1><p className="page-subtitle">Kelola dan lacak semua item standar di galangan kapal</p></div>
        {canEdit && <Button variant="primary" icon={Plus} onClick={() => navigate('/master-data/new')}>Tambah Material Baru</Button>}
      </div>

      <Card noPadding>
        <div className="catalog-filters">
          <div className="filter-group">
            <Filter size={16} />
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <label className="filter-checkbox">
            <input type="checkbox" checked={hazmatOnly} onChange={e => setHazmatOnly(e.target.checked)} />
            <AlertTriangle size={14} color="#F97316" />
            <span>Hanya HAZMAT</span>
          </label>
        </div>
        <DataTable
          columns={columns}
          data={materials}
          searchPlaceholder="Cari berdasarkan SKU, nama, atau kategori..."
          pageSize={10}
          emptyMessage={emptyMessage}
        />
      </Card>

      <Modal
        isOpen={!!deleteModal}
        onClose={() => !deleting && setDeleteModal(null)}
        title="Konfirmasi Hapus"
        size="sm"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setDeleteModal(null)} disabled={deleting}>Batal</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>{deleting ? 'Menghapus...' : 'Hapus'}</Button>
          </>
        )}
      >
        <p>Apakah Anda yakin ingin menghapus <strong>{deleteModal?.name}</strong>?</p>
        <p className="text-sm text-muted" style={{ marginTop: 8 }}>Tindakan ini tidak dapat dibatalkan.</p>
      </Modal>

      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Detail Material" size="lg">
        {viewModal && (
          <div className="material-detail">
            <div className="detail-grid">
              <div className="detail-field"><label>SKU</label><Badge variant="sku">{viewModal.sku}</Badge></div>
              <div className="detail-field"><label>Nama</label><span>{viewModal.name}</span></div>
              <div className="detail-field"><label>Kategori</label><span>{viewModal.category}</span></div>
              <div className="detail-field"><label>Satuan</label><span>{viewModal.unit}</span></div>
              <div className="detail-field"><label>Stok Saat Ini</label><span className="font-medium">{viewModal.stock}</span></div>
              <div className="detail-field"><label>Stok Min</label><span>{viewModal.minStock}</span></div>
              <div className="detail-field"><label>Titik Reorder</label><span>{viewModal.reorderPoint}</span></div>
              <div className="detail-field"><label>Lokasi</label><span>{viewModal.location || '—'}</span></div>
              <div className="detail-field"><label>Nomor Heat</label><span className="font-mono">{viewModal.heatNumber || '—'}</span></div>
              <div className="detail-field"><label>HAZMAT</label>{viewModal.hazmat ? <Badge variant="hazmat">HAZMAT</Badge> : <span>Tidak</span>}</div>
              <div className="detail-field"><label>Status</label><Badge variant={viewModal.status === 'In Stock' ? 'success' : viewModal.status === 'Low Stock' ? 'warning' : 'danger'}>{viewModal.status}</Badge></div>
              <div className="detail-field"><label>Harga</label><span>Rp {viewModal.price?.toLocaleString('id-ID')}</span></div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
