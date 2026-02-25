import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

const FlagUpsellSchema = z.object({
  job_uuid: z.string().uuid(),
  employee_id: z.string().uuid(),
  service_type: z.enum([
    'fertilisation',
    'pest',
    'winter_protection',
    'cedar_replacement',
    'rejuvenation',
    'mulching',
  ]),
  notes: z.string().optional(),
  estimated_value: z.number().positive().optional(),
});

// Commission rates by service type
const COMMISSION_RATES = {
  fertilisation: 15,
  pest: 20,
  winter_protection: 25,
  rejuvenation: 0.03, // 3% of value
  cedar_replacement: 10, // per unit
  mulching: 15,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = FlagUpsellSchema.parse(body);

    // Calculate commission amount
    let commissionAmount = 0;
    if (validated.service_type === 'rejuvenation' && validated.estimated_value) {
      commissionAmount = validated.estimated_value * COMMISSION_RATES.rejuvenation;
    } else {
      commissionAmount = COMMISSION_RATES[validated.service_type];
    }

    // Create upsell opportunity in Supabase
    const { data: opportunity, error } = await supabaseAdmin
      .from('upsell_opportunities')
      .insert({
        job_uuid: validated.job_uuid,
        employee_id: validated.employee_id,
        service_type: validated.service_type,
        status: 'identified',
        description: validated.notes,
        estimated_value: validated.estimated_value,
        commission_amount: commissionAmount,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error creating upsell:', error);
      return NextResponse.json(
        { error: 'Failed to create upsell opportunity' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      opportunity_id: opportunity.id,
      commission_amount: commissionAmount,
      service_type: validated.service_type,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Upsell flag error:', error);
    return NextResponse.json(
      { error: 'Failed to flag upsell opportunity' },
      { status: 500 }
    );
  }
}
