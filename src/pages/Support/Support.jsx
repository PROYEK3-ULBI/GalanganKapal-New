import { useEffect, useState } from 'react';
import { HelpCircle, Book, MessageCircle, ChevronDown, ChevronUp, Search, Mail, Phone, ExternalLink, Ship, Clock, CheckCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { supportApi } from '../../lib/api/support';
import { ApiError } from '../../lib/apiClient';
import { useApp } from '../../context/AppContext';
import './Support.css';

// FAQ stays static — content is documentation, not data. Simpler to keep on
// the client and avoid needing a backend table for it.
const faqData = [
  { q: 'Bagaimana cara menambah material baru?', a: 'Login sebagai Admin → buka Master Data → klik "Add New Material" → isi form lengkap (SKU akan otomatis di-generate) → klik Save.' },
  { q: 'Bagaimana cara menerima barang (Goods Receipt)?', a: 'Buka Inventory Operations → Goods Receipt → pilih PO dari dropdown → input jumlah yang diterima per item → klik Confirm Receipt.' },
  { q: 'Bagaimana cara mengeluarkan material ke proyek?', a: 'Buka Goods Issue → cari material → set jumlah yang diminta → pilih proyek tujuan → klik Submit Issue. Sistem akan validasi stok otomatis.' },
  { q: 'Apa itu Heat Number dan kenapa penting?', a: 'Heat Number adalah nomor batch produksi dari pabrik baja. Ini wajib untuk material yang butuh sertifikasi (BKI/Class). Heat Number memungkinkan traceability penuh dari pabrik hingga ke posisi pemasangan di kapal.' },
  { q: 'Bagaimana cara mengajukan Material Request?', a: 'Login sebagai Staff → buka Material Request → klik "Buat Request Baru" → pilih material, qty, proyek, dan alasan → Kirim. Supervisor akan menerima request di Approval Center.' },
  { q: 'Kenapa saya tidak bisa akses Master Data?', a: 'Akses Master Data hanya tersedia untuk role Admin (full CRUD) dan Supervisor (read-only). Staff tidak memiliki akses ke halaman ini. Hubungi Admin jika perlu perubahan role.' },
  { q: 'Bagaimana cara meminjam alat?', a: 'Buka Tools Management → cari alat yang tersedia (status "Available") → klik "Pinjam" → Confirm. Ingat untuk mengembalikan tepat waktu.' },
  { q: 'Apa yang terjadi jika stok di bawah minimum?', a: 'Sistem akan menampilkan alert di notifikasi dan material akan ditandai sebagai "Low Stock" (kuning) atau "Out of Stock" (merah). Supervisor harus segera membuat Purchase Request.' },
];

const guides = [
  { title: 'Panduan Admin', desc: 'Manajemen user, master data, dan konfigurasi sistem', role: 'Admin' },
  { title: 'Panduan Supervisor', desc: 'Approval workflow, monitoring KPI, dan laporan', role: 'Supervisor' },
  { title: 'Panduan Staff', desc: 'Goods receipt/issue, material request, dan tools', role: 'Staff' },
  { title: 'Panduan Traceability', desc: 'Pelacakan heat number dan sertifikasi material', role: 'All' },
  { title: 'Panduan Procurement', desc: 'Purchase request, PO tracking, dan vendor management', role: 'Admin' },
  { title: 'Panduan Inventory', desc: 'Stok, minimum stock, reorder point, dan stock opname', role: 'All' },
];

const PRIORITY_LABELS = { low: 'Rendah', medium: 'Sedang', high: 'Tinggi' };
const STATUS_LABELS = { open: 'Terbuka', in_progress: 'Diproses', resolved: 'Selesai', closed: 'Ditutup' };

function statusVariant(status) {
  switch (status) {
    case 'resolved': return 'success';
    case 'in_progress': return 'info';
    case 'closed': return 'default';
    default: return 'warning';
  }
}

function priorityVariant(p) {
  if (p === 'high') return 'danger';
  if (p === 'medium') return 'warning';
  return 'default';
}

export default function Support() {
  const { addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [contactForm, setContactForm] = useState({ subject: '', message: '', priority: 'medium' });
  const [submitting, setSubmitting] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  // Load own tickets on mount.
  useEffect(() => {
    let cancelled = false;
    supportApi.list()
      .then(res => { if (!cancelled) setTickets(res?.data ?? []); })
      .catch(err => {
        if (!cancelled) addToast(err instanceof ApiError ? err.message : 'Gagal memuat tiket', 'error');
      })
      .finally(() => { if (!cancelled) setLoadingTickets(false); });
    return () => { cancelled = true; };
  }, [addToast]);

  const refreshTickets = async () => {
    try {
      const res = await supportApi.list();
      setTickets(res?.data ?? []);
    } catch { /* non-fatal */ }
  };

  const filteredFaq = searchTerm
    ? faqData.filter(f =>
        f.q.toLowerCase().includes(searchTerm.toLowerCase())
        || f.a.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : faqData;

  const handleSubmitTicket = async () => {
    if (submitting) return;
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      return addToast('Isi subjek dan pesan', 'error');
    }
    setSubmitting(true);
    try {
      const created = await supportApi.submit({
        subject: contactForm.subject.trim(),
        message: contactForm.message.trim(),
        priority: contactForm.priority,
      });
      addToast(`Tiket ${created.ticketNo} berhasil dikirim`, 'success');
      setContactForm({ subject: '', message: '', priority: 'medium' });
      await refreshTickets();
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Gagal mengirim tiket', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Bantuan & Dukungan</h1>
        <p className="page-subtitle">Dokumentasi, FAQ, dan hubungi dukungan</p>
      </div>

      <div className="support-search">
        <Search size={20} />
        <input
          placeholder="Cari pertanyaan atau topik bantuan..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="support-grid">
        <div>
          <Card title="Pertanyaan yang Sering Diajukan" subtitle={`${filteredFaq.length} pertanyaan`}>
            <div className="faq-list">
              {filteredFaq.map((faq, i) => (
                <div key={i} className={`faq-item ${expandedFaq === i ? 'expanded' : ''}`}>
                  <button className="faq-question" onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}>
                    <HelpCircle size={18} />
                    <span>{faq.q}</span>
                    {expandedFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {expandedFaq === i && <div className="faq-answer">{faq.a}</div>}
                </div>
              ))}
            </div>
          </Card>

          {/* Existing tickets list */}
          <Card title="Tiket Saya" subtitle={loadingTickets ? 'Memuat...' : `${tickets.length} tiket tercatat`} className="mt-6">
            {tickets.length === 0 ? (
              <div className="text-muted" style={{ padding: 16, textAlign: 'center' }}>
                {loadingTickets ? 'Memuat tiket...' : 'Belum ada tiket yang dikirim'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {tickets.map(t => (
                  <div key={t.id} style={{ padding: 12, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.ticketNo}</span>
                          <Badge variant={priorityVariant(t.priority)}>{PRIORITY_LABELS[t.priority] || t.priority}</Badge>
                          <Badge variant={statusVariant(t.status)}>
                            {t.status === 'resolved' ? <CheckCircle size={12} /> : <Clock size={12} />}{' '}
                            {STATUS_LABELS[t.status] || t.status}
                          </Badge>
                        </div>
                        <div style={{ fontWeight: 500 }}>{t.subject}</div>
                        <p className="text-xs text-muted" style={{ marginTop: 4 }}>{t.message}</p>
                        {t.response && (
                          <div style={{ marginTop: 8, padding: 8, background: 'var(--color-success-bg)', borderRadius: 4, fontSize: 13 }}>
                            <strong>Respons {t.handler ? `dari ${t.handler}` : ''}:</strong> {t.response}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted" style={{ whiteSpace: 'nowrap' }}>
                        {new Date(t.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="support-sidebar">
          <Card title="Panduan Pengguna" subtitle="Panduan penggunaan sistem">
            <div className="guide-list">
              {guides.map((g, i) => (
                <button key={i} className="guide-item" onClick={() => addToast(`Panduan ${g.title} belum tersedia`, 'info')}>
                  <Book size={16} />
                  <div>
                    <div className="guide-title">{g.title}</div>
                    <div className="guide-desc">{g.desc}</div>
                  </div>
                  <ExternalLink size={14} />
                </button>
              ))}
            </div>
          </Card>

          <Card title="Hubungi Support" subtitle="Kirim tiket bantuan">
            <div className="settings-form">
              <div className="form-group">
                <label>Subjek</label>
                <input value={contactForm.subject} onChange={e => setContactForm(p => ({ ...p, subject: e.target.value }))} placeholder="Ringkasan masalah..." />
              </div>
              <div className="form-group">
                <label>Prioritas</label>
                <select value={contactForm.priority} onChange={e => setContactForm(p => ({ ...p, priority: e.target.value }))}>
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                </select>
              </div>
              <div className="form-group">
                <label>Pesan</label>
                <textarea
                  value={contactForm.message}
                  onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                  rows={4}
                  placeholder="Jelaskan masalah yang Anda alami..."
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>
              <Button variant="primary" icon={MessageCircle} onClick={handleSubmitTicket} disabled={submitting}>
                {submitting ? 'Mengirim...' : 'Kirim Tiket'}
              </Button>
            </div>
          </Card>

          <Card>
            <div className="quick-contact">
              <div className="contact-item"><Mail size={16} /> <span>support@shipyard.co.id</span></div>
              <div className="contact-item"><Phone size={16} /> <span>021-555-SIMS (7467)</span></div>
              <div className="contact-item"><Ship size={16} /> <span>SIMS v1.0 — Inventaris Galangan</span></div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
