import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const startDate = request.nextUrl.searchParams.get('start_date');
    const endDate = request.nextUrl.searchParams.get('end_date');
    const format = request.nextUrl.searchParams.get('format') || 'json';

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'start_date and end_date are required' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return NextResponse.json(
        { error: 'Dates must be in YYYY-MM-DD format' },
        { status: 400 }
      );
    }

    // Fetch timesheets for the period
    const { data: timesheets, error: timesheetsError } = await supabaseAdmin
      .from('timesheets')
      .select('*, employees(id, name, hourly_rate)')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('employee_id', { ascending: true })
      .order('date', { ascending: true });

    if (timesheetsError) {
      console.error('Timesheets fetch error:', timesheetsError);
      return NextResponse.json(
        { error: 'Failed to fetch timesheets' },
        { status: 500 }
      );
    }

    // Fetch incentives for the period
    const { data: incentives, error: incentivesError } = await supabaseAdmin
      .from('employee_incentives')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate + 'T23:59:59')
      .eq('status', 'approved');

    if (incentivesError) {
      console.error('Incentives fetch error:', incentivesError);
    }

    // Group by employee
    const employeeData = new Map<string, any>();

    // Process timesheets
    for (const timesheet of timesheets || []) {
      const employeeId = timesheet.employee_id;

      if (!employeeData.has(employeeId)) {
        employeeData.set(employeeId, {
          employee_id: employeeId,
          employee_name: timesheet.employees?.name || 'Unknown',
          hourly_rate: timesheet.employees?.hourly_rate || 0,
          total_hours: 0,
          base_pay: 0,
          bonuses: 0,
          total: 0,
          entries: [],
        });
      }

      const data = employeeData.get(employeeId);
      const hours = timesheet.hours || 0;
      const basePay = hours * (timesheet.employees?.hourly_rate || 0);

      data.total_hours += hours;
      data.base_pay += basePay;
      data.entries.push({
        date: timesheet.date,
        hours,
        job_uuid: timesheet.job_uuid,
      });
    }

    // Process incentives
    for (const incentive of incentives || []) {
      if (employeeData.has(incentive.employee_id)) {
        const data = employeeData.get(incentive.employee_id);
        data.bonuses += incentive.amount;
      }
    }

    // Calculate totals
    for (const data of Array.from(employeeData.values())) {
      data.total = data.base_pay + data.bonuses;
    }

    // Convert to array
    const payrollData = Array.from(employeeData.values());

    // Calculate summary
    const summary = {
      total_employees: payrollData.length,
      total_hours: payrollData.reduce((sum, e) => sum + e.total_hours, 0),
      total_base_pay: payrollData.reduce((sum, e) => sum + e.base_pay, 0),
      total_bonuses: payrollData.reduce((sum, e) => sum + e.bonuses, 0),
      total_compensation: payrollData.reduce((sum, e) => sum + e.total, 0),
    };

    // Return format
    if (format === 'csv') {
      // Generate CSV
      const rows = [
        ['Employee Name', 'Employee ID', 'Hours', 'Hourly Rate', 'Base Pay', 'Bonuses', 'Total'].join(','),
      ];

      for (const data of payrollData) {
        rows.push([
          `"${data.employee_name}"`,
          data.employee_id,
          data.total_hours.toFixed(2),
          data.hourly_rate.toFixed(2),
          data.base_pay.toFixed(2),
          data.bonuses.toFixed(2),
          data.total.toFixed(2),
        ].join(','));
      }

      // Add summary row
      rows.push('');
      rows.push(['TOTAL', '', summary.total_hours.toFixed(2), '', summary.total_base_pay.toFixed(2), summary.total_bonuses.toFixed(2), summary.total_compensation.toFixed(2)].join(','));

      const csv = rows.join('\n');
      const filename = `payroll-${startDate}-to-${endDate}.csv`;

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } else {
      // Return JSON
      return NextResponse.json({
        success: true,
        period: {
          start_date: startDate,
          end_date: endDate,
        },
        summary,
        employees: payrollData,
      });
    }
  } catch (error) {
    console.error('Payroll export error:', error);
    return NextResponse.json(
      { error: 'Failed to export payroll' },
      { status: 500 }
    );
  }
}
