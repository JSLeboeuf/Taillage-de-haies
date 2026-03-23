export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendSMS } from '@/lib/twilio';
import { SMS } from '@/lib/sms-templates';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

const RENEWAL_PRICE_INCREASE = 0.08; // +8% per year as per contract

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = { notified30d: 0, notified7d: 0, renewed: 0, errors: 0 };

  try {
    const today = new Date();
    const in30Days = new Date(today);
    in30Days.setDate(today.getDate() + 30);
    const in7Days = new Date(today);
    in7Days.setDate(today.getDate() + 7);

    // Fetch all active annual contract subscriptions
    const { data: subscriptions, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*, companies(phone, name)')
      .in('plan', ['tranquillite', 'immaculee'])
      .eq('status', 'active');

    if (error) throw error;
    if (!subscriptions?.length) {
      return NextResponse.json({ success: true, ...results, message: 'No annual subscriptions found' });
    }

    for (const sub of subscriptions) {
      try {
        const renewalDate = new Date(sub.next_billing_date);
        const daysUntilRenewal = Math.round(
          (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        const newPrice = Math.round(sub.price_per_period * (1 + RENEWAL_PRICE_INCREASE));
        const phone = (sub.companies as any)?.phone;
        const fullName = (sub.companies as any)?.name || '';
        const firstName = fullName.split(' ')[0] || fullName;

        if (!phone) continue;

        // J-30: first renewal notice
        if (daysUntilRenewal === 30) {
          const renewalDateStr = renewalDate.toLocaleDateString('fr-CA');
          await sendSMS(phone, SMS.annualContractRenewalNotice(firstName, renewalDateStr, newPrice));
          results.notified30d++;
        }

        // J-7: reminder
        else if (daysUntilRenewal === 7) {
          await sendSMS(phone, SMS.annualContractRenewalReminder(firstName, 7, newPrice));
          results.notified7d++;
        }

        // J0: process renewal — update Stripe price + send confirmation
        else if (daysUntilRenewal === 0) {
          // Update Stripe subscription with new price
          const stripeSubscription = await stripe.subscriptions.retrieve(
            sub.stripe_subscription_id
          );

          const existingItem = stripeSubscription.items.data[0];
          const existingProduct = existingItem?.price?.product;
          const productId = typeof existingProduct === 'string' ? existingProduct : existingProduct?.id;

          if (productId && existingItem) {
            await stripe.subscriptions.update(sub.stripe_subscription_id, {
              items: [
                {
                  id: existingItem.id,
                  price_data: {
                    currency: 'cad',
                    product: productId,
                    unit_amount: newPrice * 100,
                    recurring: { interval: 'year' },
                  },
                },
              ],
              proration_behavior: 'none',
            });
          }

          // Update Supabase record
          const nextBillingDate = new Date(renewalDate);
          nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);

          await supabaseAdmin
            .from('subscriptions')
            .update({
              price_per_period: newPrice,
              services_used_this_period: 0,
              next_billing_date: nextBillingDate.toISOString().split('T')[0],
              updated_at: new Date().toISOString(),
            })
            .eq('id', sub.id);

          // Send confirmation SMS
          await sendSMS(phone, SMS.annualContractRenewalConfirm(firstName, newPrice, 'mai'));
          results.renewed++;
        }
      } catch (subError) {
        console.error(`Renewal error for subscription ${sub.id}:`, subError);
        results.errors++;
      }
    }

    return NextResponse.json({ success: true, ...results });
  } catch (error) {
    console.error('Annual contract renewal cron error:', error);
    return NextResponse.json({ error: 'Cron job failed', ...results }, { status: 500 });
  }
}
