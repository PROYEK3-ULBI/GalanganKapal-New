import { ShoppingCart, FileBarChart, Settings, HelpCircle, Construction } from 'lucide-react';
import Card from '../components/ui/Card';

function PlaceholderPage({ title, subtitle }) {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 16, color: 'var(--color-text-muted)' }}>
          <div style={{ width: 72, height: 72, borderRadius: 16, background: 'var(--color-bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Construction size={32} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)' }}>Segera Hadir</h2>
          <p style={{ fontSize: 14, maxWidth: 400, textAlign: 'center' }}>Modul ini sedang dalam pengembangan. Silakan cek kembali nanti untuk fungsionalitas lengkap.</p>
        </div>
      </Card>
    </div>
  );
}

export function Procurement() { return <PlaceholderPage icon={ShoppingCart} title="Pengadaan" subtitle="Permintaan pembelian, purchase order, dan manajemen vendor" />; }
export function Reports() { return <PlaceholderPage icon={FileBarChart} title="Laporan" subtitle="Valuasi inventaris, konsumsi proyek, dan analitik" />; }
export function SettingsPage() { return <PlaceholderPage icon={Settings} title="Pengaturan" subtitle="Konfigurasi sistem dan preferensi pengguna" />; }
export function Support() { return <PlaceholderPage icon={HelpCircle} title="Bantuan" subtitle="Dokumentasi bantuan dan sumber daya dukungan" />; }
