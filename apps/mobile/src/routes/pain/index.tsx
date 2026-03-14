import { createFileRoute } from '@tanstack/react-router'
import { Activity } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import type { NavItemMeta } from '@/types/routing'

export const Route = createFileRoute('/pain/')({
  staticData: {
    nav: { label: 'Smerte', icon: Activity, order: 3 } satisfies NavItemMeta,
  },
  component: PainPage,
})

function PainPage() {
  return (
    <PageContainer>
      <div className="py-4 space-y-4">
        <h1 className="text-xl font-bold">Smertekartlegging</h1>
        <p className="text-sm text-muted-foreground">Kommer snart.</p>
      </div>
    </PageContainer>
  )
}
