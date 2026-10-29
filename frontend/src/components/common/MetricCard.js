import React from 'react';

/**
 * MetricCard Component
 * Displays a high-level fintech KPI metric card as seen in Groww/Zerodha/FinWise screenshots.
 *
 * @param {string} title - Card header label
 * @param {string} badgeText - E.g. 'Demo data', 'Your input', 'Calculated', 'Modelled estimate'
 * @param {string} badgeType - 'demo' | 'input' | 'calc' | 'estimate'
 * @param {string|React.ReactNode} value - Large numeric amount (e.g. ₹18,92,294)
 * @param {string|React.ReactNode} subtext - E.g. '13 holdings', '↑ 11.0% on invested'
 * @param {string} valueClass - Custom text color or weight (e.g. text-success)
 */
export default function MetricCard({
  title,
  badgeText,
  badgeType = 'calc',
  value,
  subtext,
  valueClass = '',
  onClick
}) {
  const getBadgeClass = (type) => {
    switch (type) {
      case 'demo':
        return 'badge-fintech-demo';
      case 'input':
        return 'badge-fintech-input';
      case 'calc':
        return 'badge-fintech-calc';
      case 'estimate':
        return 'badge-fintech-estimate';
      default:
        return 'badge-fintech-calc';
    }
  };

  return (
    <div
      className={`card fintech-metric-card h-100 ${onClick ? 'cursor-pointer hover-card' : ''}`}
      onClick={onClick}
    >
      <div className="card-body p-3 p-md-4 d-flex flex-column justify-content-between">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="metric-title">{title}</span>
          {badgeText && (
            <span className={`badge ${getBadgeClass(badgeType)}`}>
              {badgeText}
            </span>
          )}
        </div>
        <div className={`metric-value ${valueClass}`}>{value}</div>
        {subtext && <div className="metric-subtext mt-1">{subtext}</div>}
      </div>
    </div>
  );
}

