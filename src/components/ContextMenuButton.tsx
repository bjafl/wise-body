import { useContextMenu } from '@/hooks/useContextMenu';
import { useCallback, useState, type FC } from 'react';
import { Button, buttonVariants } from './ui/button';
import type { VariantProps } from 'class-variance-authority';

const ContextMenuButton: FC<
  React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
> = ({ children, ...btnProps }) => {
  // const { position, showMenu, handleContextMenu } = useContextMenu();
  const [showMenu, setShowMenu] = useState(false);
  const handleContextMenu = useCallback(() => {
    setShowMenu(true);
  }, []);
  return (
    <div className="flex relative w-content h-content">
      <Button onContextMenu={handleContextMenu} {...btnProps}>
        {children}
      </Button>

      {showMenu && (
        <ul
          className="absolute top-0 left-0 z-10"
          // style={{
          //   top: position.y,
          //   left: position.x,
          //   position: 'fixed', // Use fixed to avoid parent container clipping
          //   zIndex: 1000,
          // }}
        >
          <li onClick={() => console.log('Edit')}>Edit</li>
          <li onClick={() => console.log('Delete')}>Delete</li>
        </ul>
      )}
    </div>
  );
};

export default ContextMenuButton;
