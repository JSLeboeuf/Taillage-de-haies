export default function ZonesSection() {
  const zones = [
    { name: 'Montréal', premium: true },
    { name: 'Longueuil', premium: false },
    { name: 'Brossard', premium: false },
    { name: 'Saint-Constant', premium: false },
    { name: 'La Prairie', premium: false },
    { name: 'Candiac', premium: false },
    { name: 'Delson', premium: false },
    { name: 'Saint-Lambert', premium: false },
    { name: 'Boucherville', premium: false },
    { name: 'Saint-Bruno', premium: true },
    { name: 'Vaudreuil-Dorion', premium: false },
    { name: 'Sainte-Anne-de-Bellevue', premium: true },
    { name: 'Westmount', premium: true },
    { name: 'Outremont', premium: true },
  ]

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-haie-green-50 to-haie-cream-50 bg-noise">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-haie-green-900 mb-4">
            Zones desservies
          </h2>
          <p className="text-xl text-haie-green-600 font-light">
            Grand Montréal, Rive-Sud et Vaudreuil-Soulanges
          </p>
        </div>

        {/* Map illustration placeholder */}
        <div className="mb-12 bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
          <div className="aspect-video bg-gradient-to-br from-haie-green-100 to-haie-green-200 rounded-xl flex items-center justify-center relative overflow-hidden">
            {/* Stylized map */}
            <svg viewBox="0 0 600 400" className="w-full h-full opacity-30">
              <circle cx="300" cy="200" r="80" fill="#1a4d2e" opacity="0.3"/>
              <circle cx="300" cy="200" r="120" fill="#1a4d2e" opacity="0.2"/>
              <circle cx="300" cy="200" r="160" fill="#1a4d2e" opacity="0.1"/>
              <path d="M 200 200 L 400 200 M 300 100 L 300 300" stroke="#1a4d2e" strokeWidth="2" opacity="0.3"/>
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-haie-green-800 text-2xl font-bold mb-2">50km+</div>
                <div className="text-haie-green-700 text-sm">Zone de service</div>
              </div>
            </div>
          </div>
        </div>

        {/* City badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {zones.map((zone) => (
            <div
              key={zone.name}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-150 hover:-translate-y-0.5 ${
                zone.premium
                  ? 'bg-haie-cream-500 text-white shadow-md hover:shadow-lg'
                  : 'bg-white text-haie-green-700 shadow-sm hover:shadow-md'
              }`}
            >
              {zone.name}
              {zone.premium && (
                <span className="ml-1 text-xs opacity-75">★</span>
              )}
            </div>
          ))}
        </div>

        {/* Info note */}
        <div className="text-center">
          <p className="text-haie-green-600 text-sm">
            <span className="inline-flex items-center gap-1">
              <span className="text-haie-cream-500">★</span>
              Zones premium (+10%)
            </span>
            {' · '}
            Votre ville n'est pas listée?{' '}
            <a href="tel:+15147777777" className="font-medium text-haie-green-700 hover:underline">
              Contactez-nous
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
