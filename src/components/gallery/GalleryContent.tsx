'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Play, X, Image as ImageIcon, Video, ZoomIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { GalleryItem } from '@/types/database.types'
import { Tabs, TabPanel, Skeleton } from '@/components/ui'

gsap.registerPlugin(ScrollTrigger)

const tabs = [
  { id: 'all', label: 'All', icon: null },
  { id: 'image', label: 'Photos', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'video', label: 'Videos', icon: <Video className="w-4 h-4" /> },
]

export function GalleryContent() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const galleryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchGallery = async () => {
      const supabase = createClient()
      
      const { data } = await supabase
        .from('gallery')
        .select('*')
        .order('order_index', { ascending: true })

      setItems(data || [])
      setLoading(false)
    }

    fetchGallery()
  }, [])

  useEffect(() => {
    if (!galleryRef.current || loading) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gallery-item',
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: galleryRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    }, galleryRef)

    return () => ctx.revert()
  }, [loading, activeTab])

  const filteredItems = activeTab === 'all' 
    ? items 
    : items.filter(item => item.type === activeTab)

  return (
    <section className="section-padding pt-0">
      <div className="container-main">
        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Gallery Grid */}
        <TabPanel value={activeTab} activeValue={activeTab}>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 card"
            >
              <div className="text-6xl mb-4">📷</div>
              <h4 className="text-xl font-semibold text-white mb-2">
                No Media Yet
              </h4>
              <p className="text-white/60">
                Check back soon for photos and videos from our events!
              </p>
            </motion.div>
          ) : (
            <div ref={galleryRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item, index) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  index={index}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </div>
          )}
        </TabPanel>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedItem && (
          <Lightbox
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            items={filteredItems}
            onNavigate={setSelectedItem}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

interface GalleryCardProps {
  item: GalleryItem
  index: number
  onClick: () => void
}

function GalleryCard({ item, index, onClick }: GalleryCardProps) {
  const isWide = index % 7 === 0 || index % 7 === 3
  const isTall = index % 11 === 5

  return (
    <motion.div
      className={`gallery-item relative group cursor-pointer overflow-hidden rounded-xl ${
        isWide ? 'md:col-span-2' : ''
      } ${isTall ? 'md:row-span-2' : ''}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`relative ${isTall ? 'aspect-[3/4]' : 'aspect-square'}`}>
        {item.type === 'image' ? (
          <img
            src={item.url}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <>
            <video
              src={item.url}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              loop
              playsInline
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => {
                e.currentTarget.pause()
                e.currentTarget.currentTime = 0
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
          </>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h4 className="text-white font-semibold mb-1">{item.title}</h4>
            {item.description && (
              <p className="text-white/60 text-sm line-clamp-2">{item.description}</p>
            )}
          </div>
        </div>

        {/* Zoom icon */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
            <ZoomIn className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface LightboxProps {
  item: GalleryItem
  items: GalleryItem[]
  onClose: () => void
  onNavigate: (item: GalleryItem) => void
}

function Lightbox({ item, items, onClose, onNavigate }: LightboxProps) {
  const currentIndex = items.findIndex(i => i.id === item.id)

  const handlePrev = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
    onNavigate(items[prevIndex])
  }

  const handleNext = () => {
    const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
    onNavigate(items[nextIndex])
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/95 backdrop-blur-lg"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Navigation */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          handlePrev()
        }}
        className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation()
          handleNext()
        }}
        className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Content */}
      <motion.div
        key={item.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="max-w-5xl max-h-[90vh] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === 'image' ? (
          <img
            src={item.url}
            alt={item.title}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
        ) : (
          <video
            src={item.url}
            controls
            autoPlay
            className="max-w-full max-h-[80vh] rounded-lg"
          />
        )}

        {/* Caption */}
        <div className="mt-4 text-center">
          <h4 className="text-xl font-semibold text-white">{item.title}</h4>
          {item.description && (
            <p className="text-white/60 mt-2">{item.description}</p>
          )}
        </div>
      </motion.div>

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {currentIndex + 1} / {items.length}
      </div>
    </motion.div>
  )
}
