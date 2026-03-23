export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { servicem8 } from '@/lib/servicem8';
import { supabaseAdmin, getActiveEmployees, upsertTimesheet, getEmployeeByServiceM8Id } from '@/lib/supabase';

/**
 * Cron: Sync timesheets from ServiceM8
 * Schedule: Every hour (0 * * * *)
 * Syncs job activities (timesheets) from ServiceM8 to Supabase for payroll processing
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    // Get all job activities for today from ServiceM8
    const activities = await servicem8.getActivitiesForDate(today);

    let synced = 0;
    let errors = 0;

    for (const activity of activities) {
      try {
        // Find employee by ServiceM8 staff UUID
        const employee = await getEmployeeByServiceM8Id(activity.staff_uuid);
        if (!employee) continue;

        // Calculate hours
        const start = new Date(activity.start_date);
        const end = activity.end_date ? new Date(activity.end_date) : null;
        const hours = end ? (end.getTime() - start.getTime()) / (1000 * 60 * 60) : 0;

        // Get job revenue for margin calculation
        let jobRevenue = 0;
        if (activity.job_uuid) {
          try {
            const job = await servicem8.getJob(activity.job_uuid);
            jobRevenue = parseFloat(job.total_invoice_amount || '0');
          } catch {
            // Job may not exist or be accessible
          }
        }

        await upsertTimesheet({
          employee_id: employee.id,
          date: today,
          job_uuid: activity.job_uuid || '',
          start_time: activity.start_date,
          end_time: activity.end_date || undefined,
          hours: Math.round(hours * 100) / 100,
          job_revenue: jobRevenue,
        });

        synced++;
      } catch (err) {
        console.error(`Error syncing activity ${activity.uuid}:`, err);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      date: today,
      activities_found: activities.length,
      synced,
      errors,
    });
  } catch (error) {
    console.error('Sync timesheets error:', error);
    return NextResponse.json({ error: 'Failed to sync timesheets' }, { status: 500 });
  }
}
