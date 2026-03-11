export default function HowItWorksSection() {
  const steps = [
    {
      number: '1',
      title: 'Soumission instantanée',
      description: 'Utilisez notre calculateur pour obtenir un prix précis en 30 secondes. Aucune information personnelle requise pour voir le prix.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      number: '2',
      title: 'Confirmation rapide',
      description: 'Notre équipe vous contacte dans les 24h pour confirmer les détails et planifier votre rendez-vous selon vos disponibilités.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      number: '3',
      title: 'Service professionnel',
      description: 'Notre équipe qualifiée taille vos haies avec soin et précision. Ramassage inclus. Résultat impeccable garanti.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
  ]

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-haie-green-900 mb-4">
            Comment ça marche
          </h2>
          <p className="text-xl text-haie-green-600 font-light">
            Simple, rapide, professionnel
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative group"
              style={{
                animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'both',
              }}
            >
              {/* Connector line (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-haie-green-300 to-transparent -z-10"></div>
              )}

              {/* Step card */}
              <div className="relative bg-haie-cream-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                {/* Number badge */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-haie-green-700 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-haie-green-700 mb-6 shadow-sm group-hover:shadow-md transition-shadow">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-haie-green-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-haie-green-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="#calculator"
            className="inline-block px-8 py-4 bg-haie-green-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-haie-green-800 transition-all duration-150 transform hover:-translate-y-0.5"
          >
            Commencer maintenant
          </a>
        </div>
      </div>
    </section>
  )
}
