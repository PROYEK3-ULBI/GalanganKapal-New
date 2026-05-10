import './Card.css';

export default function Card({ children, title, subtitle, action, className = '', noPadding = false }) {
  return (
    <div className={`card ${noPadding ? 'card-no-padding' : ''} ${className}`}>
      {(title || action) && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      <div className={`card-body ${noPadding ? 'card-body-no-padding' : ''}`}>
        {children}
      </div>
    </div>
  );
}
