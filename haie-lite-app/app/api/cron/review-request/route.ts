import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendSMS } from '@/lib/twilio';
import { servicem8 } from '@/lib/servicem8';
import { SMS } from '@/lib/sms-templates';

const GOOGLE_REVIEW_LINK = `https://search.google.com/local/writereview?placeid=${process.env.GOOGLE_PLACE_ID}`;

/**
 * Cron: Review request automation
 * Schedule: Hourly (0 * * * *)
 * Sends Google review requests to customers after job completion
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get scheduled review requests that are due
    const now = new Date().toISOString();
    const { data: actions } = await supabaseAdmin
      .from('scheduled_actions')
      .select('*')
      .eq('action_type', 'review_request')
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .limit(20);

    let sent = 0;
    let errors = 0;

    for (const action of actions || []) {
      try {
        // Get client info from ServiceM8
        const company = await servicem8.getCompany(action.company_uuid);
        const contacts = await servicem8.getContacts(action.company_uuid);
        const contact = contacts[0];

        if (!contact?.mobile) {
          await supabaseAdmin
            .from('scheduled_actions')
            .update({ status: 'skipped' })
            .eq('id', action.id);
          continue;
        }

        const firstName = contact.first || company.name.split(' ')[0];
        await sendSMS(contact.mobile, SMS.reviewRequest(firstName, GOOGLE_REVIEW_LINK));

        await supabaseAdmin
          .from('scheduled_actions')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', action.id);

        sent++;
      } catch (err) {
        console.error(`Review request error for action ${action.id}:`, err);
        await supabaseAdmin
          .from('scheduled_actions')
          .update({ status: 'error' })
          .eq('id', action.id);
        errors++;
      }
    }

    return NextResponse.json({ success: true, sent, errors });
  } catch (error) {
    console.error('Review request cron error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
