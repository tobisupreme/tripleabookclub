'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useGSAP() {
  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])
}

export function useFadeIn(options: { delay?: number; duration?: number } = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const { delay = 0, duration = 1 } = options

  useEffect(() => {
    if (!ref.current) return

    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    )
  }, [delay, duration])

  return ref
}

export function useStaggerChildren(selector: string, options: { stagger?: number; delay?: number } = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const { stagger = 0.1, delay = 0 } = options

  useEffect(() => {
    if (!ref.current) return

    const children = ref.current.querySelectorAll(selector)

    gsap.fromTo(
      children,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay,
        stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    )
  }, [selector, stagger, delay])

  return ref
}

export function useHorizontalScroll() {
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !wrapperRef.current) return

    const container = containerRef.current
    const wrapper = wrapperRef.current

    const getScrollAmount = () => {
      return -(wrapper.scrollWidth - container.offsetWidth)
    }

    const tween = gsap.to(wrapper, {
      x: getScrollAmount,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: () => `+=${wrapper.scrollWidth}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    })

    return () => {
      tween.kill()
    }
  }, [])

  return { containerRef, wrapperRef }
}

export function useParallax(speed: number = 0.5) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    gsap.to(ref.current, {
      yPercent: -100 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })
  }, [speed])

  return ref
}

export function useMagneticButton() {
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const button = ref.current

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2

      gsap.to(button, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    const handleMouseLeave = () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)',
      })
    }

    button.addEventListener('mousemove', handleMouseMove)
    button.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      button.removeEventListener('mousemove', handleMouseMove)
      button.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return ref
}

export function useTextReveal() {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    const text = element.innerText
    element.innerHTML = ''

    text.split('').forEach((char) => {
      const span = document.createElement('span')
      span.innerText = char === ' ' ? '\u00A0' : char
      span.style.display = 'inline-block'
      element.appendChild(span)
    })

    gsap.fromTo(
      element.children,
      { opacity: 0, y: 50, rotateX: -90 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.8,
        stagger: 0.02,
        ease: 'back.out(2)',
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    )
  }, [])

  return ref
}
