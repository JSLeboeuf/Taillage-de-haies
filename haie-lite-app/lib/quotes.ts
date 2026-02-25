// Quote calculation engine for hedge trimming services
// Based on real ServiceM8 data: average ticket 575$, range 200-7,000$

interface QuoteInput {
  hedgeType: 'cedar' | 'other';
  lengthMeters: number;
  heightMeters: number;
  sides: number;          // 1-8 sides
  includesTop: boolean;
  includesCleanup: boolean;
  isRejuvenation: boolean; // rabattage sévère
  accessDifficulty: 'easy' | 'moderate' | 'difficult'; // ladder/nacelle needed
  city?: string;
}

interface PricingContext {
  month?: number;          // 1-12 for seasonal pricing
  dayOfWeek?: number;      // 0-6 (0=Sunday, 6=Saturday) for weekend pricing
  pendingJobs?: number;    // Number of pending jobs for demand surge pricing
}

interface QuoteResult {
  estimatedMin: number;
  estimatedMax: number;
  recommended: number;
  breakdown: {
    baseCost: number;
    sidesMultiplier: number;
    topSurcharge: number;
    cleanupSurcharge: number;
    rejuvenationSurcharge: number;
    accessSurcharge: number;
    cityAdjustment: number;
    seasonalMultiplier?: number;
    weekendMultiplier?: number;
    volumeDiscount?: number;
    demandSurge?: number;
  };
  tps: number;        // 5% federal tax
  tvq: number;        // 9.975% Quebec tax
  totalWithTax: number;
  confidence: 'high' | 'medium' | 'low';
}

// Base rate per linear meter of hedge (1 side, standard height)
const BASE_RATE_PER_METER = 8.50; // $/m

// Height multipliers
const HEIGHT_MULTIPLIERS: Record<string, number> = {
  low: 1.0,      // < 1.5m
  medium: 1.3,   // 1.5-2.5m
  high: 1.6,     // 2.5-3.5m
  very_high: 2.2, // > 3.5m
};

// Premium cities (higher cost of living = higher pricing)
const PREMIUM_CITIES = [
  'Montreal', 'Montréal', 'Westmount', 'Outremont',
  'Sainte-Anne-de-Bellevue', 'Baie-D\'Urfe', 'Baie-D\'Urfé',
  'Vaudreuil-sur-le-Lac', 'Saint-Bruno-de-Montarville',
];

export function calculateQuote(input: QuoteInput, pricingContext?: PricingContext): QuoteResult {
  const heightCategory =
    input.heightMeters < 1.5 ? 'low' :
    input.heightMeters < 2.5 ? 'medium' :
    input.heightMeters < 3.5 ? 'high' : 'very_high';

  // Base cost: length × base rate × height multiplier
  const baseCost = input.lengthMeters * BASE_RATE_PER_METER * HEIGHT_MULTIPLIERS[heightCategory];

  // Sides multiplier (each additional side adds ~60% of base)
  const sidesMultiplier = 1 + (input.sides - 1) * 0.6;

  // Top trimming: +25% if hedge needs top trimmed
  const topSurcharge = input.includesTop ? baseCost * sidesMultiplier * 0.25 : 0;

  // Cleanup (ramassage): +15%
  const cleanupSurcharge = input.includesCleanup ? baseCost * sidesMultiplier * 0.15 : 0;

  // Rejuvenation (rabattage): +80%
  const rejuvenationSurcharge = input.isRejuvenation ? baseCost * sidesMultiplier * 0.80 : 0;

  // Access difficulty
  const accessMultiplier =
    input.accessDifficulty === 'easy' ? 0 :
    input.accessDifficulty === 'moderate' ? 0.15 : 0.35;
  const accessSurcharge = baseCost * sidesMultiplier * accessMultiplier;

  // City adjustment (+10% for premium areas)
  const isPremium = input.city && PREMIUM_CITIES.some(
    c => c.toLowerCase() === input.city!.toLowerCase()
  );
  const cityAdjustment = isPremium ? baseCost * sidesMultiplier * 0.10 : 0;

  // Calculate recommended price
  let subtotal = (baseCost * sidesMultiplier) + topSurcharge + cleanupSurcharge +
    rejuvenationSurcharge + accessSurcharge + cityAdjustment;

  // Dynamic pricing adjustments (optional)
  let seasonalMultiplier: number | undefined;
  let weekendMultiplier: number | undefined;
  let volumeDiscount: number | undefined;
  let demandSurge: number | undefined;

  if (pricingContext) {
    // Seasonal pricing (March-April = high season, Oct-Nov = end of season)
    if (pricingContext.month !== undefined) {
      if (pricingContext.month === 3 || pricingContext.month === 4) {
        // March-April: +15% (high demand)
        seasonalMultiplier = 1.15;
        subtotal *= seasonalMultiplier;
      } else if (pricingContext.month === 10 || pricingContext.month === 11) {
        // Oct-Nov: -10% (end of season discount)
        seasonalMultiplier = 0.90;
        subtotal *= seasonalMultiplier;
      }
    }

    // Weekend pricing (Saturday only)
    if (pricingContext.dayOfWeek === 6) {
      weekendMultiplier = 1.10;
      subtotal *= weekendMultiplier;
    }

    // Volume discount (>100 linear feet = -5%)
    if (input.lengthMeters > 30.48) { // 100 feet = 30.48 meters
      volumeDiscount = 0.95;
      subtotal *= volumeDiscount;
    }

    // Demand surge (>30 pending jobs = +10%)
    if (pricingContext.pendingJobs !== undefined && pricingContext.pendingJobs > 30) {
      demandSurge = 1.10;
      subtotal *= demandSurge;
    }
  }

  // Apply minimum (never below 250$)
  const recommended = Math.max(250, Math.round(subtotal / 5) * 5); // Round to nearest 5$

  // Range: -15% to +20%
  const estimatedMin = Math.round(recommended * 0.85);
  const estimatedMax = Math.round(recommended * 1.20);

  // Taxes (Quebec: TPS 5% + TVQ 9.975%)
  const tps = Math.round(recommended * 0.05 * 100) / 100;
  const tvq = Math.round(recommended * 0.09975 * 100) / 100;
  const totalWithTax = Math.round((recommended + tps + tvq) * 100) / 100;

  // Confidence based on available info
  const confidence =
    (input.lengthMeters && input.heightMeters && input.sides) ? 'high' :
    (input.lengthMeters || input.heightMeters) ? 'medium' : 'low';

  return {
    estimatedMin,
    estimatedMax,
    recommended,
    breakdown: {
      baseCost: Math.round(baseCost),
      sidesMultiplier,
      topSurcharge: Math.round(topSurcharge),
      cleanupSurcharge: Math.round(cleanupSurcharge),
      rejuvenationSurcharge: Math.round(rejuvenationSurcharge),
      accessSurcharge: Math.round(accessSurcharge),
      cityAdjustment: Math.round(cityAdjustment),
      seasonalMultiplier,
      weekendMultiplier,
      volumeDiscount,
      demandSurge,
    },
    tps,
    tvq,
    totalWithTax,
    confidence,
  };
}

// Quick estimate when limited info (just sides count)
export function quickEstimate(
  sides: number,
  includesTop: boolean = true,
  pricingContext?: PricingContext
): QuoteResult {
  return calculateQuote({
    hedgeType: 'cedar',
    lengthMeters: sides * 8, // Average 8m per side
    heightMeters: 2.0,       // Average height
    sides,
    includesTop,
    includesCleanup: true,
    isRejuvenation: false,
    accessDifficulty: 'easy',
  }, pricingContext);
}

// Export PricingContext for use in API routes
export type { PricingContext };
