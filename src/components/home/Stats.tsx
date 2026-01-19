'use client'

import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import gsap from 'gsap'

const stats = [
  { value: 18, suffix: '', label: 'Books/Year', isDecimal: false },
  { value: 20, suffix: '+', label: 'Active Members', isDecimal: false },
  { value: 12, suffix: '', label: 'Monthly Discussions', isDecimal: false },
  { value: 4, suffix: '', label: 'Activities', isDecimal: false },
]

function AnimatedCounter({ value, suffix = '', isDecimal = false }: { value: number; suffix?: string; isDecimal?: boolean }) {
  const countRef = useRef<HTMLSpanElement>(null)
  const inView = useInView(countRef, { once: true })

  useEffect(() => {
    if (!countRef.current || !inView) return

    gsap.fromTo(
      countRef.current,
      { textContent: 0 },
      {
        textContent: value,
        duration: 2,
        ease: 'power2.out',
        snap: { textContent: isDecimal ? 0.1 : 1 },
        onUpdate: function () {
          if (countRef.current) {
            const num = parseFloat(countRef.current.textContent || '0')
            countRef.current.textContent = isDecimal ? num.toFixed(1) : Math.floor(num).toString()
          }
        },
      }
    )
  }, [value, isDecimal, inView])

  return (
    <>
      <span ref={countRef}>0</span>
      {suffix}
    </>
  )
}

export function Stats() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-primary-950/20 to-dark-950" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="container-main relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="heading-section text-gradient-warm mb-4">
            Growing Together
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Our community continues to grow, one page at a time.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-gradient mb-2">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  isDecimal={stat.isDecimal}
                />
              </div>
              <div className="text-white/60">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
