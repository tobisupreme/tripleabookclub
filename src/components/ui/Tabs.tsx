'use client'

import { useState, useRef, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  icon?: ReactNode
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
  variant?: 'default' | 'pills' | 'underline'
  children?: ReactNode
}

export function Tabs({ tabs, activeTab, onChange, variant = 'default' }: TabsProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1',
        variant === 'default' && 'p-1 rounded-full glass',
        variant === 'underline' && 'border-b border-white/10'
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all duration-300',
            variant === 'default' && 'rounded-full',
            variant === 'pills' && 'rounded-xl',
            activeTab === tab.id
              ? 'text-white'
              : 'text-white/60 hover:text-white/80'
          )}
        >
          {tab.icon}
          {tab.label}

          {/* Active indicator */}
          {activeTab === tab.id && (
            <motion.div
              layoutId="tab-indicator"
              className={cn(
                'absolute inset-0 -z-10',
                variant === 'default' && 'bg-primary-500 rounded-full',
                variant === 'pills' && 'bg-white/10 rounded-xl',
                variant === 'underline' &&
                  'border-b-2 border-primary-500 rounded-none bg-transparent bottom-0 top-auto h-0.5'
              )}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  )
}

interface TabPanelProps {
  value: string
  activeValue: string
  children: ReactNode
}

export function TabPanel({ value, activeValue, children }: TabPanelProps) {
  return (
    <AnimatePresence mode="wait">
      {value === activeValue && (
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
