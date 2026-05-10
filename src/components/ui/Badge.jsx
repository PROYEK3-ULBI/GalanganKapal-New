import './Badge.css';
import { AlertTriangle } from 'lucide-react';

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {variant === 'hazmat' && <AlertTriangle size={12} />}
      {children}
    </span>
  );
}
