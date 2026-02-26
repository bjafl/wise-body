import type { ActivityTemplate } from '@/types';
import type { FC } from 'react';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useContextMenu } from '@/hooks/useContextMenu';

function getIcon(name: string): LucideIcon {
  const icon = (Icons as unknown as Record<string, LucideIcon>)[name];
  return icon ?? Icons.Circle;
}

const ActivityCardSmall: FC<{
  template: ActivityTemplate;
  onClick: (template: ActivityTemplate) => void;
}> = ({ template, onClick }) => {
  const { handleContextMenu } = useContextMenu();
  const Icon = getIcon(template.icon);
  const isGain = template.type === 'gain';

  return (
    <button
      onContextMenu={handleContextMenu}
      onClick={() => onClick(template)}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all
                hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm
                ${
                  isGain
                    ? 'border-energy-full/30 bg-energy-full/5 hover:border-energy-full/50'
                    : 'border-border bg-card hover:border-primary/30'
                }`}
    >
      <Icon
        size={22}
        className={isGain ? 'text-energy-full' : 'text-muted-foreground'}
      />
      <span className="text-xs font-medium text-center leading-tight line-clamp-2">
        {template.name}
      </span>
      <span
        className={`text-xs font-bold ${
          isGain ? 'text-energy-full' : 'text-energy-low'
        }`}
      >
        {isGain ? '+' : '-'}
        {template.defaultCost}
      </span>
    </button>
  );
};

export default ActivityCardSmall;
