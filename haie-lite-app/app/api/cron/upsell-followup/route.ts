import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendSMS } from '@/lib/twilio';
import { servicem8 } from '@/lib/servicem8';
import { SMS } from '@/lib/sms-templates';

// Commission amounts per upsell type
const COMMISSIONS: Record<string, number> = {
  fertilisation: 15,
  pest_treatment: 20,
  winter_protection: 25,
  rejuvenation: 0.03, // 3% of job value (special handling)
  cedar_replacement: 10, // per cedar
  mulching: 15,
};

// Estimated prices per type
const ESTIMATED_PRICES: Record<string, number> = {
  fertilisation: 125,
  pest_treatment: 150,
  winter_protection: 250,
  rejuvenation: 2000,
  cedar_replacement: 100, // per cedar
  mulching: 175,
};

/**
 * Cron: Upsell opportunity follow-up
 * Schedule: Mon-Fri at 11:00am EDT (15:00 UTC)
 * Follows up on pending upsell opportunities
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get flagged upsells not yet quoted
    const { data: upsells } = await supabaseAdmin
      .from('upsell_opportunities')
      .select('*, employees(first_name)')
      .eq('status', 'flagged')
      .order('created_at', { ascending: true })
      .limit(20);

    let sent = 0;
    let errors = 0;

    for (const upsell of upsells || []) {
      try {
        // Get client info from the original job
        const job = await servicem8.getJob(upsell.job_uuid);
        const company = await servicem8.getCompany(job.company_uuid);
        const contacts = await servicem8.getContacts(job.company_uuid);
        const contact = contacts[0];

        if (!contact?.mobile) {
          await supabaseAdmin
            .from('upsell_opportunities')
            .update({ status: 'declined' })
            .eq('id', upsell.id);
          continue;
        }

        const firstName = contact.first || company.name.split(' ')[0];
        const price = upsell.estimated_value || ESTIMATED_PRICES[upsell.service_type] || 150;
        const commission = upsell.service_type === 'rejuvenation'
          ? Math.round(price * 0.03)
          : COMMISSIONS[upsell.service_type] || 15;

        // Select appropriate SMS template
        let smsMessage: string;
        switch (upsell.service_type) {
          case 'fertilisation':
            smsMessage = SMS.upsellFertilisation(firstName, price);
            break;
          case 'pest_treatment':
            smsMessage = SMS.upsellPestTreatment(firstName, upsell.description || 'des signes de parasites', price);
            break;
          case 'winter_protection':
            smsMessage = SMS.upsellWinterProtection(firstName, price);
            break;
          case 'cedar_replacement':
            const count = parseInt(upsell.description?.match(/(\d+)/)?.[1] || '3');
            smsMessage = SMS.upsellCedarReplacement(firstName, count, price);
            break;
          default:
            smsMessage = SMS.upsellGeneric(firstName, upsell.service_type, upsell.description || '', price);
        }

        await sendSMS(contact.mobile, smsMessage);

        // Update upsell status
        await supabaseAdmin
          .from('upsell_opportunities')
          .update({
            status: 'quoted',
            quote_sent_at: new Date().toISOString(),
            commission_amount: commission,
          })
          .eq('id', upsell.id);

        sent++;
      } catch (err) {
        console.error(`Upsell followup error for ${upsell.id}:`, err);
        errors++;
      }
    }

    return NextResponse.json({ success: true, sent, errors });
  } catch (error) {
    console.error('Upsell followup error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
