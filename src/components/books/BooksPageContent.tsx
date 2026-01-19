'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, BookMarked, Plus, Vote } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Book, Suggestion, PortalStatus } from '@/types/database.types'
import { useAuth } from '@/hooks'
import { Tabs, TabPanel, BookCard, BookCardSkeleton, Button, Modal } from '@/components/ui'
import { SuggestionForm } from './SuggestionForm'
import { VotingSection } from './VotingSection'
import { getMonthName, getCurrentMonthYear, getNextMonth, getBiMonthlyPeriod } from '@/lib/utils'
import toast from 'react-hot-toast'

const tabs = [
  { id: 'fiction', label: 'Fiction', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'non-fiction', label: 'Non-Fiction', icon: <BookMarked className="w-4 h-4" /> },
]

export function BooksPageContent() {
  const [activeTab, setActiveTab] = useState('fiction')
  const [books, setBooks] = useState<Book[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [portalStatus, setPortalStatus] = useState<PortalStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSuggestionModal, setShowSuggestionModal] = useState(false)
  const [userSuggestionCount, setUserSuggestionCount] = useState(0)
  const [userVotes, setUserVotes] = useState<string[]>([])

  const { user } = useAuth()
  const supabase = createClient()
  const { month, year } = getCurrentMonthYear()
  const nextMonth = getNextMonth(month, year)

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        // Fetch books
        const { data: booksData } = await supabase
          .from('books')
          .select('*')
          .eq('category', activeTab)
          .eq('is_selected', true)
          .order('year', { ascending: false })
          .order('month', { ascending: false })

        setBooks(booksData || [])

        // Fetch portal status for next month
        const targetMonth = activeTab === 'fiction' ? nextMonth.month : getBiMonthlyPeriod(nextMonth.month, nextMonth.year).startMonth
        const targetYear = activeTab === 'fiction' ? nextMonth.year : nextMonth.year

        const { data: statusData } = await supabase
          .from('portal_status')
          .select('*')
          .eq('month', targetMonth)
          .eq('year', targetYear)
          .eq('category', activeTab)
          .single()

        setPortalStatus(statusData)

        // Fetch suggestions for next month
        if (statusData?.nomination_open || statusData?.voting_open) {
          const { data: suggestionsData } = await supabase
            .from('suggestions')
            .select('*, profiles(full_name)')
            .eq('month', targetMonth)
            .eq('year', targetYear)
            .eq('category', activeTab)
            .order('vote_count', { ascending: false })

          setSuggestions(suggestionsData || [])

          // Count user's suggestions
          if (user) {
            const userSuggestions = (suggestionsData || []).filter(s => s.user_id === user.id)
            setUserSuggestionCount(userSuggestions.length)

            // Fetch user's votes
            const { data: votesData } = await supabase
              .from('votes')
              .select('suggestion_id')
              .eq('user_id', user.id)
              .eq('month', targetMonth)
              .eq('year', targetYear)

            setUserVotes((votesData || []).map(v => v.suggestion_id))
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeTab, user, supabase, nextMonth.month, nextMonth.year])

  const handleSuggestionSubmit = async (suggestion: Omit<Suggestion, 'id' | 'user_id' | 'vote_count' | 'created_at'>) => {
    if (!user) {
      toast.error('Please login to suggest books')
      return
    }

    if (userSuggestionCount >= 3) {
      toast.error('You can only suggest 3 books per month')
      return
    }

    try {
      const { data, error } = await supabase
        .from('suggestions')
        .insert({
          ...suggestion,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      setSuggestions(prev => [...prev, data])
      setUserSuggestionCount(prev => prev + 1)
      setShowSuggestionModal(false)
      toast.success('Book suggestion submitted!')
    } catch (error) {
      console.error('Error submitting suggestion:', error)
      toast.error('Failed to submit suggestion')
    }
  }

  const handleVote = async (suggestionId: string) => {
    if (!user) {
      toast.error('Please login to vote')
      return
    }

    if (userVotes.includes(suggestionId)) {
      toast.error('You have already voted for this book')
      return
    }

    try {
      const targetMonth = activeTab === 'fiction' ? nextMonth.month : getBiMonthlyPeriod(nextMonth.month, nextMonth.year).startMonth

      // Add vote
      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          user_id: user.id,
          suggestion_id: suggestionId,
          month: targetMonth,
          year: nextMonth.year,
        })

      if (voteError) throw voteError

      // Increment vote count
      const suggestion = suggestions.find(s => s.id === suggestionId)
      if (suggestion) {
        await supabase
          .from('suggestions')
          .update({ vote_count: (suggestion.vote_count || 0) + 1 })
          .eq('id', suggestionId)
      }

      // Update local state
      setUserVotes(prev => [...prev, suggestionId])
      setSuggestions(prev =>
        prev.map(s =>
          s.id === suggestionId
            ? { ...s, vote_count: (s.vote_count || 0) + 1 }
            : s
        ).sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
      )

      toast.success('Vote recorded!')
    } catch (error) {
      console.error('Error voting:', error)
      toast.error('Failed to record vote')
    }
  }

  const targetMonth = activeTab === 'fiction' ? nextMonth.month : getBiMonthlyPeriod(nextMonth.month, nextMonth.year).startMonth
  const periodLabel = activeTab === 'fiction'
    ? getMonthName(nextMonth.month)
    : `${getMonthName(getBiMonthlyPeriod(nextMonth.month, nextMonth.year).startMonth)} - ${getMonthName(getBiMonthlyPeriod(nextMonth.month, nextMonth.year).endMonth)}`

  return (
    <section className="section-padding pt-0">
      <div className="container-main">
        {/* Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          {/* Nomination/Voting status */}
          {portalStatus && (
            <div className="flex items-center gap-3">
              {portalStatus.nomination_open && user && (
                <Button
                  onClick={() => setShowSuggestionModal(true)}
                  disabled={userSuggestionCount >= 3}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Suggest a Book ({3 - userSuggestionCount} left)
                </Button>
              )}
              {portalStatus.voting_open && (
                <div className="flex items-center gap-2 px-4 py-2 bg-accent-500/10 rounded-full text-accent-400 text-sm">
                  <Vote className="w-4 h-4" />
                  <span>Voting Open for {periodLabel}</span>
                </div>
              )}
              {portalStatus.nomination_open && (
                <div className="flex items-center gap-2 px-4 py-2 bg-primary-500/10 rounded-full text-primary-400 text-sm">
                  <Plus className="w-4 h-4" />
                  <span>Nominations Open for {periodLabel}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <TabPanel value="fiction" activeValue={activeTab}>
          <BooksGrid
            books={books}
            suggestions={suggestions}
            portalStatus={portalStatus}
            loading={loading}
            userVotes={userVotes}
            onVote={handleVote}
            category="fiction"
          />
        </TabPanel>

        <TabPanel value="non-fiction" activeValue={activeTab}>
          <BooksGrid
            books={books}
            suggestions={suggestions}
            portalStatus={portalStatus}
            loading={loading}
            userVotes={userVotes}
            onVote={handleVote}
            category="non-fiction"
          />
        </TabPanel>
      </div>

      {/* Suggestion Modal */}
      <Modal
        isOpen={showSuggestionModal}
        onClose={() => setShowSuggestionModal(false)}
        title={`Suggest a ${activeTab === 'fiction' ? 'Fiction' : 'Non-Fiction'} Book`}
        size="lg"
      >
        <SuggestionForm
          category={activeTab as 'fiction' | 'non-fiction'}
          month={targetMonth}
          year={nextMonth.year}
          onSubmit={handleSuggestionSubmit}
          onCancel={() => setShowSuggestionModal(false)}
        />
      </Modal>
    </section>
  )
}

interface BooksGridProps {
  books: Book[]
  suggestions: Suggestion[]
  portalStatus: PortalStatus | null
  loading: boolean
  userVotes: string[]
  onVote: (id: string) => void
  category: 'fiction' | 'non-fiction'
}

function BooksGrid({ books, suggestions, portalStatus, loading, userVotes, onVote, category }: BooksGridProps) {
  const { user } = useAuth()

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <BookCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-16">
      {/* Voting Section */}
      {portalStatus?.voting_open && suggestions.length > 0 && (
        <VotingSection
          suggestions={suggestions}
          userVotes={userVotes}
          onVote={onVote}
          isLoggedIn={!!user}
        />
      )}

      {/* Past Books */}
      <div>
        <h3 className="text-2xl font-display font-bold text-white mb-8">
          {category === 'fiction' ? 'Monthly' : 'Bi-Monthly'} Reads
        </h3>

        {books.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 card"
          >
            <div className="text-6xl mb-4">📚</div>
            <h4 className="text-xl font-semibold text-white mb-2">
              No Books Yet
            </h4>
            <p className="text-white/60">
              {category === 'fiction'
                ? 'Our first fiction read is coming soon!'
                : 'Our first non-fiction read is coming soon!'}
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <BookCard book={book} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
