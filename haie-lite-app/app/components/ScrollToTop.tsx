'use client'

export default function ScrollToTop() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-8 w-12 h-12 bg-haie-green-700 text-white rounded-full shadow-lg hover:bg-haie-green-800 hover:shadow-xl transition-all duration-150 flex items-center justify-center group z-50"
      aria-label="Retour en haut"
    >
      <svg
        className="w-6 h-6 transition-transform group-hover:-translate-y-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  )
}
