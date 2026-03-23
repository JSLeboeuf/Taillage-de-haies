export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendSMS } from '@/lib/twilio';

/**
 * Cron: Check new Google reviews
 * Schedule: Daily at 8:00am EDT (12:00 UTC)
 * Monitors new Google Business Profile reviews and sends alerts
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch reviews from Google Places API
    const placesUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${process.env.GOOGLE_PLACE_ID}&fields=reviews,rating,user_ratings_total&key=${process.env.GOOGLE_PLACES_API_KEY}`;
    const placesRes = await fetch(placesUrl);
    const placesData = await placesRes.json();

    if (placesData.status !== 'OK' || !placesData.result) {
      throw new Error(`Google Places API error: ${placesData.status}`);
    }

    const reviews = placesData.result.reviews || [];
    const overallRating = placesData.result.rating;
    const totalRatings = placesData.result.user_ratings_total;

    // Get last check timestamp from Supabase
    const { data: lastCheck } = await supabaseAdmin
      .from('google_reviews')
      .select('review_time')
      .order('review_time', { ascending: false })
      .limit(1)
      .single();

    const lastCheckTime = lastCheck?.review_time ? new Date(lastCheck.review_time).getTime() / 1000 : 0;

    // Process each review
    const newReviews: any[] = [];
    const negativeReviews: any[] = [];

    for (const review of reviews) {
      // Skip if already processed
      if (review.time <= lastCheckTime) continue;

      const reviewRecord = {
        google_review_id: review.author_name + '_' + review.time,
        author_name: review.author_name,
        rating: review.rating,
        review_text: review.text || '',
        review_time: new Date(review.time * 1000).toISOString(),
        profile_photo_url: review.profile_photo_url,
        relative_time: review.relative_time_description,
      };

      // Store in Supabase
      const { error: insertError } = await supabaseAdmin
        .from('google_reviews')
        .insert(reviewRecord);

      if (insertError && !insertError.message.includes('duplicate')) {
        console.error('Failed to insert review:', insertError);
      } else if (!insertError) {
        newReviews.push(reviewRecord);

        // Track negative reviews
        if (review.rating <= 3) {
          negativeReviews.push(reviewRecord);
        }
      }
    }

    // Alert on negative reviews immediately
    for (const negReview of negativeReviews) {
      const alertMessage = [
        `⚠️ AVIS NÉGATIF GOOGLE`,
        ``,
        `${negReview.rating} étoiles - ${negReview.author_name}`,
        `"${negReview.review_text.substring(0, 100)}${negReview.review_text.length > 100 ? '...' : ''}"`,
        ``,
        `Répondez rapidement pour limiter les dégâts.`,
      ].join('\n');

      // Send to Henri and Jean-Samuel
      const owners = [process.env.HENRI_PHONE, process.env.JEAN_SAMUEL_PHONE].filter(Boolean);
      for (const phone of owners) {
        await sendSMS(phone!, alertMessage);
      }
    }

    // Send weekly summary on Mondays
    const today = new Date();
    const dayOfWeek = today.getDay();

    if (dayOfWeek === 1) { // Monday
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: weekReviews } = await supabaseAdmin
        .from('google_reviews')
        .select('rating')
        .gte('review_time', weekAgo.toISOString());

      const weekCount = weekReviews?.length || 0;
      const weekAvg = weekCount > 0
        ? (weekReviews!.reduce((sum, r) => sum + r.rating, 0) / weekCount).toFixed(1)
        : 'N/A';

      const weeklyMessage = [
        `📊 RAPPORT HEBDO - AVIS GOOGLE`,
        ``,
        `Cette semaine: ${weekCount} nouveaux avis`,
        `Moyenne: ${weekAvg}/5 étoiles`,
        ``,
        `Global: ${overallRating}/5 (${totalRatings} avis)`,
        ``,
        `Continuez l'excellent travail!`,
      ].join('\n');

      if (process.env.HENRI_PHONE) {
        await sendSMS(process.env.HENRI_PHONE, weeklyMessage);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Google reviews checked',
      executed_at: new Date().toISOString(),
      new_reviews: newReviews.length,
      negative_reviews: negativeReviews.length,
      overall_rating: overallRating,
      total_ratings: totalRatings,
    });
  } catch (error) {
    console.error('Google reviews check error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed',
    }, { status: 500 });
  }
}
