export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendSMS } from '@/lib/twilio';
import { z } from 'zod';

import { stripe } from '@/lib/stripe';

const ManageSubscriptionSchema = z.object({
  subscription_id: z.string().uuid(),
  action: z.enum(['upgrade', 'downgrade', 'cancel']),
  new_plan: z.enum(['essentiel', 'premium', 'platine', 'tranquillite', 'immaculee']).optional(),
});

const PLANS = {
  essentiel: { price: 299, services: 1 },
  premium: { price: 499, services: 2 },
  platine: { price: 799, services: 3 },
  tranquillite: { price: 1400, services: 6 },
  immaculee: { price: 2400, services: 9 },
} as const;

export async function GET(request: NextRequest) {
  try {
    const phone = request.nextUrl.searchParams.get('phone');
    const subscriptionId = request.nextUrl.searchParams.get('subscription_id');

    if (!phone && !subscriptionId) {
      return NextResponse.json(
        { error: 'Either phone or subscription_id is required' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin.from('subscriptions').select('*');

    if (subscriptionId) {
      query = query.eq('id', subscriptionId);
    } else if (phone) {
      // Get company_uuid from phone first
      const { data: companies } = await supabaseAdmin
        .from('companies')
        .select('servicem8_uuid')
        .eq('phone', phone)
        .limit(1);

      if (!companies || companies.length === 0) {
        return NextResponse.json(
          { error: 'No subscription found for this phone number' },
          { status: 404 }
        );
      }

      query = query.eq('company_uuid', companies[0].servicem8_uuid);
    }

    const { data: subscription, error } = await query.single();

    if (error || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = ManageSubscriptionSchema.parse(body);

    // Fetch subscription from Supabase
    const { data: subscription, error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('id', validated.subscription_id)
      .single();

    if (fetchError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    let updateData: any = {};

    switch (validated.action) {
      case 'upgrade':
      case 'downgrade':
        if (!validated.new_plan) {
          return NextResponse.json(
            { error: 'new_plan is required for upgrade/downgrade' },
            { status: 400 }
          );
        }

        const newPlan = PLANS[validated.new_plan];

        // Update Stripe subscription
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripe_subscription_id
        );

        // Get or create product for the new plan
        const existingProduct = stripeSubscription.items.data[0]?.price?.product;
        const productId = typeof existingProduct === 'string' ? existingProduct : existingProduct?.id;

        await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          items: [
            {
              id: stripeSubscription.items.data[0].id,
              price_data: {
                currency: 'cad',
                product: productId || '',
                unit_amount: newPlan.price * 100,
                recurring: {
                  interval: 'year',
                },
              },
            },
          ],
          proration_behavior: 'create_prorations',
        });

        updateData = {
          plan: validated.new_plan,
          price_per_period: newPlan.price,
          services_per_period: newPlan.services,
          updated_at: new Date().toISOString(),
        };
        break;

      case 'cancel':
        // Cancel in Stripe
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id);

        updateData = {
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        break;
    }

    // Update Supabase record
    const { data: updatedSubscription, error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update(updateData)
      .eq('id', validated.subscription_id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update subscription:', updateError);
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      );
    }

    // Send confirmation SMS
    try {
      // Get customer phone from company
      const { data: company } = await supabaseAdmin
        .from('companies')
        .select('phone')
        .eq('servicem8_uuid', subscription.company_uuid)
        .single();

      if (company?.phone) {
        let smsBody = '';
        switch (validated.action) {
          case 'upgrade':
            smsBody = `Votre abonnement Club Haie Lite a été amélioré au plan ${validated.new_plan}. Merci de votre confiance! - Haie Lite`;
            break;
          case 'downgrade':
            smsBody = `Votre abonnement Club Haie Lite a été modifié au plan ${validated.new_plan}. - Haie Lite`;
            break;
          case 'cancel':
            smsBody = `Votre abonnement Club Haie Lite a été annulé. Nous espérons vous revoir bientôt! - Haie Lite`;
            break;
        }
        await sendSMS(company.phone, smsBody);
      }
    } catch (smsError) {
      console.error('Failed to send confirmation SMS:', smsError);
    }

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
      action: validated.action,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Subscription manage error:', error);
    return NextResponse.json(
      { error: 'Failed to manage subscription' },
      { status: 500 }
    );
  }
}
