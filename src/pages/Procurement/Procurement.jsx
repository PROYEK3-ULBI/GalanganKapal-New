import { useEffect, useMemo, useState } from 'react';
import { ShoppingCart, Package, CheckCircle, Clock, Eye, Plus, Building2, Edit2, Trash2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import StatCard from '../../components/ui/StatCard';
import { purchaseOrdersApi } from '../../lib/api/purchaseOrders';
import { vendorsApi } from '../../lib/api/vendors';
import { materialsApi } from '../../lib/api/materials';
import { ApiError } from '../../lib/apiClient';
import { useApp } from '../../context/AppContext';
import { canApprove } from '../../config/permissions';
import './Procurement.css';

export default function Procurement() {
  const { addToast, role, globalSearch, setGlobalSearch } = useApp();
  const canMutate = canApprove(role); // admin & supervisor can create POs

  const [activeTab, setActiveTab] = useState('orders');
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [viewPO, setViewPO] = useState(null);
  const [showNewPR, setShowNewPR] = useState(false);
  const [prForm, setPrForm] = useState({ vendorId: '', items: [], notes: '' });
  const [skuSearch, setSkuSearch] = useState('');
  const [submittingPR, setSubmittingPR] = useState(false);

  // Vendor CRUD state.
  const emptyVendorForm = { name: '', contact: '', phone: '', email: '', address: '', status: 'active' };
  const [vendorForm, setVendorForm] = useState(emptyVendorForm);
  const [vendorEditId, setVendorEditId] = useState(null);
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [savingVendor, setSavingVendor] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);
  const [deletingVendor, setDeletingVendor] = useState(false);

  // Initial load: vendors + POs in parallel.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [poRes, venRes] = await Promise.all([
          purchaseOrdersApi.list(),
          // Admin/supervisor see all vendors (including inactive) to manage them.
          // Other roles only see active vendors for PO creation purposes.
          vendorsApi.list(canMutate ? {} : { activeOnly: true }),
        ]);
        if (cancelled) return;
        setPurchaseOrders(poRes?.data ?? []);
        setVendors(venRes?.data ?? []);
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof ApiError ? err.message : 'Gagal memuat data pengadaan');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [canMutate]);

  // Lazy-load materials only when the New PR modal opens for the first time.
  useEffect(() => {
    if (!showNewPR || materials.length > 0) return;
    let cancelled = false;
    materialsApi.list()
      .then(res => { if (!cancelled) setMaterials(res?.data ?? []); })
      .catch(() => { /* silent: search will just return empty */ });
    return () => { cancelled = true; };
  }, [showNewPR, materials.length]);

  const stats = useMemo(() => {
    const total = purchaseOrders.length;
    const completed = purchaseOrders.filter(p => p.status === 'Completed').length;
    const draft = purchaseOrders.filter(p => p.status === 'Draft').length;
    return { total, completed, draft, active: total - completed - draft };
  }, [purchaseOrders]);

  const refreshPOs = async () => {
    try {
      const res = await purchaseOrdersApi.list();
      setPurchaseOrders(res?.data ?? []);
    } catch {
      // keep previous data
    }
  };

  const refreshVendors = async () => {
    try {
      const res = await vendorsApi.list(canMutate ? {} : { activeOnly: true });
      setVendors(res?.data ?? []);
    } catch {
      // keep previous data
    }
  };

  // Vendor form handlers.
  const openCreateVendor = () => {
    setVendorForm(emptyVendorForm);
    setVendorEditId(null);
    setShowVendorForm(true);
  };

  const openEditVendor = (v) => {
    setVendorForm({
      name: v.name ?? '',
      contact: v.contact ?? '',
      phone: v.phone ?? '',
      email: v.email ?? '',
      address: v.address ?? '',
      status: v.status ?? 'active',
    });
    setVendorEditId(v.id);
    setShowVendorForm(true);
  };

  const closeVendorForm = () => {
    if (savingVendor) return;
    setShowVendorForm(false);
    setVendorForm(emptyVendorForm);
    setVendorEditId(null);
  };

  const submitVendor = async () => {
    const name = vendorForm.name.trim();
    if (!name) return addToast('Nama vendor wajib diisi', 'error');
    setSavingVendor(true);
    try {
      const payload = {
        name,
        contact: vendorForm.contact.trim() || undefined,
        phone: vendorForm.phone.trim() || undefined,
        email: vendorForm.email.trim() || undefined,
        address: vendorForm.address.trim() || undefined,
        status: vendorForm.status,
      };
      if (vendorEditId) {
        await vendorsApi.update(vendorEditId, payload);
        addToast('Vendor berhasil diperbarui', 'success');
      } else {
        await vendorsApi.create(payload);
        addToast('Vendor berhasil ditambahkan', 'success');
      }
      closeVendorForm();
      await refreshVendors();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Gagal menyimpan vendor';
      addToast(msg, 'error');
    } finally {
      setSavingVendor(false);
    }
  };

  const confirmDeleteVendor = async () => {
    if (!vendorToDelete) return;
    setDeletingVendor(true);
    try {
      await vendorsApi.remove(vendorToDelete.id);
      addToast('Vendor berhasil dihapus', 'success');
      setVendorToDelete(null);
      await refreshVendors();
    } catch (err) {
      // Backend returns 409 when vendor is referenced by PO/transactions.
      const msg = err instanceof ApiError ? err.message : 'Gagal menghapus vendor';
      addToast(msg, 'error');
    } finally {
      setDeletingVendor(false);
    }
  };

  // PO Table columns.
  const poColumns = [
    { header: 'No. PO', accessor: 'poNumber', render: r => <span className="font-mono font-medium">{r.poNumber}</span> },
    { header: 'Vendor', accessor: 'vendor', render: r => <span style={{ fontWeight: 500 }}>{r.vendor}</span> },
    { header: 'Tanggal', accessor: 'date' },
    { header: 'Item', sortable: false, render: r => <span>{r.items?.length ?? 0} item</span> },
    { header: 'Status', accessor: 'status', render: r => (
      <Badge variant={r.status === 'Completed' ? 'success' : r.status === 'Partially Received' ? 'warning' : r.status === 'Cancelled' ? 'danger' : 'info'}>
        {r.status}
      </Badge>
    )},
    { header: 'Progres', sortable: false, render: r => {
      const totalOrdered = r.items?.reduce((s, i) => s + (i.ordered ?? 0), 0) ?? 0;
      const totalReceived = r.items?.reduce((s, i) => s + (i.received ?? 0), 0) ?? 0;
      const pct = totalOrdered === 0 ? 0 : Math.round((totalReceived / totalOrdered) * 100);
      return (
        <div className="progress-cell">
          <div className="progress-bar-mini"><div className="progress-fill-mini" style={{ width: `${pct}%` }} /></div>
          <span className="text-xs">{pct}%</span>
        </div>
      );
    }},
    { header: 'Aksi', sortable: false, render: r => (
      <button className="btn-icon" onClick={() => setViewPO(r)} title="Lihat Detail"><Eye size={16} /></button>
    )},
  ];

  // Vendor Table columns.
  const vendorColumns = [
    { header: 'Perusahaan', accessor: 'name', render: r => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="vendor-avatar"><Building2 size={16} /></div>
        <span style={{ fontWeight: 500 }}>{r.name}</span>
      </div>
    )},
    { header: 'Kontak', accessor: 'contact' },
    { header: 'Telepon', accessor: 'phone', render: r => <span className="font-mono">{r.phone || '—'}</span> },
    { header: 'Total PO', sortable: false, render: r => (
      <Badge variant="default">{r.poCount ?? 0} pesanan</Badge>
    )},
    { header: 'Status', accessor: 'status', render: r => (
      <Badge variant={r.status === 'active' ? 'success' : 'default'}>
        {r.status === 'active' ? 'Aktif' : 'Nonaktif'}
      </Badge>
    )},
    ...(canMutate ? [{
      header: 'Aksi', sortable: false, render: r => (
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn-icon" onClick={() => openEditVendor(r)} title="Ubah Vendor"><Edit2 size={16} /></button>
          <button className="btn-icon" onClick={() => setVendorToDelete(r)} title="Hapus Vendor"><Trash2 size={16} /></button>
        </div>
      ),
    }] : []),
  ];

  // PR creation handlers.
  const searchResults = useMemo(() => {
    if (skuSearch.length < 2) return [];
    const q = skuSearch.toLowerCase();
    return materials
      .filter(m => m.sku.toLowerCase().includes(q) || m.name.toLowerCase().includes(q))
      .slice(0, 5);
  }, [skuSearch, materials]);

  const addItemToPR = (mat) => {
    if (prForm.items.find(i => i.materialId === mat.id)) {
      addToast('Material sudah ditambahkan', 'warning');
      return;
    }
    setPrForm(p => ({
      ...p,
      items: [...p.items, {
        materialId: mat.id,
        sku: mat.sku,
        name: mat.name,
        unit: mat.unit,
        currentStock: mat.stock,
        ordered: 10,
        unitPrice: mat.price ?? 0,
      }],
    }));
    setSkuSearch('');
  };

  const updateItemQty = (materialId, qty) => {
    const value = Math.max(1, Number(qty) || 0);
    setPrForm(p => ({
      ...p,
      items: p.items.map(i => i.materialId === materialId ? { ...i, ordered: value } : i),
    }));
  };

  const removeItem = (materialId) => {
    setPrForm(p => ({ ...p, items: p.items.filter(i => i.materialId !== materialId) }));
  };

  const submitPR = async () => {
    if (!prForm.vendorId) return addToast('Pilih vendor', 'error');
    if (prForm.items.length === 0) return addToast('Tambah minimal 1 item', 'error');
    setSubmittingPR(true);
    try {
      await purchaseOrdersApi.create({
        vendorId: prForm.vendorId,
        notes: prForm.notes.trim() || undefined,
        items: prForm.items.map(i => ({
          materialId: i.materialId,
          ordered: i.ordered,
          unitPrice: i.unitPrice,
        })),
      });
      addToast('Purchase Order berhasil dibuat', 'success');
      setShowNewPR(false);
      setPrForm({ vendorId: '', items: [], notes: '' });
      await refreshPOs();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Gagal membuat PO';
      addToast(msg, 'error');
    } finally {
      setSubmittingPR(false);
    }
  };

  const emptyMessage = loading ? 'Memuat data...' : (loadError || 'Belum ada data');

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Pengadaan</h1>
          <p className="page-subtitle">Purchase order, manajemen vendor, dan pelacakan pengadaan</p>
        </div>
        {canMutate && (
          <Button variant="primary" icon={Plus} onClick={() => setShowNewPR(true)}>Buat Purchase Order</Button>
        )}
      </div>

      <div className="stats-grid">
        <StatCard icon={ShoppingCart} label="Total Purchase Order" value={stats.total} color="primary" />
        <StatCard icon={Clock} label="Pesanan Aktif" value={stats.active} color="warning" trendLabel="Menunggu pengiriman" />
        <StatCard icon={CheckCircle} label="Selesai" value={stats.completed} color="success" trendLabel="Diterima penuh" />
        <StatCard icon={Building2} label="Vendor Aktif" value={vendors.length} color="info" trendLabel="Pemasok terdaftar" />
      </div>

      <div className="tab-bar">
        <button className={`tab-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          <Package size={16} /> Purchase Order
        </button>
        <button className={`tab-item ${activeTab === 'vendors' ? 'active' : ''}`} onClick={() => setActiveTab('vendors')}>
          <Building2 size={16} /> Daftar Vendor
        </button>
      </div>

      {activeTab === 'orders' && (
        <Card noPadding>
          <DataTable
            columns={poColumns}
            data={purchaseOrders}
            searchPlaceholder="Cari nomor PO atau vendor..."
            emptyMessage={emptyMessage}
            searchTerm={globalSearch}
            onSearchChange={setGlobalSearch}
          />
        </Card>
      )}

      {activeTab === 'vendors' && (
        <>
          {canMutate && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <Button variant="primary" icon={Plus} onClick={openCreateVendor}>Tambah Vendor</Button>
            </div>
          )}
          <Card noPadding>
            <DataTable
              columns={vendorColumns}
              data={vendors}
              searchPlaceholder="Cari vendor..."
              emptyMessage={emptyMessage}
              searchTerm={globalSearch}
              onSearchChange={setGlobalSearch}
            />
          </Card>
        </>
      )}

      {/* PO Detail Modal */}
      <Modal isOpen={!!viewPO} onClose={() => setViewPO(null)} title={`Detail ${viewPO?.poNumber || ''}`} size="lg">
        {viewPO && (
          <div className="po-detail">
            <div className="detail-grid">
              <div className="detail-field"><label>No. PO</label><span className="font-mono">{viewPO.poNumber}</span></div>
              <div className="detail-field"><label>Vendor</label><span>{viewPO.vendor}</span></div>
              <div className="detail-field"><label>Tanggal</label><span>{viewPO.date}</span></div>
              <div className="detail-field"><label>Status</label>
                <Badge variant={viewPO.status === 'Completed' ? 'success' : viewPO.status === 'Cancelled' ? 'danger' : 'warning'}>
                  {viewPO.status}
                </Badge>
              </div>
              {viewPO.notes && (
                <div className="detail-field" style={{ gridColumn: '1 / -1' }}><label>Catatan</label><span>{viewPO.notes}</span></div>
              )}
            </div>
            <h4 style={{ marginTop: 20, marginBottom: 8, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>Item Pesanan</h4>
            <table className="data-table">
              <thead><tr><th>SKU</th><th>Material</th><th>Dipesan</th><th>Diterima</th><th>Satuan</th><th>Progres</th></tr></thead>
              <tbody>
                {viewPO.items.map(item => {
                  const pct = item.ordered === 0 ? 0 : Math.round((item.received / item.ordered) * 100);
                  return (
                    <tr key={item.id}>
                      <td><Badge variant="sku">{item.sku}</Badge></td>
                      <td style={{ fontWeight: 500 }}>{item.name}</td>
                      <td className="font-mono">{item.ordered}</td>
                      <td className="font-mono">{item.received}</td>
                      <td>{item.unit}</td>
                      <td>
                        <div className="progress-cell">
                          <div className="progress-bar-mini"><div className="progress-fill-mini" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--color-success)' : undefined }} /></div>
                          <span>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* New PR / PO Modal */}
      <Modal
        isOpen={showNewPR}
        onClose={() => !submittingPR && setShowNewPR(false)}
        title="Buat Purchase Order Baru"
        size="lg"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setShowNewPR(false)} disabled={submittingPR}>Batal</Button>
            <Button variant="primary" icon={ShoppingCart} onClick={submitPR} disabled={submittingPR}>
              {submittingPR ? 'Menyimpan...' : 'Simpan PO'}
            </Button>
          </>
        )}
      >
        <div className="request-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Vendor <span className="required">*</span></label>
              <select value={prForm.vendorId} onChange={e => setPrForm(p => ({ ...p, vendorId: e.target.value }))}>
                <option value="">Pilih vendor...</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Cari & Tambah Material</label>
            <div style={{ position: 'relative' }}>
              <input
                placeholder="Ketik SKU atau nama material..."
                value={skuSearch}
                onChange={e => setSkuSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
              />
              {searchResults.length > 0 && (
                <div className="search-dropdown">
                  {searchResults.map(m => (
                    <button key={m.id} className="search-result-item" onClick={() => addItemToPR(m)}>
                      <Badge variant="sku">{m.sku}</Badge>
                      <span style={{ flex: 1 }}>{m.name}</span>
                      <span className="text-xs text-muted">Stok: {m.stock}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {prForm.items.length > 0 && (
            <table className="data-table" style={{ marginTop: 12 }}>
              <thead><tr><th>SKU</th><th>Material</th><th>Stok Saat Ini</th><th>Qty Pesan</th><th>Harga Satuan</th><th></th></tr></thead>
              <tbody>
                {prForm.items.map(item => (
                  <tr key={item.materialId}>
                    <td><Badge variant="sku">{item.sku}</Badge></td>
                    <td>{item.name}</td>
                    <td>{item.currentStock} {item.unit}</td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        value={item.ordered}
                        onChange={e => updateItemQty(item.materialId, e.target.value)}
                        style={{ width: 80, padding: '6px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
                      />
                    </td>
                    <td className="font-mono">Rp {item.unitPrice.toLocaleString('id-ID')}</td>
                    <td><button type="button" className="btn-icon" onClick={() => removeItem(item.materialId)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Catatan</label>
            <textarea
              value={prForm.notes}
              onChange={e => setPrForm(p => ({ ...p, notes: e.target.value }))}
              rows={2}
              placeholder="Catatan tambahan..."
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
        </div>
      </Modal>

      {/* Vendor Form Modal (create / edit) */}
      <Modal
        isOpen={showVendorForm}
        onClose={closeVendorForm}
        title={vendorEditId ? 'Ubah Vendor' : 'Tambah Vendor Baru'}
        size="md"
        footer={(
          <>
            <Button variant="secondary" onClick={closeVendorForm} disabled={savingVendor}>Batal</Button>
            <Button variant="primary" onClick={submitVendor} disabled={savingVendor}>
              {savingVendor ? 'Menyimpan...' : vendorEditId ? 'Simpan Perubahan' : 'Simpan Vendor'}
            </Button>
          </>
        )}
      >
        <div className="request-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Nama Perusahaan <span className="required">*</span></label>
              <input
                type="text"
                value={vendorForm.name}
                onChange={e => setVendorForm(f => ({ ...f, name: e.target.value }))}
                placeholder="PT Contoh Sentosa"
              />
            </div>
            <div className="form-group">
              <label>Kontak Person</label>
              <input
                type="text"
                value={vendorForm.contact}
                onChange={e => setVendorForm(f => ({ ...f, contact: e.target.value }))}
                placeholder="Nama kontak utama"
              />
            </div>
            <div className="form-group">
              <label>Telepon</label>
              <input
                type="text"
                value={vendorForm.phone}
                onChange={e => setVendorForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="021-1234567"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={vendorForm.email}
                onChange={e => setVendorForm(f => ({ ...f, email: e.target.value }))}
                placeholder="contact@vendor.co.id"
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Alamat</label>
              <textarea
                value={vendorForm.address}
                onChange={e => setVendorForm(f => ({ ...f, address: e.target.value }))}
                rows={2}
                placeholder="Alamat lengkap vendor"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={vendorForm.status}
                onChange={e => setVendorForm(f => ({ ...f, status: e.target.value }))}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* Vendor Delete Confirmation */}
      <Modal
        isOpen={!!vendorToDelete}
        onClose={() => !deletingVendor && setVendorToDelete(null)}
        title="Hapus Vendor"
        size="sm"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setVendorToDelete(null)} disabled={deletingVendor}>Batal</Button>
            <Button variant="danger" onClick={confirmDeleteVendor} disabled={deletingVendor}>
              {deletingVendor ? 'Menghapus...' : 'Hapus'}
            </Button>
          </>
        )}
      >
        {vendorToDelete && (
          <div>
            <p>Hapus vendor <strong>{vendorToDelete.name}</strong>?</p>
            <p className="text-xs text-muted" style={{ marginTop: 8 }}>
              Vendor tidak bisa dihapus jika masih punya purchase order atau transaksi terkait.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
