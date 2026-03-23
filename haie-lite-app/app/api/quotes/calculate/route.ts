export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { calculateQuote } from '@/lib/quotes';
import { z } from 'zod';

const CalculateQuoteSchema = z.object({
  hedge_type: z.enum(['cedar', 'other']),
  length_meters: z.number().positive(),
  height_meters: z.number().positive(),
  sides: z.number().int().min(1).max(8),
  includes_top: z.boolean(),
  includes_cleanup: z.boolean(),
  includes_rejuvenation: z.boolean(),
  access_difficulty: z.enum(['easy', 'moderate', 'difficult']),
  city: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = CalculateQuoteSchema.parse(body);

    // Calculate quote
    const quote = calculateQuote({
      hedgeType: validated.hedge_type,
      lengthMeters: validated.length_meters,
      heightMeters: validated.height_meters,
      sides: validated.sides,
      includesTop: validated.includes_top,
      includesCleanup: validated.includes_cleanup,
      isRejuvenation: validated.includes_rejuvenation,
      accessDifficulty: validated.access_difficulty,
      city: validated.city,
    });

    // Format text summary for SMS use
    const textSummary = `Estimation: ${quote.recommended}$
Détails:
- Base: ${quote.breakdown.baseCost}$
- Côtés: x${quote.breakdown.sidesMultiplier}
${quote.breakdown.topSurcharge > 0 ? `- Dessus: +${quote.breakdown.topSurcharge}$\n` : ''}${quote.breakdown.cleanupSurcharge > 0 ? `- Ramassage: +${quote.breakdown.cleanupSurcharge}$\n` : ''}${quote.breakdown.rejuvenationSurcharge > 0 ? `- Rabattage: +${quote.breakdown.rejuvenationSurcharge}$\n` : ''}${quote.breakdown.accessSurcharge > 0 ? `- Accès difficile: +${quote.breakdown.accessSurcharge}$\n` : ''}
Sous-total: ${quote.recommended}$
TPS (5%): ${quote.tps}$
TVQ (9.975%): ${quote.tvq}$
TOTAL: ${quote.totalWithTax}$`;

    return NextResponse.json({
      success: true,
      quote: {
        subtotal: quote.recommended,
        tps: quote.tps,
        tvq: quote.tvq,
        total: quote.totalWithTax,
        estimated_min: quote.estimatedMin,
        estimated_max: quote.estimatedMax,
        breakdown: quote.breakdown,
        confidence: quote.confidence,
        text_summary: textSummary,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Quote calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate quote' },
      { status: 500 }
    );
  }
}
