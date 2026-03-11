export default function HeroSection() {
  const scrollToCalculator = () => {
    const calculator = document.getElementById('calculator')
    calculator?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-haie-cream-50 via-white to-haie-green-50 bg-noise">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid opacity-40"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div className="animate-slide-up">
            <div className="inline-block px-4 py-2 bg-haie-green-100 text-haie-green-800 rounded-full text-sm font-medium mb-6">
              Service professionnel au Québec
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-haie-green-900 mb-6 leading-tight">
              Vos haies
              <br />
              <span className="text-haie-green-700">impeccables</span>
              <br />
              en 1 appel
            </h1>

            <p className="text-xl lg:text-2xl text-haie-green-600 mb-8 font-light leading-relaxed">
              Soumission gratuite et instantanée. Service rapide, résultats professionnels.
              Spécialistes du cèdre depuis 2020.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={scrollToCalculator}
                className="group px-8 py-4 bg-haie-green-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-haie-green-800 transition-all duration-150 transform hover:-translate-y-0.5"
              >
                Soumission gratuite en 30s
                <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
              </button>

              <a
                href="tel:+15147777777"
                className="px-8 py-4 bg-white text-haie-green-900 border-2 border-haie-green-700 rounded-xl font-bold text-lg hover:bg-haie-green-50 transition-all duration-150"
              >
                Appeler maintenant
              </a>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap gap-8 text-sm">
              <div className="flex items-center gap-2 text-haie-green-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-medium">4.9/5</span>
                <span className="text-haie-green-600">(250+ avis)</span>
              </div>

              <div className="flex items-center gap-2 text-haie-green-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">67% taux de conversion</span>
              </div>

              <div className="flex items-center gap-2 text-haie-green-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Réponse sous 24h</span>
              </div>
            </div>
          </div>

          {/* Right: Illustration */}
          <div className="relative animate-fade-in">
            <div className="aspect-square bg-gradient-to-br from-haie-green-600 to-haie-green-800 rounded-3xl shadow-2xl overflow-hidden">
              {/* SVG illustration of cedar hedge */}
              <svg viewBox="0 0 400 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Ground */}
                <rect x="0" y="300" width="400" height="100" fill="#1a4d2e" opacity="0.3"/>

                {/* Hedge shapes - stylized cedar trees */}
                {[0, 1, 2, 3].map((i) => (
                  <g key={i} transform={`translate(${i * 100}, 0)`}>
                    {/* Tree trunk */}
                    <rect x="40" y="250" width="20" height="50" fill="#163e24"/>

                    {/* Foliage - triangle shape */}
                    <path
                      d="M 50 100 L 10 250 L 90 250 Z"
                      fill="#237a52"
                      opacity="0.9"
                    />
                    <path
                      d="M 50 120 L 20 240 L 80 240 Z"
                      fill="#339768"
                      opacity="0.8"
                    />
                    <path
                      d="M 50 140 L 30 230 L 70 230 Z"
                      fill="#54b385"
                      opacity="0.7"
                    />
                  </g>
                ))}

                {/* Trimming effect - scissors icon */}
                <g transform="translate(320, 120)">
                  <path
                    d="M 10 10 L 30 30 M 30 10 L 10 30"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="10" cy="10" r="5" fill="white" opacity="0.8"/>
                  <circle cx="30" cy="30" r="5" fill="white" opacity="0.8"/>
                </g>
              </svg>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-center">
                <div className="text-3xl font-bold text-haie-green-900 font-mono">575$</div>
                <div className="text-sm text-haie-green-600">Ticket moyen</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
