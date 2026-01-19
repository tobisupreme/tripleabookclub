import { Suspense } from 'react'
import { AboutContent } from '@/components/about/AboutContent'
import { PageHeader, PageLoader } from '@/components/ui'

export const metadata = {
  title: 'About',
  description: 'Learn more about Triple A Book Club, our mission, and the community of passionate readers.',
}

export default function AboutPage() {
  return (
    <div className="page-enter">
      <PageHeader
        title="About Triple A"
        description="We're a community of passionate readers united by our love for storytelling. Learn more about our mission and what makes our book club special."
      />

      <Suspense fallback={<PageLoader />}>
        <AboutContent />
      </Suspense>
    </div>
  )
}
