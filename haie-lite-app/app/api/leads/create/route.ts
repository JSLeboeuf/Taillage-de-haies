import { NextRequest, NextResponse } from 'next/server';
import { createLead } from '@/lib/supabase';
import { servicem8 } from '@/lib/servicem8';
import { sendSMS, formatPhoneQC } from '@/lib/twilio';
import { quickEstimate } from '@/lib/quotes';
import { SMS } from '@/lib/sms-templates';
import { z } from 'zod';

const CreateLeadSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  source: z.string(),
  hedge_type: z.enum(['cedar', 'other']).optional(),
  sides: z.number().int().min(1).max(8).optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = CreateLeadSchema.parse(body);

    // Format phone number
    const formattedPhone = formatPhoneQC(validated.phone);

    // Check for duplicates (same phone, last 30 days)
    const { data: existingLeads } = await (await import('@/lib/supabase')).supabaseAdmin
      .from('leads')
      .select('*')
      .eq('phone', formattedPhone)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(1);

    if (existingLeads && existingLeads.length > 0) {
      return NextResponse.json(
        { error: 'Duplicate lead: phone number exists in last 30 days', lead_id: existingLeads[0].id },
        { status: 409 }
      );
    }

    // Split name into first/last
    const nameParts = validated.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    // Create company in ServiceM8
    const company = await servicem8.createCompany({
      name: validated.name,
      phone: formattedPhone,
      email: validated.email,
      address: validated.address || '',
    });

    // Create contact in ServiceM8
    const contact = await servicem8.createContact({
      company_uuid: company.uuid,
      first: firstName,
      last: lastName,
      mobile: formattedPhone,
      email: validated.email,
    });

    // Create job in ServiceM8 with Quote status
    const job = await servicem8.createJob({
      company_uuid: company.uuid,
      status: 'Quote',
      job_address: validated.address || '',
      description: `Taille de haie - ${validated.hedge_type || 'type non spécifié'}${validated.notes ? `\n${validated.notes}` : ''}`,
      job_is_quoted: '0',
    });

    // Calculate quick estimate if we have enough info
    let quoteEstimate = null;
    if (validated.sides) {
      const estimate = quickEstimate(validated.sides, true);
      quoteEstimate = {
        amount: estimate.totalWithTax,
        confidence: estimate.confidence,
      };
    }

    // Create lead in Supabase
    const lead = await createLead({
      name: validated.name,
      phone: formattedPhone,
      email: validated.email,
      address: validated.address,
      city: validated.city,
      source: validated.source,
      hedge_type: validated.hedge_type,
      hedge_sides: validated.sides,
      notes: validated.notes,
    });

    // Send confirmation SMS to client
    try {
      const smsBody = quoteEstimate
        ? SMS.quoteAutomatic(firstName, Math.round(quoteEstimate.amount))
        : `Bonjour ${firstName}! Merci pour votre demande de soumission. Notre équipe vous contactera sous peu. - Haie Lite`;

      await sendSMS(formattedPhone, smsBody);
    } catch (smsError) {
      console.error('Failed to send confirmation SMS:', smsError);
      // Don't fail the whole request if SMS fails
    }

    return NextResponse.json({
      success: true,
      lead_id: lead.id,
      servicem8_company_uuid: company.uuid,
      servicem8_job_uuid: job.uuid,
      quote_estimate: quoteEstimate,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Lead creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}
