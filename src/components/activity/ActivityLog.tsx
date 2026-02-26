import * as Icons from 'lucide-react';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import type { ActivityEntry } from '@/types';
import { CATEGORY_LABELS } from '@/types';
import type { LucideIcon } from 'lucide-react';

interface ActivityLogProps {
  entries: ActivityEntry[];
  onRemove: (id: string) => void;
}

function getIcon(name: string): LucideIcon {
  const icon = (Icons as Record<string, LucideIcon>)[name];
  return icon ?? Icons.Circle;
}

export function ActivityLog({ entries, onRemove }: ActivityLogProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Icons.Sunrise size={40} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm">Ingen aktiviteter registrert ennå i dag.</p>
        <p className="text-xs mt-1">Trykk på en aktivitet over for å starte.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const isGain = entry.type === 'gain';
        const CatIcon = getIcon(
          isGain ? 'ArrowUpCircle' : 'ArrowDownCircle'
        );

        return (
          <div
            key={entry.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
              isGain
                ? 'border-energy-full/20 bg-energy-full/5'
                : 'border-border bg-card'
            }`}
          >
            <CatIcon
              size={18}
              className={isGain ? 'text-energy-full shrink-0' : 'text-energy-low shrink-0'}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium truncate">
                  {entry.name}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {CATEGORY_LABELS[entry.category]}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span>{format(new Date(entry.startedAt), 'HH:mm')}</span>
                {entry.durationMinutes && (
                  <span>· {entry.durationMinutes} min</span>
                )}
                {entry.note && (
                  <span className="truncate">· {entry.note}</span>
                )}
              </div>
            </div>

            <span
              className={`text-sm font-bold tabular-nums shrink-0 ${
                isGain ? 'text-energy-full' : 'text-energy-low'
              }`}
            >
              {isGain ? '+' : '−'}{entry.energyValue}
            </span>

            <button
              onClick={() => onRemove(entry.id)}
              className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive shrink-0"
              aria-label="Slett aktivitet"
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
