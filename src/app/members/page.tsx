import { Suspense } from 'react'
import { MembersContent } from '@/components/members/MembersContent'
import { PageHeader, PageLoader } from '@/components/ui'

export const metadata = {
  title: 'Members',
  description: 'Meet the amazing members of Triple A Book Club who make our community special.',
}

export default function MembersPage() {
  return (
    <div className="page-enter">
      <PageHeader
        title="Our Members"
        description="Meet the wonderful people who make Triple A Book Club a vibrant and welcoming community of readers."
      />

      <Suspense fallback={<PageLoader />}>
        <MembersContent />
      </Suspense>
    </div>
  )
}
