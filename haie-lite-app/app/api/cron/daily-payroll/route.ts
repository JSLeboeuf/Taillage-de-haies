export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getActiveEmployees, upsertDailyPayroll } from '@/lib/supabase';
import { sendSMS } from '@/lib/twilio';
import { servicem8 } from '@/lib/servicem8';
import { SMS } from '@/lib/sms-templates';

/**
 * Cron: Daily payroll report to Henri
 * Schedule: Mon-Fri at 5:30pm EDT (21:30 UTC)
 * Sends daily summary of hours worked and payroll calculations
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const employees = await getActiveEmployees();

    // Get today's timesheets
    const { data: timesheets } = await supabaseAdmin
      .from('timesheets')
      .select('*, employees(first_name, last_name, hourly_rate, truck)')
      .eq('date', today);

    if (!timesheets || timesheets.length === 0) {
      await sendSMS(
        process.env.HENRI_PHONE || '',
        `MASSE SALARIALE — ${today}\nAucune activité enregistrée aujourd'hui.`
      );
      return NextResponse.json({ success: true, message: 'No timesheets today' });
    }

    // Group by employee
    const byEmployee: Record<string, {
      name: string;
      truck: string;
      hours: number;
      rate: number;
      cost: number;
      jobs: number;
      revenue: number;
    }> = {};

    for (const ts of timesheets) {
      const emp = ts.employees;
      const key = ts.employee_id;

      if (!byEmployee[key]) {
        byEmployee[key] = {
          name: `${emp.first_name} ${emp.last_name}`,
          truck: emp.truck || '?',
          hours: 0,
          rate: parseFloat(emp.hourly_rate),
          cost: 0,
          jobs: 0,
          revenue: 0,
        };
      }

      byEmployee[key].hours += parseFloat(ts.hours || '0');
      byEmployee[key].jobs += 1;
      byEmployee[key].revenue += parseFloat(ts.job_revenue || '0');
    }

    // Calculate costs
    let totalHours = 0;
    let totalCost = 0;
    let totalRevenue = 0;
    let totalJobs = 0;

    for (const emp of Object.values(byEmployee)) {
      emp.cost = emp.hours * emp.rate;
      totalHours += emp.hours;
      totalCost += emp.cost;
      totalRevenue += emp.revenue;
      totalJobs += emp.jobs;
    }

    const marginPct = totalRevenue > 0
      ? Math.round((totalRevenue - totalCost) / totalRevenue * 100)
      : 0;

    // Build SMS report
    // Group by truck
    const trucks = new Map<string, typeof byEmployee[string][]>();
    for (const emp of Object.values(byEmployee)) {
      const truck = emp.truck;
      if (!trucks.has(truck)) trucks.set(truck, []);
      trucks.get(truck)!.push(emp);
    }

    let report = `MASSE SALARIALE — ${today}\n\n`;

    for (const [truck, members] of Array.from(trucks.entries())) {
      const truckTotal = members.reduce((sum: number, m: { cost: number }) => sum + m.cost, 0);
      report += `${truck.toUpperCase()}\n`;
      for (const m of members) {
        report += `${m.name}: ${m.hours.toFixed(1)}h × ${m.rate}$/h = ${Math.round(m.cost)}$\n`;
      }
      report += `Sous-total: ${Math.round(truckTotal)}$\n\n`;
    }

    report += `TOTAL: ${Math.round(totalCost)}$\n`;
    report += `REVENUS: ${Math.round(totalRevenue)}$ (${totalJobs} jobs)\n`;
    report += `MARGE: ${Math.round(totalRevenue - totalCost)}$ (${marginPct}%)\n`;
    report += `Ratio sal/rev: ${totalRevenue > 0 ? Math.round(totalCost / totalRevenue * 100) : 0}%`;

    // Save to Supabase
    await upsertDailyPayroll({
      date: today,
      total_hours: totalHours,
      total_labor_cost: totalCost,
      total_revenue: totalRevenue,
      margin_pct: marginPct,
      jobs_completed: totalJobs,
      employees_active: Object.keys(byEmployee).length,
      breakdown: byEmployee,
    });

    // Send to Henri + Jean-Samuel
    const recipients = [process.env.HENRI_PHONE, process.env.JEAN_SAMUEL_PHONE].filter(Boolean);
    for (const phone of recipients) {
      await sendSMS(phone!, SMS.dailyPayrollReport(report));
    }

    return NextResponse.json({
      success: true,
      date: today,
      employees: Object.keys(byEmployee).length,
      total_cost: Math.round(totalCost),
      total_revenue: Math.round(totalRevenue),
      margin_pct: marginPct,
    });
  } catch (error) {
    console.error('Daily payroll error:', error);
    return NextResponse.json({ error: 'Failed to generate payroll' }, { status: 500 });
  }
}
