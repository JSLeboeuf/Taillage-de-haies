import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { sendSMS } from '@/lib/twilio';
import { SMS } from '@/lib/sms-templates';

// Validation schema
const CreateReferralSchema = z.object({
  referrer_phone: z.string().min(10),
  referrer_name: z.string().min(1),
});

// Generate unique referral code (e.g., "JEAN-4X7K")
function generateReferralCode(name: string): string {
  const firstName = name.split(' ')[0].toUpperCase().substring(0, 6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${firstName}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referrer_phone, referrer_name } = CreateReferralSchema.parse(body);

    // Check if referrer already has an active code
    const { data: existing } = await supabaseAdmin
      .from('referrals')
      .select('referral_code, id')
      .eq('referrer_phone', referrer_phone)
      .eq('status', 'pending')
      .single();

    if (existing) {
      // Return existing code instead of creating duplicate
      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/quote?ref=${existing.referral_code}`;

      return NextResponse.json({
        code: existing.referral_code,
        share_url: shareUrl,
        referrer_id: existing.id,
        message: 'Existing referral code reused',
      });
    }

    // Generate unique referral code
    let code = generateReferralCode(referrer_name);
    let attempts = 0;

    // Ensure code is unique (retry up to 5 times)
    while (attempts < 5) {
      const { data: duplicate } = await supabaseAdmin
        .from('referrals')
        .select('id')
        .eq('referral_code', code)
        .single();

      if (!duplicate) break;
      code = generateReferralCode(referrer_name);
      attempts++;
    }

    // Create referral record (referee fields will be populated later via /track)
    const { data: referral, error } = await supabaseAdmin
      .from('referrals')
      .insert({
        referrer_name,
        referrer_phone,
        referral_code: code,
        referee_name: '', // Placeholder - will be updated when code is used
        referee_phone: '', // Placeholder - will be updated when code is used
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Generate shareable URL
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/quote?ref=${code}`;

    // Send SMS to referrer with their code and share link
    const smsBody = SMS.referralRequest(referrer_name, code);
    await sendSMS(referrer_phone, smsBody);

    // Log message sent
    await supabaseAdmin.from('messages_sent').insert({
      recipient_phone: referrer_phone,
      recipient_name: referrer_name,
      message_type: 'referral_request',
      template_name: 'referralRequest',
      content_preview: smsBody.substring(0, 200),
      full_content: smsBody,
      channel: 'sms',
      status: 'sent',
    });

    return NextResponse.json({
      code,
      share_url: shareUrl,
      referrer_id: referral.id,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Referral creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create referral code' },
      { status: 500 }
    );
  }
}
