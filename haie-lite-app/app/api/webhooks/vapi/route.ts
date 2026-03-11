import { NextRequest, NextResponse } from 'next/server';
import { extractLeadInfo } from '@/lib/openai';
import { createLead, logMessageSent, supabaseAdmin } from '@/lib/supabase';
import { servicem8 } from '@/lib/servicem8';
import { sendSMS, formatPhoneQC, isValidQCPhone } from '@/lib/twilio';
import { quickEstimate } from '@/lib/quotes';
import { SMS } from '@/lib/sms-templates';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Vapi sends call data when call ends
    const {
      call,
      transcript,
      summary,
      structuredData,
    } = body;

    if (!call || !transcript) {
      return NextResponse.json({ error: 'Missing call data' }, { status: 400 });
    }

    const callerPhone = call.customer?.number || '';

    // Extract lead info from call transcript using GPT-4
    const leadInfo = structuredData || await extractLeadInfo(
      `Transcription d'appel téléphonique:\n${transcript}\n\nRésumé: ${summary || ''}`
    );

    if (!callerPhone && !leadInfo.phone) {
      console.error('No phone number found in Vapi call');
      return NextResponse.json({ error: 'No phone number' }, { status: 400 });
    }

    const phone = formatPhoneQC(callerPhone || leadInfo.phone);

    // Create lead in Supabase
    const lead = await createLead({
      name: leadInfo.name || 'Appel VAPI',
      phone,
      email: leadInfo.email || undefined,
      address: leadInfo.address || undefined,
      city: leadInfo.city || undefined,
      source: 'vapi_call',
      hedge_type: leadInfo.hedge_type || undefined,
      hedge_length_m: leadInfo.hedge_length_m || undefined,
      hedge_height_m: leadInfo.hedge_height_m || undefined,
      hedge_sides: leadInfo.hedge_sides || undefined,
      notes: `Appel VAPI: ${summary || transcript.substring(0, 500)}`,
    });

    // Create in ServiceM8
    const company = await servicem8.createCompany({
      name: leadInfo.name || 'Client VAPI',
      address: leadInfo.address || '',
      address_city: leadInfo.city || '',
      address_state: 'QC',
      address_country: 'Canada',
    });

    await servicem8.createContact({
      company_uuid: company.uuid,
      first: leadInfo.name?.split(' ')[0] || '',
      last: leadInfo.name?.split(' ').slice(1).join(' ') || '',
      mobile: phone,
      email: leadInfo.email || '',
    });

    // Calculate quote if possible
    let estimatedAmount: number | null = null;
    if (leadInfo.hedge_sides) {
      const quote = quickEstimate(leadInfo.hedge_sides, leadInfo.includes_top ?? true);
      estimatedAmount = quote.totalWithTax;
    }

    const description = [
      `Taille de haie`,
      leadInfo.hedge_sides ? `${leadInfo.hedge_sides} côtés` : null,
      leadInfo.includes_top ? '+ top' : null,
      leadInfo.includes_cleanup ? '+ ramassage' : null,
      leadInfo.hedge_length_m ? `~${leadInfo.hedge_length_m}m` : null,
      `(Appel VAPI)`,
    ].filter(Boolean).join(' ');

    const job = await servicem8.createJob({
      company_uuid: company.uuid,
      status: 'Quote',
      description,
      job_is_quoted: '1',
    });

    // Update lead with ServiceM8 references
    await supabaseAdmin
      .from('leads')
      .update({
        servicem8_company_uuid: company.uuid,
        servicem8_job_uuid: job.uuid,
        estimated_amount: estimatedAmount,
      })
      .eq('id', lead.id);

    // Send quote SMS if we have an estimate
    if (estimatedAmount && isValidQCPhone(phone)) {
      const firstName = leadInfo.name?.split(' ')[0] || '';
      await sendSMS(phone, SMS.quoteAutomatic(firstName, estimatedAmount));
      await logMessageSent({
        lead_id: lead.id,
        channel: 'sms',
        type: 'auto_quote',
        content: SMS.quoteAutomatic(firstName, estimatedAmount),
        recipient_phone: phone,
      });
    }

    return NextResponse.json({
      success: true,
      lead_id: lead.id,
      servicem8_job_uuid: job.uuid,
      estimated_amount: estimatedAmount,
    });
  } catch (error) {
    console.error('Vapi webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
