import { useState } from 'react';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { EnergyGauge } from '@/components/energy/EnergyGauge';
import { ActivityPicker } from '@/components/activity/ActivityPicker';
import { ActivityLog } from '@/components/activity/ActivityLog';
import { useTemplates, useDayEntries, useDaySummary } from '@/hooks/useEnergy';
import { formatDate, nextDay, prevDay, todayISO } from '@/lib/utils';
import type { EnergyProfile, ActivityTemplate } from '@/types';

interface DayViewProps {
  profile: EnergyProfile;
  onOpenSettings: () => void;
}

export function DayView({ profile, onOpenSettings }: DayViewProps) {
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const { templates } = useTemplates();
  const { entries, addEntry, removeEntry } = useDayEntries(selectedDate);
  const summary = useDaySummary(entries, profile.dailyBudget, selectedDate);

  const isCurrentDay = isToday(selectedDate);

  const handleSelect = async (
    template: ActivityTemplate,
    adjustedCost: number
  ) => {
    await addEntry({
      name: template.name,
      energyValue: adjustedCost,
      type: template.type,
      category: template.category,
      templateId: template.id,
    });
  };

  const goToPrevDay = () => {
    const d = prevDay(selectedDate);
    setSelectedDate(format(d, 'yyyy-MM-dd'));
  };

  const goToNextDay = () => {
    const d = nextDay(selectedDate);
    if (!isToday(d) && d > new Date()) return; // Don't go to future
    setSelectedDate(format(d, 'yyyy-MM-dd'));
  };

  const goToToday = () => setSelectedDate(todayISO());

  return (
    <div className="max-w-lg mx-auto px-4 pb-8">
      {/* Header */}
      <header className="flex items-center justify-between py-4">
        <h1 className="text-lg font-bold tracking-tight">Energiregnskap</h1>
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          aria-label="Innstillinger"
        >
          <Settings size={20} className="text-muted-foreground" />
        </button>
      </header>

      {/* Date navigator */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <button
          onClick={goToPrevDay}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          aria-label="Forrige dag"
        >
          <ChevronLeft size={20} />
        </button>
        <button onClick={goToToday} className="text-center min-w-48">
          <span className="text-sm font-medium capitalize">
            {isCurrentDay ? 'I dag' : formatDate(selectedDate)}
          </span>
          {isCurrentDay && (
            <span className="block text-xs text-muted-foreground capitalize">
              {formatDate(selectedDate)}
            </span>
          )}
        </button>
        <button
          onClick={goToNextDay}
          className={`p-2 rounded-lg hover:bg-accent transition-colors ${
            isCurrentDay ? 'opacity-30 cursor-not-allowed' : ''
          }`}
          disabled={isCurrentDay}
          aria-label="Neste dag"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Energy gauge */}
      <div className="mb-8">
        <EnergyGauge summary={summary} />
      </div>

      {/* Activity picker */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Registrer aktivitet
        </h2>
        <ActivityPicker templates={templates} onSelect={handleSelect} />
      </div>

      {/* Activity log */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Dagens logg ({entries.length})
        </h2>
        <ActivityLog entries={entries} onRemove={removeEntry} />
      </div>
    </div>
  );
}
