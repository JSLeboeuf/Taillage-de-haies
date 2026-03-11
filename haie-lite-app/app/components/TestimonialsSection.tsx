export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Marie Tremblay',
      location: 'Brossard',
      rating: 5,
      text: 'Service impeccable! Mes cèdres n\'ont jamais été aussi beaux. L\'équipe est arrivée à l\'heure, a travaillé rapidement et a tout ramassé. Je recommande à 100%.',
      date: 'Il y a 2 semaines',
    },
    {
      name: 'Jean-François Lavoie',
      location: 'Longueuil',
      rating: 5,
      text: 'Prix honnête et travail professionnel. J\'ai obtenu ma soumission en ligne en quelques minutes. Très pratique et transparent. Mes haies de 30m sont parfaites.',
      date: 'Il y a 1 mois',
    },
    {
      name: 'Sophie Gagnon',
      location: 'Vaudreuil-Dorion',
      rating: 5,
      text: 'Excellente expérience du début à la fin. La soumission était précise, pas de surprise sur la facture. L\'équipe est très compétente et soignée.',
      date: 'Il y a 3 semaines',
    },
    {
      name: 'Patrick Bélanger',
      location: 'Saint-Constant',
      rating: 5,
      text: 'Enfin un service qui répond rapidement! J\'ai eu ma confirmation le lendemain et le service a été fait la semaine suivante. Résultat magnifique, merci!',
      date: 'Il y a 1 semaine',
    },
  ]

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-haie-green-900 mb-4">
            Ce que nos clients disent
          </h2>
          <p className="text-xl text-haie-green-600 font-light">
            Plus de 250 clients satisfaits
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-haie-cream-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              style={{
                animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                animationDelay: `${index * 0.05}s`,
                animationFillMode: 'both',
              }}
            >
              {/* Rating stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-haie-cream-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Testimonial text */}
              <p className="text-haie-green-700 leading-relaxed mb-6 text-lg">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-haie-green-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-haie-green-600">
                    {testimonial.location}
                  </div>
                </div>
                <div className="text-xs text-haie-green-500">
                  {testimonial.date}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 bg-haie-green-50 rounded-full px-8 py-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-haie-green-300 to-haie-green-500 border-2 border-white flex items-center justify-center text-white font-bold text-sm"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-haie-green-900">250+</div>
              <div className="text-sm text-haie-green-600">Clients satisfaits</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
