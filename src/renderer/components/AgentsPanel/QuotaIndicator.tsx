import { Zap } from '../Icons';

interface QuotaIndicatorProps {
  quota: number;
}

export function QuotaIndicator({ quota }: QuotaIndicatorProps) {
  const getQuotaColor = () => {
    if (quota > 50) return 'var(--accent)';
    if (quota > 10) return '#e2c08d';
    return '#f14c4c';
  };

  return (
    <div className="quota-indicator" style={{ color: getQuotaColor() }}>
      <span className="quota-icon">
        <Zap size={14} strokeWidth={2} />
      </span>
      <span className="quota-value">{quota}</span>
    </div>
  );
}
