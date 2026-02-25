'use client'

import { useState } from 'react'

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: 'Comment fonctionne le calculateur de prix?',
      answer: 'Notre calculateur utilise les dimensions de vos haies, le nombre de côtés, et les options choisies pour calculer un prix instantané. Le prix est basé sur nos tarifs réels et inclut les taxes (TPS + TVQ). Vous pouvez ajuster les paramètres pour voir comment le prix change.',
    },
    {
      question: 'Le prix affiché est-il garanti?',
      answer: 'Le prix calculé est une estimation précise basée sur les informations fournies. Le prix final peut varier légèrement (+/- 15%) selon les conditions réelles sur place. Nous confirmons toujours le prix exact avant de commencer le travail.',
    },
    {
      question: 'Combien de temps prend le service?',
      answer: 'Pour des haies résidentielles standard (15-30m), le service prend généralement 1-3 heures incluant le ramassage. Les projets plus importants peuvent prendre une demi-journée ou plus. Nous vous donnons une estimation précise lors de la confirmation.',
    },
    {
      question: 'Quelle est votre zone de service?',
      answer: 'Nous couvrons le Grand Montréal, la Rive-Sud (Longueuil, Brossard, Saint-Constant, etc.) et Vaudreuil-Soulanges. Les zones premium (Westmount, Outremont, etc.) ont un supplément de 10%. Contactez-nous si votre ville n\'est pas listée.',
    },
    {
      question: 'Quand puis-je réserver le service?',
      answer: 'Notre saison de taille va de mars à octobre. Les meilleurs moments sont mai-juin et août-septembre. Nous recommandons de tailler vos cèdres 1-2 fois par an pour un résultat optimal.',
    },
    {
      question: 'Le ramassage est-il inclus?',
      answer: 'Le ramassage des résidus est optionnel (+15%). Si vous choisissez cette option, nous ramassons et disposons de toutes les branches coupées. Sinon, nous laissons les résidus sur place pour que vous puissiez les gérer vous-même.',
    },
    {
      question: 'Offrez-vous une garantie?',
      answer: 'Oui! Nous garantissons la qualité de notre travail. Si vous n\'êtes pas satisfait du résultat, nous revenons gratuitement pour corriger. Nos équipes sont formées et expérimentées pour assurer un résultat professionnel.',
    },
    {
      question: 'Comment puis-je payer?',
      answer: 'Nous acceptons les paiements par virement Interac, carte de crédit, ou comptant. Le paiement est dû à la fin du service. Vous recevrez une facture détaillée par courriel.',
    },
  ]

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-haie-cream-50 to-white bg-noise">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-haie-green-900 mb-4">
            Questions fréquentes
          </h2>
          <p className="text-xl text-haie-green-600 font-light">
            Tout ce que vous devez savoir
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-haie-cream-50 transition-colors"
              >
                <span className="font-bold text-haie-green-900 text-lg">
                  {faq.question}
                </span>
                <svg
                  className={`w-6 h-6 text-haie-green-700 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 text-haie-green-700 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions CTA */}
        <div className="mt-16 text-center bg-haie-green-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-haie-green-900 mb-3">
            Vous avez d'autres questions?
          </h3>
          <p className="text-haie-green-600 mb-6">
            Notre équipe est là pour vous aider
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+15147777777"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-haie-green-700 text-white rounded-lg font-medium hover:bg-haie-green-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Appelez-nous
            </a>
            <a
              href="mailto:info@haielite.ca"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-haie-green-900 border-2 border-haie-green-700 rounded-lg font-medium hover:bg-haie-green-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Envoyez un courriel
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
