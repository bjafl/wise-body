import { createFileRoute } from '@tanstack/react-router'
import { Smile } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import type { NavItemMeta } from '@/types/routing'

export const Route = createFileRoute('/_app/mood/')({
  staticData: {
    nav: { label: 'Humør', icon: Smile, order: 2 } satisfies NavItemMeta,
  },
  component: MoodPage,
})

function MoodPage() {
  return (
    <PageContainer>
      <div className="py-4 space-y-4">
        <h1 className="text-xl font-bold">Humørdagbok</h1>
        <p className="text-sm text-muted-foreground">Kommer snart.</p>
      </div>
    </PageContainer>
  )
}
