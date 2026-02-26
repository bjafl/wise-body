import { energyPercentage, energyColor } from '@/lib/utils';
import type { DaySummary } from '@/types';

interface EnergyGaugeProps {
  summary: DaySummary;
}

export function EnergyGauge({ summary }: EnergyGaugeProps) {
  const pct = energyPercentage(summary.remaining, summary.totalBudget);
  const color = energyColor(pct);
  const radius = 70;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
          {/* Background track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="var(--color-muted)"
            strokeWidth={stroke}
          />
          {/* Energy arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-bold tabular-nums transition-colors duration-500"
            style={{ color }}
          >
            {summary.remaining}
          </span>
          <span className="text-sm text-muted-foreground">
            av {summary.totalBudget}
          </span>
        </div>
      </div>

      {/* Legend row */}
      <div className="flex gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-energy-empty" />
          <span>−{summary.totalSpent} brukt</span>
        </div>
        {summary.totalGained > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-energy-full" />
            <span>+{summary.totalGained} gjenvunnet</span>
          </div>
        )}
      </div>
    </div>
  );
}
