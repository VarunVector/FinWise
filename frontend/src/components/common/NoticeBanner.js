import React from 'react';
import { Info } from 'lucide-react';

/**
 * NoticeBanner Component
 * Clean light blue-gray informational disclaimer banner matching the screenshots.
 */
export default function NoticeBanner({
  message = "Demo data. Holdings, valuations and transactions are sample data stored in your browser. Values change only when you edit them; nothing is a live market price. Portfolio value uses the latest valuation recorded on each holding; fixed deposits are accrual estimates.",
  className = ""
}) {
  return (
    <div className={`fintech-notice-banner d-flex align-items-start gap-2.5 ${className}`}>
      <Info size={18} className="flex-shrink-0 text-muted mt-0.5" />
      <div className="notice-text">
        {message}
      </div>
    </div>
  );
}

