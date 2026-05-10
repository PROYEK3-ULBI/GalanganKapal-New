import './StatCard.css';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, trend, trendLabel, color = 'primary' }) {
  const isPositive = trend > 0;
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-icon">
        <Icon size={22} />
      </div>
      <div className="stat-card-content">
        <p className="stat-card-label">{label}</p>
        <h3 className="stat-card-value">{value}</h3>
        {(trend !== undefined || trendLabel) && (
          <div className={`stat-card-trend ${isPositive ? 'positive' : 'negative'}`}>
            {trend !== undefined && (isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />)}
            <span>{trendLabel || `${isPositive ? '+' : ''}${trend}%`}</span>
          </div>
        )}
      </div>
    </div>
  );
}
