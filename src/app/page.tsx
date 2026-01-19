import { Hero } from '@/components/home/Hero'
import { FeaturedBooks } from '@/components/home/FeaturedBooks'
import { HorizontalScroll } from '@/components/home/HorizontalScroll'
import { Stats } from '@/components/home/Stats'
import { CallToAction } from '@/components/home/CallToAction'
import { Testimonials } from '@/components/home/Testimonials'

export default function HomePage() {
  return (
    <div className="page-enter">
      <Hero />
      <FeaturedBooks />
      <HorizontalScroll />
      <Stats />
      <Testimonials />
      <CallToAction />
    </div>
  )
}
