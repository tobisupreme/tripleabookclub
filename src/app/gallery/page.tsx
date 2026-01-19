import { Suspense } from 'react'
import { GalleryContent } from '@/components/gallery/GalleryContent'
import { PageHeader, PageLoader } from '@/components/ui'

export const metadata = {
  title: 'Gallery',
  description: 'Browse photos and videos from Triple A Book Club events and gatherings.',
}

export default function GalleryPage() {
  return (
    <div className="page-enter">
      <PageHeader
        title="Our Gallery"
        description="Moments captured from our book club meetings, events, and gatherings. Take a look at our vibrant community in action."
      />

      <Suspense fallback={<PageLoader />}>
        <GalleryContent />
      </Suspense>
    </div>
  )
}
