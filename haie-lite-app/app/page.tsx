import HeroSection from './components/HeroSection'
import QuoteCalculator from './components/QuoteCalculator'
import HowItWorksSection from './components/HowItWorksSection'
import ZonesSection from './components/ZonesSection'
import TestimonialsSection from './components/TestimonialsSection'
import FAQSection from './components/FAQSection'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'

export default function Home() {
  return (
    <main className="min-h-screen bg-haie-cream-50">
      {/* Hero section */}
      <HeroSection />

      {/* Quote Calculator - main conversion element */}
      <section id="calculator" className="py-20 lg:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <QuoteCalculator />
        </div>
      </section>

      {/* How it works */}
      <HowItWorksSection />

      {/* Service zones */}
      <ZonesSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* FAQ */}
      <FAQSection />

      {/* Footer */}
      <Footer />

      {/* Scroll to top button */}
      <ScrollToTop />
    </main>
  )
}
