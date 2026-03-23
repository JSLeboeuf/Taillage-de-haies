export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createLead, getLeadByPhone, logMessageSent } from '@/lib/supabase';
import { servicem8 } from '@/lib/servicem8';
import { sendSMS, formatPhoneQC, isValidQCPhone } from '@/lib/twilio';
import { extractLeadInfo } from '@/lib/openai';
import { calculateQuote, quickEstimate } from '@/lib/quotes';
import { SMS } from '@/lib/sms-templates';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Meta Lead Form webhook format
    // { entry: [{ changes: [{ value: { leadgen_id, form_id, field_data: [...] } }] }] }
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const leadData = change?.value;

    if (!leadData) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    // Extract field data from Meta Lead Form
    const fields: Record<string, string> = {};
    for (const field of leadData.field_data || []) {
      fields[field.name] = Array.isArray(field.values) ? field.values[0] : field.values;
    }

    const name = `${fields.first_name || ''} ${fields.last_name || ''}`.trim() || fields.full_name || 'Inconnu';
    const phone = fields.phone_number || fields.phone || '';
    const email = fields.email || '';
    const city = fields.city || '';
    const hedgeSides = parseInt(fields.hedge_sides || fields.nombre_cotes || '0') || null;
    const notes = fields.comments || fields.notes || '';

    if (!phone || !isValidQCPhone(phone)) {
      console.error('Invalid phone number from Meta lead:', phone);
      return NextResponse.json({ error: 'Invalid phone' }, { status: 400 });
    }

    // Check for duplicate lead (same phone in last 24h)
    const existing = await getLeadByPhone(formatPhoneQC(phone));
    if (existing && isRecent(existing.created_at, 24)) {
      return NextResponse.json({ status: 'duplicate', lead_id: existing.id });
    }

    // Calculate quick estimate if we have sides info
    let estimatedAmount: number | null = null;
    if (hedgeSides) {
      const quote = quickEstimate(hedgeSides, true);
      estimatedAmount = quote.totalWithTax;
    }

    // Create lead in Supabase
    const lead = await createLead({
      name,
      phone: formatPhoneQC(phone),
      email: email || undefined,
      city: city || undefined,
      source: 'meta_ads',
      hedge_sides: hedgeSides || undefined,
      notes: notes || undefined,
    });

    // Create company + job in ServiceM8
    const company = await servicem8.createCompany({
      name,
      address_city: city,
      address_state: 'QC',
      address_country: 'Canada',
    });

    await servicem8.createContact({
      company_uuid: company.uuid,
      first: name.split(' ')[0],
      last: name.split(' ').slice(1).join(' '),
      mobile: formatPhoneQC(phone),
      email,
    });

    const jobDescription = hedgeSides
      ? `Taille de haie ${hedgeSides} côtés + top incluant ramassage (Meta Lead)`
      : `Taille de haie — demande via Meta Ads`;

    await servicem8.createJob({
      company_uuid: company.uuid,
      status: 'Quote',
      description: jobDescription + (notes ? `\n${notes}` : ''),
      job_is_quoted: '1',
    });

    // Send auto-quote SMS if we have an estimate
    if (estimatedAmount) {
      await sendSMS(phone, SMS.quoteAutomatic(name.split(' ')[0], estimatedAmount));
      await logMessageSent({
        lead_id: lead.id,
        channel: 'sms',
        type: 'auto_quote',
        content: SMS.quoteAutomatic(name.split(' ')[0], estimatedAmount),
        recipient_phone: formatPhoneQC(phone),
      });
    }

    return NextResponse.json({
      success: true,
      lead_id: lead.id,
      estimated_amount: estimatedAmount,
    });
  } catch (error) {
    console.error('Meta leads webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Meta webhook verification (GET for challenge)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

function isRecent(dateStr: string, hours: number): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  return (now.getTime() - date.getTime()) < hours * 60 * 60 * 1000;
}
