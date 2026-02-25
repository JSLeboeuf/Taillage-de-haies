import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { error: 'Missing phone parameter' },
        { status: 400 }
      );
    }

    // Fetch all referrals for this referrer
    const { data: referrals, error } = await supabaseAdmin
      .from('referrals')
      .select('*')
      .eq('referrer_phone', phone);

    if (error) throw error;

    if (!referrals || referrals.length === 0) {
      return NextResponse.json({
        total_referrals: 0,
        successful_conversions: 0,
        total_earned: 0,
        pending_credits: 0,
        code: null,
      });
    }

    // Calculate stats
    const totalReferrals = referrals.length;
    const successfulConversions = referrals.filter(
      (r) => r.status === 'converted'
    ).length;

    // Total earned (credits that have been applied)
    const totalEarned = referrals
      .filter((r) => r.referrer_credit_applied)
      .reduce((sum, r) => sum + (r.referrer_credit_amount || 0), 0);

    // Pending credits (converted but not yet applied)
    const pendingCredits = referrals
      .filter((r) => r.status === 'converted' && !r.referrer_credit_applied)
      .reduce((sum, r) => sum + (r.referrer_credit_amount || 0), 0);

    // Get the most recent referral code
    const latestReferral = referrals.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    return NextResponse.json({
      total_referrals: totalReferrals,
      successful_conversions: successfulConversions,
      total_earned: totalEarned,
      pending_credits: pendingCredits,
      code: latestReferral.referral_code,
      referrals: referrals.map((r) => ({
        id: r.id,
        referee_name: r.referee_name || 'Pending',
        status: r.status,
        created_at: r.created_at,
        job_amount: r.job_amount,
        credit_applied: r.referrer_credit_applied,
      })),
    });

  } catch (error) {
    console.error('Referral stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referral stats' },
      { status: 500 }
    );
  }
}
