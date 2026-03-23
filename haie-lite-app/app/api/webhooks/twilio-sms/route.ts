export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { classifySMSIntent } from '@/lib/openai';
import { supabaseAdmin, getLeadByPhone, logMessageSent } from '@/lib/supabase';
import { sendSMS } from '@/lib/twilio';
import { servicem8 } from '@/lib/servicem8';
import { SMS } from '@/lib/sms-templates';

export async function POST(request: NextRequest) {
  try {
    // Twilio sends form-encoded data
    const formData = await request.formData();
    const from = (formData.get('From') as string) || '';
    const body = ((formData.get('Body') as string) || '').trim();
    const messageSid = formData.get('MessageSid') as string;

    if (!from || !body) {
      return twimlResponse('');
    }

    // Log inbound message
    await logMessageSent({
      channel: 'sms',
      type: 'inbound',
      content: body,
      recipient_phone: from,
    });

    // Find the lead by phone number
    const lead = await getLeadByPhone(from);

    // Classify intent with AI
    const { intent, confidence } = await classifySMSIntent(body);

    // Check if this is an upsell response
    const pendingUpsell = await supabaseAdmin
      .from('upsell_opportunities')
      .select('*')
      .eq('status', 'quoted')
      .order('quote_sent_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Route based on intent
    switch (intent) {
      case 'confirm':
      case 'upsell_accept': {
        if (pendingUpsell?.data && (intent === 'upsell_accept' || body.toUpperCase() === 'OUI')) {
          // Accept upsell
          await handleUpsellAccepted(pendingUpsell.data, from);
        } else if (lead) {
          // Confirm quote → create Work Order in ServiceM8
          await handleQuoteConfirmed(lead, from);
        }
        break;
      }

      case 'cancel':
      case 'upsell_decline': {
        if (pendingUpsell?.data) {
          await supabaseAdmin
            .from('upsell_opportunities')
            .update({ status: 'declined', client_response: body })
            .eq('id', pendingUpsell.data.id);
        }
        if (lead) {
          await supabaseAdmin
            .from('leads')
            .update({ status: 'cancelled' })
            .eq('id', lead.id);
        }
        break;
      }

      case 'reschedule': {
        if (lead) {
          await sendSMS(from,
            `Pas de problème! Appelez-nous au 514-XXX-XXXX pour reprogrammer. - Haie Lite`
          );
        }
        break;
      }

      case 'question':
      default: {
        // Forward to Henri for manual handling
        await sendSMS(
          process.env.HENRI_PHONE || '',
          `📩 SMS de ${lead?.name || from}: "${body}"\nRépondre à: ${from}`
        );
        break;
      }
    }

    // Return empty TwiML (Twilio expects XML response)
    return twimlResponse('');
  } catch (error) {
    console.error('Twilio SMS webhook error:', error);
    return twimlResponse('');
  }
}

async function handleQuoteConfirmed(lead: any, phone: string) {
  // Update lead status
  await supabaseAdmin
    .from('leads')
    .update({
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
    })
    .eq('id', lead.id);

  // Update ServiceM8 job to Work Order
  if (lead.servicem8_job_uuid) {
    await servicem8.updateJob(lead.servicem8_job_uuid, {
      status: 'Work Order',
    });
  }

  // Send confirmation SMS
  const name = lead.name?.split(' ')[0] || '';
  await sendSMS(phone, SMS.bookingConfirmation(name, 'bientôt', 'AM'));

  // Notify Henri
  await sendSMS(
    process.env.HENRI_PHONE || '',
    `✅ NOUVEAU BOOKING: ${lead.name} (${phone}) a confirmé! Soumission: ${lead.estimated_amount || '?'}$`
  );
}

async function handleUpsellAccepted(upsell: any, phone: string) {
  // Update upsell status
  await supabaseAdmin
    .from('upsell_opportunities')
    .update({
      status: 'accepted',
      client_response: 'OUI',
    })
    .eq('id', upsell.id);

  // Create new job in ServiceM8 for the upsell service
  const serviceDescriptions: Record<string, string> = {
    fertilisation: 'Fertilisation deep root - haie de cèdre',
    pest_treatment: 'Traitement anti-parasites - haie de cèdre',
    winter_protection: 'Protection hivernale - installation toile',
    rejuvenation: 'Rabattage sévère - haie de cèdre',
    cedar_replacement: 'Remplacement de cèdres morts',
    mulching: 'Paillis - base de haie',
  };

  // Get original job to find client
  const originalJob = await servicem8.getJob(upsell.job_uuid);

  await servicem8.createJob({
    company_uuid: originalJob.company_uuid,
    status: 'Work Order',
    description: serviceDescriptions[upsell.service_type] || upsell.description,
    job_is_quoted: '1',
  });

  // Attribute commission to employee
  if (upsell.employee_id && upsell.commission_amount) {
    await supabaseAdmin.from('employee_incentives').insert({
      employee_id: upsell.employee_id,
      type: 'upsell_commission',
      amount: upsell.commission_amount,
      job_uuid: upsell.job_uuid,
      description: `Upsell ${upsell.service_type} accepté`,
      status: 'pending',
    });

    // Notify employee
    const employee = await supabaseAdmin
      .from('employees')
      .select('phone, first_name')
      .eq('id', upsell.employee_id)
      .single();

    if (employee.data?.phone) {
      await sendSMS(
        employee.data.phone,
        SMS.employeeBonusUpsell(
          employee.data.first_name,
          upsell.service_type,
          upsell.commission_amount
        )
      );
    }
  }
}

function twimlResponse(message: string): NextResponse {
  const xml = message
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message}</Message></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'text/xml' },
  });
}
