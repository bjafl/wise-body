import { useRef, useState } from 'react';
import type { ActivityTemplate, ActivityCategory } from '@/types';
import { CATEGORY_LABELS } from '@/types';
import ActivityCardSmall from './ActivityCardSmall';

interface ActivityPickerProps {
  templates: ActivityTemplate[];
  onSelect: (template: ActivityTemplate, adjustedCost: number) => void;
}

export function ActivityPicker({ templates, onSelect }: ActivityPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    ActivityCategory | 'all'
  >('all');
  const [adjustingTemplate, setAdjustingTemplate] =
    useState<ActivityTemplate | null>(null);
  const [adjustedValue, setAdjustedValue] = useState(0);
  const activityGridRef = useRef<HTMLDivElement | null>(null);

  const categories = Array.from(
    new Set(templates.map((t) => t.category))
  ) as ActivityCategory[];

  const filtered =
    selectedCategory === 'all'
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const handleTap = (template: ActivityTemplate) => {
    setAdjustingTemplate(template);
    setAdjustedValue(template.defaultCost);
  };

  const handleConfirm = () => {
    if (adjustingTemplate) {
      onSelect(adjustingTemplate, adjustedValue);
      setAdjustingTemplate(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Category filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-accent'
          }`}
        >
          Alle
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Activity grid */}
      <div
        ref={activityGridRef}
        className="grid grid-cols-3 sm:grid-cols-4 gap-2"
      >
        {filtered.map((template) => (
          <ActivityCardSmall
            containerRef={activityGridRef}
            key={template.id}
            template={template}
            onClick={handleTap}
          />
        ))}
      </div>

      {/* Adjustment modal */}
      {adjustingTemplate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-semibold">
                {adjustingTemplate.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Juster energi
                {adjustingTemplate.type === 'gain' ? 'gevinst' : 'kostnad'}
              </p>
            </div>

            {/* Value adjuster */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setAdjustedValue(Math.max(0, adjustedValue - 1))}
                className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl font-bold hover:bg-accent transition-colors"
              >
                −
              </button>
              <span className="text-5xl font-bold tabular-nums w-16 text-center">
                {adjustedValue}
              </span>
              <button
                onClick={() => setAdjustedValue(adjustedValue + 1)}
                className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl font-bold hover:bg-accent transition-colors"
              >
                +
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setAdjustingTemplate(null)}
                className="flex-1 py-3 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {adjustingTemplate.type === 'gain'
                  ? 'Legg til energi'
                  : 'Registrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
