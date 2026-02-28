import type { ActivityTemplate } from '@/types';
import type { FC, RefObject } from 'react';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useContextMenu } from '@/hooks/useContextMenu';
import ContextMenuButton from '../ContextMenuButton';
import { cn } from '@/lib/utils';
import FlipButton from '../FlipButton';

function getIcon(name: string): LucideIcon {
  const icon = (Icons as unknown as Record<string, LucideIcon>)[name];
  return icon ?? Icons.Circle;
}

const ActivityCardSmall: FC<{
  template: ActivityTemplate;
  onClick: (template: ActivityTemplate) => void;
  containerRef: RefObject<HTMLDivElement | null>;
}> = ({ template, containerRef, onClick }) => {
  const Icon = getIcon(template.icon);
  const isGain = template.type === 'gain';

  return (
    <FlipButton
      containerRef={containerRef}
      onClick={() => onClick(template)}
      className={cn(
        'flex flex-col w-full h-full items-center',
        'gap-1.5 p-3 rounded-xl border transition-all text-foreground',
        'hover:shadow-md hover:-translate-y-0.5',
        'active:translate-y-0 active:shadow-sm',
        isGain
          ? 'border-energy-full/30 bg-energy-full/5 hover:border-energy-full/50'
          : 'border-border bg-card text-card-foreground hover:border-primary/30 hover:bg-card/80'
      )}
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
    </FlipButton>
  );
};

export default ActivityCardSmall;
