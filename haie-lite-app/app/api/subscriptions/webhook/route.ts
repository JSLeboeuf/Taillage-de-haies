export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { servicem8 } from '@/lib/servicem8';
import { sendSMS } from '@/lib/twilio';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.upcoming':
        // Send reminder SMS 7 days before renewal
        await handleUpcomingInvoice(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id);
  // Already handled in /api/subscriptions/create
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);

  // Update Supabase record
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: subscription.status === 'active' ? 'active' :
              subscription.status === 'past_due' ? 'past_due' :
              subscription.status === 'canceled' ? 'cancelled' : 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Failed to update subscription:', error);
  }
}

async function handleUpcomingInvoice(invoice: Stripe.Invoice) {
  console.log('Upcoming invoice:', invoice.id);

  // Get subscription from Supabase
  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('*, companies(phone, name)')
    .eq('stripe_subscription_id', invoice.subscription as string)
    .single();

  if (!subscription) return;

  // Send reminder SMS 7 days before renewal
  const nextBillingDate = new Date(subscription.next_billing_date);
  const daysUntilBilling = Math.ceil(
    (nextBillingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilBilling <= 7 && daysUntilBilling > 0) {
    try {
      const amount = invoice.amount_due / 100; // Convert from cents
      const smsBody = `Rappel: Votre abonnement Club Haie Lite sera renouvelé dans ${daysUntilBilling} jours. Montant: ${amount}$ CAD. Merci! - Haie Lite`;

      if (subscription.companies?.phone) {
        await sendSMS(subscription.companies.phone, smsBody);
      }
    } catch (error) {
      console.error('Failed to send renewal reminder:', error);
    }
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded:', invoice.id);

  // Get subscription
  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', invoice.subscription as string)
    .single();

  if (!subscription) return;

  // Update subscription: reset services used, update next billing date
  const nextBillingDate = new Date();
  nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);

  await supabaseAdmin
    .from('subscriptions')
    .update({
      services_used_this_period: 0,
      next_billing_date: nextBillingDate.toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', invoice.subscription as string);

  // Auto-schedule first job of the season (if it's spring renewal)
  const currentMonth = new Date().getMonth();
  if (currentMonth >= 3 && currentMonth <= 5) { // April-June
    try {
      const job = await servicem8.createJob({
        company_uuid: subscription.company_uuid,
        status: 'Quote',
        job_address: '', // Will be filled from company
        description: `Taille de haie saisonnière - Club Haie Lite ${subscription.plan}`,
      });
      console.log('Auto-scheduled seasonal job:', job.uuid);
    } catch (error) {
      console.error('Failed to auto-schedule job:', error);
    }
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed:', invoice.id);

  // Update subscription status
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', invoice.subscription as string);

  // Send notification SMS
  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('*, companies(phone)')
    .eq('stripe_subscription_id', invoice.subscription as string)
    .single();

  if (subscription?.companies?.phone) {
    try {
      const smsBody = `Attention: Le paiement de votre abonnement Club Haie Lite a échoué. Veuillez mettre à jour vos informations de paiement. - Haie Lite`;
      await sendSMS(subscription.companies.phone, smsBody);
    } catch (error) {
      console.error('Failed to send payment failed SMS:', error);
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);

  // Update Supabase
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}
