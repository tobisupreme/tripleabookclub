'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Input, Textarea, Button } from '@/components/ui'
import { Suggestion } from '@/types/database.types'

interface SuggestionFormProps {
  category: 'fiction' | 'non-fiction'
  month: number
  year: number
  onSubmit: (suggestion: Omit<Suggestion, 'id' | 'user_id' | 'vote_count' | 'created_at'>) => Promise<void>
  onCancel: () => void
}

export function SuggestionForm({ category, month, year, onSubmit, onCancel }: SuggestionFormProps) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [synopsis, setSynopsis] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) newErrors.title = 'Title is required'
    if (!author.trim()) newErrors.author = 'Author is required'
    if (!synopsis.trim()) newErrors.synopsis = 'Synopsis is required'
    if (synopsis.length < 50) newErrors.synopsis = 'Synopsis must be at least 50 characters'
    if (synopsis.length > 1000) newErrors.synopsis = 'Synopsis must be less than 1000 characters'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)

    try {
      await onSubmit({
        title: title.trim(),
        author: author.trim(),
        synopsis: synopsis.trim(),
        image_url: imageUrl.trim() || null,
        category,
        month,
        year,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-white/60 text-sm">
        Suggest a book for the community to vote on. If your book gets the most votes, 
        it will be our next {category} read!
      </p>

      <Input
        label="Book Title"
        placeholder="Enter the book title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
      />

      <Input
        label="Author"
        placeholder="Enter the author's name"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        error={errors.author}
      />

      <Textarea
        label="Synopsis"
        placeholder="Provide a brief synopsis of the book (50-1000 characters)"
        value={synopsis}
        onChange={(e) => setSynopsis(e.target.value)}
        error={errors.synopsis}
        helperText={`${synopsis.length}/1000 characters`}
      />

      <Input
        label="Cover Image URL (optional)"
        placeholder="https://example.com/book-cover.jpg"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        helperText="Paste a URL to the book's cover image"
      />

      {/* Image preview */}
      {imageUrl && (
        <div className="relative w-32 h-48 rounded-lg overflow-hidden bg-white/5">
          <img
            src={imageUrl}
            alt="Cover preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Submit Suggestion
        </Button>
      </div>
    </form>
  )
}
