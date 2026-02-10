import { useState } from 'react';
import { useUsage } from '../../hooks/useUsage';

export function UsageBadge() {
  const { usage } = useUsage();
  const [showTooltip, setShowTooltip] = useState(false);

  if (!usage) return null;

  const remaining = usage.limit - usage.used;
  const colorClass =
    remaining <= 0
      ? 'bg-danger/10 text-danger border-danger/30'
      : remaining <= 2
        ? 'bg-warning/10 text-warning border-warning/30'
        : 'bg-success/10 text-success border-success/30';

  const resetDate = new Date(usage.resets_at).toLocaleDateString();

  return (
    <div className="relative">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${colorClass}`}
      >
        {usage.used}/{usage.limit} used
      </button>
      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 rounded-lg border border-border bg-surface p-3 text-xs shadow-lg">
          <p className="text-text-secondary">Resets on {resetDate}</p>
          <p className="mt-1 font-medium text-text">
            {remaining > 0 ? `${remaining} remaining` : 'Limit reached'}
          </p>
        </div>
      )}
    </div>
  );
}
