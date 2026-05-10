import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './Toast.css';

const icons = { success: CheckCircle, warning: AlertTriangle, error: XCircle, info: Info };

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();
  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map(t => {
        const Icon = icons[t.type] || icons.info;
        return (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <Icon size={18} />
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => removeToast(t.id)}><X size={14} /></button>
          </div>
        );
      })}
    </div>
  );
}
