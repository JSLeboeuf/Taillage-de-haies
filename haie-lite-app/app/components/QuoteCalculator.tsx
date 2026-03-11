'use client'

import { useState, useEffect } from 'react'

// Client-side quote calculation logic (mirrors lib/quotes.ts)
interface QuoteParams {
  hedgeType: 'cedar' | 'other'
  lengthMeters: number
  heightMeters: number
  sides: number
  includesTop: boolean
  includesCleanup: boolean
  isRejuvenation: boolean
  accessDifficulty: 'easy' | 'moderate' | 'difficult'
  city: string
}

interface QuoteResult {
  recommended: number
  tps: number
  tvq: number
  totalWithTax: number
  breakdown: {
    baseCost: number
    sidesMultiplier: number
    topSurcharge: number
    cleanupSurcharge: number
    rejuvenationSurcharge: number
    accessSurcharge: number
    cityAdjustment: number
  }
}

const BASE_RATE_PER_METER = 8.5
const HEIGHT_MULTIPLIERS: Record<string, number> = {
  low: 1.0,
  medium: 1.3,
  high: 1.6,
  very_high: 2.2,
}
const PREMIUM_CITIES = [
  'Montreal', 'Montréal', 'Westmount', 'Outremont',
  'Sainte-Anne-de-Bellevue', 'Baie-D\'Urfe', 'Baie-D\'Urfé',
  'Vaudreuil-sur-le-Lac', 'Saint-Bruno-de-Montarville',
]

function calculateQuote(params: QuoteParams): QuoteResult {
  const heightCategory =
    params.heightMeters < 1.5 ? 'low' :
    params.heightMeters < 2.5 ? 'medium' :
    params.heightMeters < 3.5 ? 'high' : 'very_high'

  const baseCost = params.lengthMeters * BASE_RATE_PER_METER * HEIGHT_MULTIPLIERS[heightCategory]
  const sidesMultiplier = 1 + (params.sides - 1) * 0.6
  const topSurcharge = params.includesTop ? baseCost * sidesMultiplier * 0.25 : 0
  const cleanupSurcharge = params.includesCleanup ? baseCost * sidesMultiplier * 0.15 : 0
  const rejuvenationSurcharge = params.isRejuvenation ? baseCost * sidesMultiplier * 0.80 : 0
  const accessMultiplier =
    params.accessDifficulty === 'easy' ? 0 :
    params.accessDifficulty === 'moderate' ? 0.15 : 0.35
  const accessSurcharge = baseCost * sidesMultiplier * accessMultiplier
  const isPremium = PREMIUM_CITIES.some(
    c => c.toLowerCase() === params.city.toLowerCase()
  )
  const cityAdjustment = isPremium ? baseCost * sidesMultiplier * 0.10 : 0

  const subtotal = (baseCost * sidesMultiplier) + topSurcharge + cleanupSurcharge +
    rejuvenationSurcharge + accessSurcharge + cityAdjustment

  const recommended = Math.max(250, Math.round(subtotal / 5) * 5)
  const tps = Math.round(recommended * 0.05 * 100) / 100
  const tvq = Math.round(recommended * 0.09975 * 100) / 100
  const totalWithTax = Math.round((recommended + tps + tvq) * 100) / 100

  return {
    recommended,
    tps,
    tvq,
    totalWithTax,
    breakdown: {
      baseCost: Math.round(baseCost),
      sidesMultiplier,
      topSurcharge: Math.round(topSurcharge),
      cleanupSurcharge: Math.round(cleanupSurcharge),
      rejuvenationSurcharge: Math.round(rejuvenationSurcharge),
      accessSurcharge: Math.round(accessSurcharge),
      cityAdjustment: Math.round(cityAdjustment),
    },
  }
}

interface ContactFormData {
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
  city: string
}

export default function QuoteCalculator() {
  // Quote parameters
  const [hedgeType, setHedgeType] = useState<'cedar' | 'other'>('cedar')
  const [lengthMeters, setLengthMeters] = useState(15)
  const [heightMeters, setHeightMeters] = useState(2.0)
  const [sides, setSides] = useState(2)
  const [includesTop, setIncludesTop] = useState(true)
  const [includesCleanup, setIncludesCleanup] = useState(true)
  const [isRejuvenation, setIsRejuvenation] = useState(false)
  const [accessDifficulty, setAccessDifficulty] = useState<'easy' | 'moderate' | 'difficult'>('easy')
  const [city, setCity] = useState('')

  // Contact form
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactForm, setContactForm] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Calculate quote in real-time
  const [quote, setQuote] = useState<QuoteResult | null>(null)

  useEffect(() => {
    const result = calculateQuote({
      hedgeType,
      lengthMeters,
      heightMeters,
      sides,
      includesTop,
      includesCleanup,
      isRejuvenation,
      accessDifficulty,
      city,
    })
    setQuote(result)
  }, [hedgeType, lengthMeters, heightMeters, sides, includesTop, includesCleanup, isRejuvenation, accessDifficulty, city])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')

    try {
      const response = await fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'website_form',
          first_name: contactForm.firstName,
          last_name: contactForm.lastName,
          phone: contactForm.phone,
          email: contactForm.email,
          address: contactForm.address,
          city: contactForm.city,
          hedge_length_estimate: lengthMeters,
          hedge_height_estimate: heightMeters,
          quote_amount: quote?.totalWithTax,
          notes: `Soumission calculée: ${quote?.totalWithTax}$ (${sides} côtés, ${lengthMeters}m × ${heightMeters}m)`,
        }),
      })

      if (!response.ok) throw new Error('Erreur lors de la soumission')

      setSubmitSuccess(true)
      setShowContactForm(false)
    } catch (error) {
      setSubmitError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 text-center animate-scale-in">
        <div className="w-16 h-16 bg-haie-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-haie-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-haie-green-900 mb-4">Merci pour votre demande!</h3>
        <p className="text-haie-green-700 mb-6">
          Nous avons bien reçu votre soumission de <span className="font-bold font-mono">{quote?.totalWithTax}$</span>.
          Notre équipe vous contactera dans les 24 heures.
        </p>
        <button
          onClick={() => {
            setSubmitSuccess(false)
            setContactForm({
              firstName: '',
              lastName: '',
              phone: '',
              email: '',
              address: '',
              city: '',
            })
          }}
          className="px-6 py-3 bg-haie-green-700 text-white rounded-lg font-medium hover:bg-haie-green-800 transition-all duration-150"
        >
          Nouvelle soumission
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Quote Calculator */}
      <div className="p-8 lg:p-12">
        <h2 className="text-3xl lg:text-4xl font-bold text-haie-green-900 mb-2">
          Calculateur de soumission
        </h2>
        <p className="text-haie-green-600 mb-8">
          Obtenez un prix instantané pour votre projet
        </p>

        <div className="space-y-6">
          {/* Hedge Type */}
          <div>
            <label className="block text-sm font-medium text-haie-green-900 mb-2">
              Type de haie
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setHedgeType('cedar')}
                className={`px-4 py-3 rounded-lg border-2 font-medium transition-all duration-150 ${
                  hedgeType === 'cedar'
                    ? 'border-haie-green-700 bg-haie-green-50 text-haie-green-900'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-haie-green-300'
                }`}
              >
                Cèdre
              </button>
              <button
                type="button"
                onClick={() => setHedgeType('other')}
                className={`px-4 py-3 rounded-lg border-2 font-medium transition-all duration-150 ${
                  hedgeType === 'other'
                    ? 'border-haie-green-700 bg-haie-green-50 text-haie-green-900'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-haie-green-300'
                }`}
              >
                Autre
              </button>
            </div>
          </div>

          {/* Length */}
          <div>
            <label className="block text-sm font-medium text-haie-green-900 mb-2">
              Longueur: <span className="font-mono text-haie-green-700">{lengthMeters}m</span>
            </label>
            <input
              type="range"
              min="3"
              max="100"
              step="1"
              value={lengthMeters}
              onChange={(e) => setLengthMeters(Number(e.target.value))}
              className="w-full h-2 bg-haie-green-100 rounded-lg appearance-none cursor-pointer accent-haie-green-700"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>3m</span>
              <span>100m</span>
            </div>
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-haie-green-900 mb-2">
              Hauteur: <span className="font-mono text-haie-green-700">{heightMeters}m</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={heightMeters}
              onChange={(e) => setHeightMeters(Number(e.target.value))}
              className="w-full h-2 bg-haie-green-100 rounded-lg appearance-none cursor-pointer accent-haie-green-700"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.5m</span>
              <span>5m</span>
            </div>
          </div>

          {/* Sides */}
          <div>
            <label className="block text-sm font-medium text-haie-green-900 mb-2">
              Nombre de côtés: <span className="font-mono text-haie-green-700">{sides}</span>
            </label>
            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={sides}
              onChange={(e) => setSides(Number(e.target.value))}
              className="w-full h-2 bg-haie-green-100 rounded-lg appearance-none cursor-pointer accent-haie-green-700"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 côté</span>
              <span>8 côtés</span>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={includesTop}
                onChange={(e) => setIncludesTop(e.target.checked)}
                className="w-5 h-5 text-haie-green-700 border-gray-300 rounded focus:ring-haie-green-700"
              />
              <span className="text-sm font-medium text-haie-green-900 group-hover:text-haie-green-700 transition-colors">
                Tailler le dessus (+25%)
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={includesCleanup}
                onChange={(e) => setIncludesCleanup(e.target.checked)}
                className="w-5 h-5 text-haie-green-700 border-gray-300 rounded focus:ring-haie-green-700"
              />
              <span className="text-sm font-medium text-haie-green-900 group-hover:text-haie-green-700 transition-colors">
                Ramassage (+15%)
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isRejuvenation}
                onChange={(e) => setIsRejuvenation(e.target.checked)}
                className="w-5 h-5 text-haie-green-700 border-gray-300 rounded focus:ring-haie-green-700"
              />
              <span className="text-sm font-medium text-haie-green-900 group-hover:text-haie-green-700 transition-colors">
                Rabattage sévère (+80%)
              </span>
            </label>
          </div>

          {/* Access Difficulty */}
          <div>
            <label className="block text-sm font-medium text-haie-green-900 mb-2">
              Difficulté d'accès
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['easy', 'moderate', 'difficult'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setAccessDifficulty(level)}
                  className={`px-3 py-2 text-sm rounded-lg border-2 font-medium transition-all duration-150 ${
                    accessDifficulty === level
                      ? 'border-haie-green-700 bg-haie-green-50 text-haie-green-900'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-haie-green-300'
                  }`}
                >
                  {level === 'easy' ? 'Facile' : level === 'moderate' ? 'Modéré' : 'Difficile'}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-haie-green-900 mb-2">
              Ville (optionnel)
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: Montréal, Longueuil, Vaudreuil..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-haie-green-700 focus:ring-0 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Price Display */}
      {quote && (
        <div className="bg-gradient-to-br from-haie-green-700 to-haie-green-900 p-8 lg:p-12 text-white">
          <div className="text-center mb-8">
            <p className="text-haie-green-200 text-sm font-medium mb-2">Prix estimé</p>
            <div className="text-5xl lg:text-6xl font-bold font-mono mb-4 animate-fade-in">
              {quote.totalWithTax.toFixed(2)}$
            </div>
            <p className="text-haie-green-200 text-sm">
              TPS ({quote.tps.toFixed(2)}$) + TVQ ({quote.tvq.toFixed(2)}$) incluses
            </p>
          </div>

          {/* Breakdown */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-haie-green-100">Coût de base</span>
              <span className="font-mono font-medium">{quote.breakdown.baseCost}$</span>
            </div>
            {quote.breakdown.topSurcharge > 0 && (
              <div className="flex justify-between">
                <span className="text-haie-green-100">Dessus</span>
                <span className="font-mono font-medium">+{quote.breakdown.topSurcharge}$</span>
              </div>
            )}
            {quote.breakdown.cleanupSurcharge > 0 && (
              <div className="flex justify-between">
                <span className="text-haie-green-100">Ramassage</span>
                <span className="font-mono font-medium">+{quote.breakdown.cleanupSurcharge}$</span>
              </div>
            )}
            {quote.breakdown.rejuvenationSurcharge > 0 && (
              <div className="flex justify-between">
                <span className="text-haie-green-100">Rabattage</span>
                <span className="font-mono font-medium">+{quote.breakdown.rejuvenationSurcharge}$</span>
              </div>
            )}
            {quote.breakdown.accessSurcharge > 0 && (
              <div className="flex justify-between">
                <span className="text-haie-green-100">Accès difficile</span>
                <span className="font-mono font-medium">+{quote.breakdown.accessSurcharge}$</span>
              </div>
            )}
            {quote.breakdown.cityAdjustment > 0 && (
              <div className="flex justify-between">
                <span className="text-haie-green-100">Zone premium</span>
                <span className="font-mono font-medium">+{quote.breakdown.cityAdjustment}$</span>
              </div>
            )}
          </div>

          {!showContactForm ? (
            <button
              onClick={() => setShowContactForm(true)}
              className="w-full py-4 bg-white text-haie-green-900 rounded-lg font-bold text-lg hover:bg-haie-cream-50 transition-all duration-150 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Réserver maintenant
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Prénom"
                  value={contactForm.firstName}
                  onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                  className="px-4 py-3 rounded-lg bg-white text-haie-green-900 placeholder-gray-400 focus:ring-2 focus:ring-haie-cream-500"
                />
                <input
                  type="text"
                  required
                  placeholder="Nom"
                  value={contactForm.lastName}
                  onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                  className="px-4 py-3 rounded-lg bg-white text-haie-green-900 placeholder-gray-400 focus:ring-2 focus:ring-haie-cream-500"
                />
              </div>
              <input
                type="tel"
                required
                placeholder="Téléphone"
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white text-haie-green-900 placeholder-gray-400 focus:ring-2 focus:ring-haie-cream-500"
              />
              <input
                type="email"
                placeholder="Courriel (optionnel)"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white text-haie-green-900 placeholder-gray-400 focus:ring-2 focus:ring-haie-cream-500"
              />
              <input
                type="text"
                required
                placeholder="Adresse"
                value={contactForm.address}
                onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white text-haie-green-900 placeholder-gray-400 focus:ring-2 focus:ring-haie-cream-500"
              />
              <input
                type="text"
                required
                placeholder="Ville"
                value={contactForm.city}
                onChange={(e) => setContactForm({ ...contactForm, city: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white text-haie-green-900 placeholder-gray-400 focus:ring-2 focus:ring-haie-cream-500"
              />
              {submitError && (
                <p className="text-red-200 text-sm">{submitError}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-white text-haie-green-900 rounded-lg font-bold hover:bg-haie-cream-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Envoi...' : 'Envoyer la demande'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
