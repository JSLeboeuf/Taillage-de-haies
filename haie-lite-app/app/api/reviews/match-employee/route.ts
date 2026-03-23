export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin, createIncentive } from '@/lib/supabase';
import { servicem8 } from '@/lib/servicem8';

// Validation schema
const MatchEmployeeSchema = z.object({
  review_id: z.string().uuid(),
});

// Bonus configuration
const REVIEW_BONUS_AMOUNT = 25; // $25 per 4-5 star review

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { review_id } = MatchEmployeeSchema.parse(body);

    // Fetch review from database
    const { data: review, error: reviewError } = await supabaseAdmin
      .from('google_reviews')
      .select('*')
      .eq('id', review_id)
      .single();

    if (reviewError || !review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if review qualifies for bonus (rating >= 4)
    if (review.rating < 4) {
      return NextResponse.json({
        matched: false,
        reason: 'Rating too low for bonus (must be >= 4 stars)',
      });
    }

    // Check if bonuses already generated
    if (review.bonuses_generated) {
      return NextResponse.json({
        matched: false,
        reason: 'Bonuses already generated for this review',
      });
    }

    // Try to match review to a job based on customer name and review date
    const reviewDate = new Date(review.review_time);
    const startWindow = new Date(reviewDate);
    startWindow.setDate(reviewDate.getDate() - 30); // 30 days before review

    // Search for completed jobs in ServiceM8 matching the customer name
    const jobs = await servicem8.getJobs(
      `status eq 'Completed' and completion_date gt '${startWindow.toISOString()}' and completion_date lt '${reviewDate.toISOString()}'`
    );

    // Find best matching job (fuzzy match on customer name)
    const normalizedAuthorName = review.author_name.toLowerCase().trim();
    let bestMatch = null;
    let highestConfidence = 0;

    for (const job of jobs) {
      if (!job.company_uuid) continue;

      // Fetch company details
      const company = await servicem8.getCompany(job.company_uuid);
      const companyName = company.name.toLowerCase().trim();

      // Calculate simple confidence score (substring match)
      const nameMatch = companyName.includes(normalizedAuthorName) ||
                        normalizedAuthorName.includes(companyName);

      if (nameMatch) {
        const confidence = Math.min(
          normalizedAuthorName.length / companyName.length,
          companyName.length / normalizedAuthorName.length
        ) * 100;

        if (confidence > highestConfidence) {
          highestConfidence = confidence;
          bestMatch = { job, company };
        }
      }
    }

    if (!bestMatch || highestConfidence < 50) {
      return NextResponse.json({
        matched: false,
        reason: 'No matching job found',
        confidence: highestConfidence,
      });
    }

    // Fetch job activities to identify employees who worked on this job
    const activities = await servicem8.getJobActivities(
      `job_uuid eq '${bestMatch.job.uuid}'`
    );

    if (!activities || activities.length === 0) {
      return NextResponse.json({
        matched: false,
        reason: 'No employee activities found for matched job',
      });
    }

    // Get unique employee UUIDs
    const employeeUuids = Array.from(new Set(activities.map((a) => a.staff_uuid)));

    // Fetch employee records from database
    const { data: employees } = await supabaseAdmin
      .from('employees')
      .select('*')
      .in('servicem8_staff_uuid', employeeUuids);

    if (!employees || employees.length === 0) {
      return NextResponse.json({
        matched: false,
        reason: 'Employees not found in database',
      });
    }

    // Create bonuses for each employee
    const bonuses = [];
    for (const employee of employees) {
      const bonus = await createIncentive({
        employee_id: employee.id,
        type: 'review_bonus',
        amount: REVIEW_BONUS_AMOUNT,
        description: `Google review bonus (${review.rating} stars) - ${review.author_name}`,
        google_review_id: review.review_id,
        job_uuid: bestMatch.job.uuid,
      });
      bonuses.push(bonus);
    }

    // Update review record
    await supabaseAdmin
      .from('google_reviews')
      .update({
        servicem8_job_uuid: bestMatch.job.uuid,
        matched_employee_ids: employees.map((e) => e.id),
        matched_at: new Date().toISOString(),
        match_confidence: highestConfidence,
        bonuses_generated: true,
        bonuses_generated_at: new Date().toISOString(),
      })
      .eq('id', review_id);

    return NextResponse.json({
      matched: true,
      job_uuid: bestMatch.job.uuid,
      company_name: bestMatch.company.name,
      confidence: highestConfidence,
      employees_matched: employees.map((e) => ({
        id: e.id,
        name: `${e.first_name} ${e.last_name}`,
        bonus_amount: REVIEW_BONUS_AMOUNT,
      })),
      total_bonuses: bonuses.length * REVIEW_BONUS_AMOUNT,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Review matching error:', error);
    return NextResponse.json(
      { error: 'Failed to match review to employee' },
      { status: 500 }
    );
  }
}
