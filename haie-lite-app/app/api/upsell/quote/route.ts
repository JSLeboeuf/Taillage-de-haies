import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { servicem8 } from '@/lib/servicem8';
import { sendSMS } from '@/lib/twilio';
import { SMS } from '@/lib/sms-templates';
import { z } from 'zod';

const UpsellQuoteSchema = z.object({
  opportunity_id: z.string().uuid(),
  details: z.record(z.any()),
});

// Pricing logic by service type
function calculateUpsellPrice(serviceType: string, details: Record<string, any>): number {
  switch (serviceType) {
    case 'fertilisation':
      const linearMeters = details.linear_meters || 50;
      return Math.round(linearMeters * 2.5); // $2.50/m

    case 'pest':
      const area = details.area_sqm || 100;
      return Math.round(area * 1.8); // $1.80/sqm

    case 'winter_protection':
      const hedgeLength = details.hedge_length_m || 20;
      return Math.round(hedgeLength * 8); // $8/m for burlap installation

    case 'cedar_replacement':
      const count = details.cedar_count || 5;
      const heightFt = details.height_ft || 6;
      return count * (heightFt * 15); // $15/ft per cedar

    case 'rejuvenation':
      const sides = details.sides || 4;
      const length = details.length_m || 30;
      return Math.round(length * sides * 12); // $12/m per side for heavy pruning

    case 'mulching':
      const mulchArea = details.area_sqm || 50;
      return Math.round(mulchArea * 3.5); // $3.50/sqm

    default:
      return details.custom_price || 250;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = UpsellQuoteSchema.parse(body);

    // Fetch opportunity from Supabase
    const { data: opportunity, error: fetchError } = await supabaseAdmin
      .from('upsell_opportunities')
      .select('*')
      .eq('id', validated.opportunity_id)
      .single();

    if (fetchError || !opportunity) {
      return NextResponse.json(
        { error: 'Upsell opportunity not found' },
        { status: 404 }
      );
    }

    // Calculate price based on service type and details
    const quoteAmount = calculateUpsellPrice(opportunity.service_type, validated.details);

    // Apply Quebec taxes
    const tps = Math.round(quoteAmount * 0.05 * 100) / 100;
    const tvq = Math.round(quoteAmount * 0.09975 * 100) / 100;
    const totalWithTax = Math.round((quoteAmount + tps + tvq) * 100) / 100;

    // Update opportunity with quote amount and status
    const { error: updateError } = await supabaseAdmin
      .from('upsell_opportunities')
      .update({
        quote_amount: totalWithTax,
        status: 'quoted',
        quote_sent_at: new Date().toISOString(),
      })
      .eq('id', validated.opportunity_id);

    if (updateError) {
      console.error('Failed to update opportunity:', updateError);
      return NextResponse.json(
        { error: 'Failed to update opportunity' },
        { status: 500 }
      );
    }

    // Get customer info from job
    try {
      const job = await servicem8.getJob(opportunity.job_uuid);
      const company = await servicem8.getCompany(job.company_uuid!);
      const contacts = await servicem8.getContacts(job.company_uuid!);

      if (contacts.length > 0) {
        const contact = contacts[0];
        const firstName = contact.first;

        // Send SMS with upsell offer
        let smsBody = '';
        switch (opportunity.service_type) {
          case 'fertilisation':
            smsBody = SMS.upsellFertilisation(firstName, totalWithTax);
            break;
          case 'pest':
            const issue = validated.details.issue || 'parasites';
            smsBody = SMS.upsellPestTreatment(firstName, issue, totalWithTax);
            break;
          case 'winter_protection':
            smsBody = SMS.upsellWinterProtection(firstName, totalWithTax);
            break;
          case 'cedar_replacement':
            const count = validated.details.cedar_count || 'plusieurs';
            smsBody = SMS.upsellCedarReplacement(firstName, count, totalWithTax);
            break;
          default:
            const serviceName = opportunity.service_type.replace('_', ' ');
            const benefit = validated.details.benefit || 'votre haie';
            smsBody = SMS.upsellGeneric(firstName, serviceName, benefit, totalWithTax);
        }

        await sendSMS(contact.mobile!, smsBody);
      }
    } catch (smsError) {
      console.error('Failed to send upsell SMS:', smsError);
      // Don't fail the request if SMS fails
    }

    return NextResponse.json({
      success: true,
      quote: {
        subtotal: quoteAmount,
        tps,
        tvq,
        total: totalWithTax,
        service_type: opportunity.service_type,
        details: validated.details,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Upsell quote error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upsell quote' },
      { status: 500 }
    );
  }
}
