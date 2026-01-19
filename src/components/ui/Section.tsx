'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  children?: ReactNode
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'center',
  children,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={cn(
        'mb-12 md:mb-16',
        align === 'center' ? 'text-center mx-auto max-w-3xl' : 'text-left'
      )}
    >
      {eyebrow && (
        <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider uppercase bg-primary-500/10 text-primary-400 rounded-full border border-primary-500/20">
          {eyebrow}
        </span>
      )}

      <h2 className="heading-section mb-4">
        <span className="text-gradient-warm">{title}</span>
      </h2>

      {description && (
        <p className="text-lg text-white/60 leading-relaxed">
          {description}
        </p>
      )}

      {children}
    </motion.div>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <section className="relative pt-32 pb-16 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <h1 className="heading-display mb-6">
            <span className="text-gradient-warm">{title}</span>
          </h1>

          {description && (
            <p className="text-xl text-white/60 leading-relaxed max-w-2xl">
              {description}
            </p>
          )}

          {children}
        </motion.div>
      </div>
    </section>
  )
}
