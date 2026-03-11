import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { servicem8 } from '@/lib/servicem8';
import { sendSMS } from '@/lib/twilio';
import { SMS } from '@/lib/sms-templates';
import { z } from 'zod';

const ConvertUpsellSchema = z.object({
  opportunity_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = ConvertUpsellSchema.parse(body);

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

    // Fetch original job to get company info
    const originalJob = await servicem8.getJob(opportunity.job_uuid);

    // Create service description
    const serviceDescriptions: Record<string, string> = {
      fertilisation: 'Fertilisation de haie',
      pest: 'Traitement antiparasitaire',
      winter_protection: 'Protection hivernale (toile)',
      cedar_replacement: 'Remplacement de cèdres',
      rejuvenation: 'Rabattage sévère / Rajeunissement',
      mulching: 'Installation de paillis',
    };

    const description = serviceDescriptions[opportunity.service_type] || opportunity.service_type;

    // Create new job in ServiceM8
    const newJob = await servicem8.createJob({
      company_uuid: originalJob.company_uuid,
      status: 'Work Order',
      job_address: originalJob.job_address,
      description: `${description}\n(Upsell depuis job ${originalJob.generated_job_id ? '#' + originalJob.generated_job_id : originalJob.uuid})${opportunity.description ? `\n${opportunity.description}` : ''}`,
      job_is_quoted: '1',
      total_invoice_amount: opportunity.quote_amount?.toString() || '0',
    });

    // Update opportunity status to converted
    const { error: updateError } = await supabaseAdmin
      .from('upsell_opportunities')
      .update({
        status: 'converted',
        converted_at: new Date().toISOString(),
        converted_job_uuid: newJob.uuid,
      })
      .eq('id', validated.opportunity_id);

    if (updateError) {
      console.error('Failed to update opportunity:', updateError);
    }

    // Credit commission to employee in employee_incentives table
    if (opportunity.employee_id && opportunity.commission_amount) {
      const { error: incentiveError } = await supabaseAdmin
        .from('employee_incentives')
        .insert({
          employee_id: opportunity.employee_id,
          type: 'upsell_commission',
          amount: opportunity.commission_amount,
          description: `Upsell: ${description}`,
          job_uuid: newJob.uuid,
          status: 'pending',
        });

      if (incentiveError) {
        console.error('Failed to create incentive:', incentiveError);
      }

      // Send notification SMS to employee about earned commission
      try {
        const { data: employee } = await supabaseAdmin
          .from('employees')
          .select('name, phone')
          .eq('id', opportunity.employee_id)
          .single();

        if (employee && employee.phone) {
          const smsBody = SMS.employeeBonusUpsell(
            employee.name,
            description,
            opportunity.commission_amount
          );
          await sendSMS(employee.phone, smsBody);
        }
      } catch (smsError) {
        console.error('Failed to send employee notification:', smsError);
      }
    }

    return NextResponse.json({
      success: true,
      job_uuid: newJob.uuid,
      commission_credited: opportunity.commission_amount || 0,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Upsell convert error:', error);
    return NextResponse.json(
      { error: 'Failed to convert upsell' },
      { status: 500 }
    );
  }
}
