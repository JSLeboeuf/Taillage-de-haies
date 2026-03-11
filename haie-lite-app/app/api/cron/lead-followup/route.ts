import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getLeadsForFollowup, logMessageSent } from '@/lib/supabase';
import { sendSMS } from '@/lib/twilio';
import { SMS } from '@/lib/sms-templates';

/**
 * Cron: Lead follow-up automation
 * Schedule: Mon-Fri at 10:00am EDT (14:00 UTC)
 * Sends automated follow-ups to leads based on status and age
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = { j1: 0, j3: 0, j7: 0, j14: 0, errors: 0 };

    // Process each followup stage
    const stages = [
      { stage: 'j1', template: (name: string) => SMS.followupJ1(name), nextStage: 'j3', nextDays: 2 },
      { stage: 'j3', template: (name: string) => SMS.followupJ3(name), nextStage: 'j7', nextDays: 4 },
      { stage: 'j7', template: (name: string) => SMS.followupJ7(name, 10), nextStage: 'j14', nextDays: 7 },
      { stage: 'j14', template: (name: string) => SMS.followupJ14(name), nextStage: 'closed', nextDays: 0 },
    ];

    for (const { stage, template, nextStage, nextDays } of stages) {
      const leads = await getLeadsForFollowup(stage);

      for (const lead of leads) {
        try {
          const firstName = lead.name?.split(' ')[0] || '';
          const message = template(firstName);

          await sendSMS(lead.phone, message);
          await logMessageSent({
            lead_id: lead.id,
            channel: 'sms',
            type: `followup_${stage}`,
            content: message,
            recipient_phone: lead.phone,
          });

          // Update lead to next stage
          const nextFollowup = nextDays > 0
            ? new Date(Date.now() + nextDays * 24 * 60 * 60 * 1000).toISOString()
            : null;

          await supabaseAdmin
            .from('leads')
            .update({
              followup_stage: nextStage,
              next_followup_at: nextFollowup,
              last_contacted_at: new Date().toISOString(),
            })
            .eq('id', lead.id);

          results[stage as keyof typeof results]++;
        } catch (err) {
          console.error(`Followup error for lead ${lead.id}:`, err);
          results.errors++;
        }
      }
    }

    return NextResponse.json({ success: true, ...results });
  } catch (error) {
    console.error('Lead followup error:', error);
    return NextResponse.json({ error: 'Failed to process followups' }, { status: 500 });
  }
}
