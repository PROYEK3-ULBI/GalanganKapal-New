import { ShieldOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PERMISSIONS } from '../config/permissions';
import Button from '../components/ui/Button';

export default function AccessDenied() {
  const navigate = useNavigate();
  const { role } = useApp();
  const roleLabel = PERMISSIONS[role]?.label || role;

  return (
    <div className="access-denied">
      <div className="access-denied-icon">
        <ShieldOff size={48} />
      </div>
      <h2>Akses Ditolak</h2>
      <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
      <div className="access-denied-role">
        Peran saat ini: <strong>{roleLabel}</strong>
      </div>
      <p className="access-denied-hint">
        Hubungi administrator sistem untuk meminta akses, atau ganti ke peran yang memiliki izin yang diperlukan.
      </p>
      <Button variant="primary" icon={ArrowLeft} onClick={() => navigate('/')}>
        Kembali ke Dashboard
      </Button>

      <style>{`
        .access-denied {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          gap: 12px;
          animation: fadeIn 300ms ease;
        }
        .access-denied-icon {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: var(--color-danger-bg);
          color: var(--color-danger);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }
        .access-denied h2 {
          font-size: 24px;
          font-weight: 700;
          color: var(--color-text-primary);
        }
        .access-denied p {
          font-size: 14px;
          color: var(--color-text-muted);
          max-width: 400px;
        }
        .access-denied-role {
          background: var(--color-warning-bg);
          color: var(--color-warning-text);
          padding: 8px 16px;
          border-radius: var(--radius-md);
          font-size: 13px;
          margin: 8px 0;
        }
        .access-denied-hint {
          font-size: 13px;
          margin-bottom: 12px;
        }
      `}</style>
    </div>
  );
}
