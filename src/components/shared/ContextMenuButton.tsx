import { useCallback, useState, type FC } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import type { VariantProps } from 'class-variance-authority'

const ContextMenuButton: FC<
  React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean
    }
> = ({ children, ...btnProps }) => {
  const [showMenu, setShowMenu] = useState(false)
  const handleContextMenu = useCallback(() => {
    setShowMenu(true)
  }, [])

  return (
    <div className="flex relative w-content h-content">
      <Button onContextMenu={handleContextMenu} {...btnProps}>
        {children}
      </Button>
      {showMenu && (
        <ul className="absolute top-0 left-0 z-10 bg-popover border rounded-md shadow-md p-1 min-w-32">
          <li
            className="px-3 py-1.5 text-sm rounded hover:bg-accent cursor-pointer"
            onClick={() => { setShowMenu(false) }}
          >
            Rediger
          </li>
          <li
            className="px-3 py-1.5 text-sm rounded hover:bg-destructive/10 text-destructive cursor-pointer"
            onClick={() => { setShowMenu(false) }}
          >
            Slett
          </li>
        </ul>
      )}
    </div>
  )
}

export default ContextMenuButton
