import { Suspense } from 'react'
import { BooksPageContent } from '@/components/books/BooksPageContent'
import { PageHeader, PageLoader } from '@/components/ui'

export const metadata = {
  title: 'Books',
  description: 'Explore our monthly fiction and bi-monthly non-fiction book selections at Triple A Book Club.',
}

export default function BooksPage() {
  return (
    <div className="page-enter">
      <PageHeader
        title="Our Book Collection"
        description="Explore our curated selection of monthly fiction and bi-monthly non-fiction reads. Suggest books, vote for your favorites, and join the conversation."
      />

      <Suspense fallback={<PageLoader message="Loading books..." />}>
        <BooksPageContent />
      </Suspense>
    </div>
  )
}
