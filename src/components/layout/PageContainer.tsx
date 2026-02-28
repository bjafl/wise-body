import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  /** Remove the default max-width constraint */
  fullWidth?: boolean
}

export function PageContainer({ children, className, fullWidth }: PageContainerProps) {
  return (
    <div
      className={cn(
        'px-4 py-6 pb-8',
        !fullWidth && 'max-w-lg mx-auto',
        className
      )}
    >
      {children}
    </div>
  )
}
