import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

import adminMd from './docs/admin.md?raw';
import supervisorMd from './docs/supervisor.md?raw';
import staffMd from './docs/staff.md?raw';
import traceabilityMd from './docs/traceability.md?raw';
import procurementMd from './docs/procurement.md?raw';
import inventoryMd from './docs/inventory.md?raw';

import './UserGuide.css';

const guidesContent = {
  admin: { title: 'Panduan Admin', md: adminMd },
  supervisor: { title: 'Panduan Supervisor', md: supervisorMd },
  staff: { title: 'Panduan Staff', md: staffMd },
  traceability: { title: 'Panduan Penelusuran', md: traceabilityMd },
  procurement: { title: 'Panduan Pengadaan', md: procurementMd },
  inventory: { title: 'Panduan Inventaris', md: inventoryMd },
};

// Plugins for remark — passed as a stable array to react-markdown.
const REMARK_PLUGINS = [remarkGfm];

export default function UserGuide() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const guide = guidesContent[slug];

  // Scroll to top whenever the slug changes — guides are typically long.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  // Track that we're loading the markdown lib chunk on first render so the
  // user gets a quick "loading" state if their connection is slow. After the
  // module is parsed, the Markdown component renders synchronously.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Microtask delay just to ensure the chunk is committed before we render
    // a large doc — prevents a flash of un-styled content.
    Promise.resolve().then(() => setReady(true));
  }, []);

  if (!guide) {
    return (
      <>
        <div className="page-header user-guide-header">
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/support')}>
            Kembali ke Bantuan
          </Button>
        </div>
        <Card title="Panduan tidak ditemukan">
          <div
            className="trace-state"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 32 }}
          >
            <AlertCircle size={28} />
            <span>Slug panduan {`"${slug}"`} tidak dikenali.</span>
            <span className="text-xs text-muted">
              Pilih panduan dari halaman Bantuan.
            </span>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="page-header user-guide-header">
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/support')}>
          Kembali ke Bantuan
        </Button>
        <div className="user-guide-meta">
          <FileText size={14} /> Panduan Pengguna
        </div>
      </div>
      <Card>
        <div className="user-guide-content">
          {ready ? (
            <Markdown remarkPlugins={REMARK_PLUGINS}>{guide.md}</Markdown>
          ) : (
            <div className="text-muted">Memuat konten...</div>
          )}
        </div>
      </Card>
    </>
  );
}
