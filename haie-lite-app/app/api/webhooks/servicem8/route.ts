export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { servicem8 } from '@/lib/servicem8';
import { supabaseAdmin } from '@/lib/supabase';
import { sendSMS } from '@/lib/twilio';
import { SMS } from '@/lib/sms-templates';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ServiceM8 webhook challenge verification
    if (body.mode === 'subscribe' && body.challenge) {
      return new NextResponse(body.challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    const { object, entry } = body;

    if (!entry || !Array.isArray(entry)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    for (const event of entry) {
      const { uuid, changed_fields, time } = event;
      const resourceUrl = body.resource_url;

      // Fetch full object from ServiceM8
      // (webhooks only contain UUID, not the full object)
      if (object === 'job') {
        const job = await servicem8.getJob(uuid);

        // Job completed → trigger post-job workflows
        if (job.status === 'Completed') {
          await handleJobCompleted(job);
        }

        // Job status changed to Work Order → confirmation needed
        if (job.status === 'Work Order' && changed_fields?.includes('status')) {
          await handleJobWorkOrder(job);
        }

        // Log status change
        await supabaseAdmin.from('job_events').insert({
          job_uuid: uuid,
          event_type: changed_fields?.includes('status') ? 'status_change' : 'update',
          new_status: job.status,
          payload: body,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('ServiceM8 webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleJobCompleted(job: {
  uuid: string;
  company_uuid: string;
  total_invoice_amount: string;
  job_type?: string;
  photo_report_url?: string;
}) {
  // 0. Send rapport photo SMS immediately (if photo URL available)
  if (job.photo_report_url) {
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('phone, name')
      .eq('servicem8_uuid', job.company_uuid)
      .single();

    if (company?.phone) {
      const firstName = company.name?.split(' ')[0] || company.name;
      try {
        await sendSMS(company.phone, SMS.rapportPhoto(firstName, job.photo_report_url));
      } catch (err) {
        console.error('Failed to send rapport photo SMS:', err);
      }
    }
  }

  // 1. Schedule review request (+2h via Supabase)
  const reviewTime = new Date();
  reviewTime.setHours(reviewTime.getHours() + 2);

  await supabaseAdmin.from('scheduled_actions').insert({
    action_type: 'review_request',
    job_uuid: job.uuid,
    company_uuid: job.company_uuid,
    scheduled_for: reviewTime.toISOString(),
    status: 'pending',
  });

  // 2. Schedule referral request (+7 days)
  const referralTime = new Date();
  referralTime.setDate(referralTime.getDate() + 7);

  await supabaseAdmin.from('scheduled_actions').insert({
    action_type: 'referral_request',
    job_uuid: job.uuid,
    company_uuid: job.company_uuid,
    scheduled_for: referralTime.toISOString(),
    status: 'pending',
  });

  // 3. Update daily KPI counter
  const today = new Date().toISOString().split('T')[0];
  const revenue = parseFloat(job.total_invoice_amount || '0');

  await supabaseAdmin.rpc('increment_daily_kpi', {
    p_date: today,
    p_jobs: 1,
    p_revenue: revenue,
  });

  // 4. Schedule annual contract upsell (+14 days) for non-annual clients
  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('plan')
    .eq('company_uuid', job.company_uuid)
    .eq('status', 'active')
    .single();

  const isAnnualClient = subscription?.plan === 'tranquillite' || subscription?.plan === 'immaculee';

  if (!isAnnualClient) {
    const upsellTime = new Date();
    upsellTime.setDate(upsellTime.getDate() + 14);

    await supabaseAdmin.from('scheduled_actions').insert({
      action_type: 'annual_contract_upsell',
      job_uuid: job.uuid,
      company_uuid: job.company_uuid,
      scheduled_for: upsellTime.toISOString(),
      status: 'pending',
    });
  }
}

async function handleJobWorkOrder(job: { uuid: string; company_uuid: string }) {
  // Job confirmed (Quote → Work Order)
  // Update lead status in Supabase
  await supabaseAdmin
    .from('leads')
    .update({ status: 'converted', converted_at: new Date().toISOString() })
    .eq('servicem8_job_uuid', job.uuid);
}
