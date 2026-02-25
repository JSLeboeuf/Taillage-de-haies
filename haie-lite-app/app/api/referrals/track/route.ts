import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin, createLead } from '@/lib/supabase';

// Validation schema
const TrackReferralSchema = z.object({
  referral_code: z.string().min(1),
  referred_name: z.string().min(1),
  referred_phone: z.string().min(10),
  address: z.string().optional(),
  city: z.string().optional(),
  hedge_length_m: z.number().optional(),
  hedge_height_m: z.number().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referral_code, referred_name, referred_phone, ...leadData } =
      TrackReferralSchema.parse(body);

    // Find the referral by code
    const { data: referral, error: referralError } = await supabaseAdmin
      .from('referrals')
      .select('*')
      .eq('referral_code', referral_code)
      .single();

    if (referralError || !referral) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404 }
      );
    }

    // Check if code is still active (not already converted)
    if (referral.status === 'converted') {
      return NextResponse.json(
        { error: 'Referral code already used' },
        { status: 400 }
      );
    }

    // Create lead with source='referral'
    const lead = await createLead({
      name: referred_name,
      phone: referred_phone,
      source: 'referral',
      address: leadData.address,
      city: leadData.city,
      hedge_length_m: leadData.hedge_length_m,
      hedge_height_m: leadData.hedge_height_m,
      notes: leadData.notes,
    });

    // Update referral with referee info and change status to 'contacted'
    const { error: updateError } = await supabaseAdmin
      .from('referrals')
      .update({
        referee_name: referred_name,
        referee_phone: referred_phone,
        status: 'contacted',
      })
      .eq('id', referral.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      lead_id: lead.id,
      referral_id: referral.id,
      referrer_credited: false, // Credit applied when job is completed
      message: 'Referral tracked successfully',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Referral tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track referral' },
      { status: 500 }
    );
  }
}
