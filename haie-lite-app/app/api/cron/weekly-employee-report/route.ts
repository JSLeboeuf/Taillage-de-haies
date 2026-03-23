export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getActiveEmployees } from '@/lib/supabase';
import { sendSMS } from '@/lib/twilio';
import { servicem8 } from '@/lib/servicem8';

/**
 * Cron: Weekly employee performance report
 * Schedule: Fridays at 5:00pm EDT (21:00 UTC)
 * Sends weekly summary of employee performance and incentives
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Calculate week boundaries (Monday to Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const weekStart = monday.toISOString().split('T')[0];
    const weekEnd = sunday.toISOString().split('T')[0];

    // Get active employees
    const employees = await getActiveEmployees();

    if (!employees || employees.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active employees',
        executed_at: new Date().toISOString(),
      });
    }

    const employeeReports: any[] = [];

    // Calculate metrics for each employee
    for (const employee of employees) {
      try {
        // Get timesheets for this week
        const { data: timesheets } = await supabaseAdmin
          .from('timesheets')
          .select('*')
          .eq('employee_id', employee.id)
          .gte('date', weekStart)
          .lte('date', weekEnd);

        const totalHours = (timesheets || []).reduce((sum, t) => sum + (t.hours || 0), 0);
        const totalRevenue = (timesheets || []).reduce((sum, t) => sum + (t.job_revenue || 0), 0);
        const jobsCompleted = new Set(timesheets?.map(t => t.job_uuid) || []).size;

        // Get bonuses earned this week
        const { data: incentives } = await supabaseAdmin
          .from('employee_incentives')
          .select('amount')
          .eq('employee_id', employee.id)
          .gte('created_at', monday.toISOString())
          .lte('created_at', sunday.toISOString())
          .eq('status', 'approved');

        const bonusesEarned = (incentives || []).reduce((sum, i) => sum + (i.amount || 0), 0);

        // Calculate performance score (revenue per hour)
        const revenuePerHour = totalHours > 0 ? totalRevenue / totalHours : 0;

        const report = {
          employee_id: employee.id,
          employee_name: `${employee.first_name} ${employee.last_name}`,
          phone: employee.phone,
          week_start: weekStart,
          week_end: weekEnd,
          total_hours: Math.round(totalHours * 10) / 10,
          jobs_completed: jobsCompleted,
          total_revenue: Math.round(totalRevenue),
          bonuses_earned: Math.round(bonusesEarned),
          revenue_per_hour: Math.round(revenuePerHour),
        };

        employeeReports.push(report);

        // Send individual SMS to employee
        if (employee.phone && totalHours > 0) {
          const employeeMessage = [
            `📊 RAPPORT SEMAINE ${weekStart}`,
            ``,
            `Heures: ${report.total_hours}h`,
            `Jobs: ${report.jobs_completed}`,
            `Revenus générés: ${report.total_revenue}$`,
            `Bonus gagnés: ${report.bonuses_earned}$`,
            ``,
            `Performance: ${report.revenue_per_hour}$/h`,
            ``,
            `Excellent travail! - Haie Lite`,
          ].join('\n');

          await sendSMS(employee.phone, employeeMessage);
        }
      } catch (err) {
        console.error(`Failed to calculate metrics for employee ${employee.id}:`, err);
      }
    }

    // Save weekly report to Supabase
    const { error: reportError } = await supabaseAdmin
      .from('weekly_employee_reports')
      .insert({
        week_start: weekStart,
        week_end: weekEnd,
        employee_reports: employeeReports,
        total_hours: employeeReports.reduce((sum, r) => sum + r.total_hours, 0),
        total_revenue: employeeReports.reduce((sum, r) => sum + r.total_revenue, 0),
        total_bonuses: employeeReports.reduce((sum, r) => sum + r.bonuses_earned, 0),
      });

    if (reportError) {
      console.error('Failed to save weekly report:', reportError);
    }

    // Send summary to Henri with employees ranked
    const rankedEmployees = [...employeeReports].sort((a, b) => b.revenue_per_hour - a.revenue_per_hour);

    const henriMessage = [
      `📊 RAPPORT HEBDO ÉQUIPE`,
      `Semaine du ${weekStart}`,
      ``,
      `TOP PERFORMERS:`,
      ...rankedEmployees.slice(0, 5).map((emp, idx) =>
        `${idx + 1}. ${emp.employee_name} - ${emp.revenue_per_hour}$/h (${emp.jobs_completed} jobs, ${emp.total_hours}h)`
      ),
      ``,
      `TOTAL ÉQUIPE:`,
      `Heures: ${Math.round(employeeReports.reduce((s, r) => s + r.total_hours, 0))}h`,
      `Revenus: ${Math.round(employeeReports.reduce((s, r) => s + r.total_revenue, 0))}$`,
      `Bonus: ${Math.round(employeeReports.reduce((s, r) => s + r.bonuses_earned, 0))}$`,
    ].join('\n');

    if (process.env.HENRI_PHONE) {
      await sendSMS(process.env.HENRI_PHONE, henriMessage);
    }

    return NextResponse.json({
      success: true,
      message: 'Weekly employee reports sent',
      executed_at: new Date().toISOString(),
      employees_processed: employeeReports.length,
      week_start: weekStart,
      week_end: weekEnd,
    });
  } catch (error) {
    console.error('Weekly employee report error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed',
    }, { status: 500 });
  }
}
