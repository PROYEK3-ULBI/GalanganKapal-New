import { useState } from 'react';
import { HelpCircle, Book, MessageCircle, ChevronDown, ChevronUp, Search, Mail, Phone, ExternalLink, Ship } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';
import './Support.css';

const faqData = [
  { q: 'Bagaimana cara menambah material baru?', a: 'Login sebagai Admin → buka Master Data → klik "Add New Material" → isi form lengkap (SKU akan otomatis di-generate) → klik Save.' },
  { q: 'Bagaimana cara menerima barang (Goods Receipt)?', a: 'Buka Inventory Operations → Goods Receipt → pilih PO dari dropdown → input jumlah yang diterima per item → klik Confirm Receipt.' },
  { q: 'Bagaimana cara mengeluarkan material ke proyek?', a: 'Buka Goods Issue → cari material → set jumlah yang diminta → pilih proyek tujuan → klik Submit Issue. Sistem akan validasi stok otomatis.' },
  { q: 'Apa itu Heat Number dan kenapa penting?', a: 'Heat Number adalah nomor batch produksi dari pabrik baja. Ini wajib untuk material yang butuh sertifikasi (BKI/Class). Heat Number memungkinkan traceability penuh dari pabrik hingga ke posisi pemasangan di kapal.' },
  { q: 'Bagaimana cara mengajukan Material Request?', a: 'Login sebagai Staff → buka Material Request → klik "Buat Request Baru" → pilih material, qty, proyek, dan alasan → Kirim. Supervisor akan menerima request di Approval Center.' },
  { q: 'Kenapa saya tidak bisa akses Master Data?', a: 'Akses Master Data hanya tersedia untuk role Admin (full CRUD) dan Supervisor (read-only). Staff tidak memiliki akses ke halaman ini. Hubungi Admin jika perlu perubahan role.' },
  { q: 'Bagaimana cara meminjam alat?', a: 'Buka Tools Management → cari alat yang tersedia (status "Available") → klik "Check Out" → isi tujuan penggunaan → Confirm. Ingat untuk mengembalikan tepat waktu.' },
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

export default function Support() {
  const { addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [contactForm, setContactForm] = useState({ subject: '', message: '' });

  const filteredFaq = searchTerm
    ? faqData.filter(f => f.q.toLowerCase().includes(searchTerm.toLowerCase()) || f.a.toLowerCase().includes(searchTerm.toLowerCase()))
    : faqData;

  const handleSubmitTicket = () => {
    if (!contactForm.subject || !contactForm.message) return addToast('Isi subject dan pesan', 'error');
    addToast('Tiket support berhasil dikirim! Tim kami akan merespons dalam 24 jam. (Demo)', 'success');
    setContactForm({ subject: '', message: '' });
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Bantuan & Dukungan</h1>
        <p className="page-subtitle">Dokumentasi, FAQ, dan hubungi dukungan</p>
      </div>

      {/* Search FAQ */}
      <div className="support-search">
        <Search size={20} />
        <input
          placeholder="Cari pertanyaan atau topik bantuan..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="support-grid">
        {/* FAQ Section */}
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
        </div>

        {/* Sidebar */}
        <div className="support-sidebar">
          {/* User Guides */}
          <Card title="Panduan Pengguna" subtitle="Panduan penggunaan sistem">
            <div className="guide-list">
              {guides.map((g, i) => (
                <button key={i} className="guide-item" onClick={() => addToast(`Membuka ${g.title}... (Demo)`, 'info')}>
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

          {/* Contact Support */}
          <Card title="Hubungi Support" subtitle="Kirim tiket bantuan">
            <div className="settings-form">
              <div className="form-group">
                <label>Subjek</label>
                <input value={contactForm.subject} onChange={e => setContactForm(p => ({ ...p, subject: e.target.value }))} placeholder="Ringkasan masalah..." />
              </div>
              <div className="form-group">
                <label>Pesan</label>
                <textarea value={contactForm.message} onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))} rows={4} placeholder="Jelaskan masalah yang Anda alami..." style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', resize: 'vertical' }} />
              </div>
              <Button variant="primary" icon={MessageCircle} onClick={handleSubmitTicket}>Kirim Tiket</Button>
            </div>
          </Card>

          {/* Quick Contact */}
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
