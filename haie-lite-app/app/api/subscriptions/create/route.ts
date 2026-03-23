export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { servicem8 } from '@/lib/servicem8';
import { sendSMS, formatPhoneQC } from '@/lib/twilio';
import { SMS } from '@/lib/sms-templates';
import { z } from 'zod';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

const CreateSubscriptionSchema = z.object({
  customer_name: z.string().min(1),
  phone: z.string().min(10),
  email: z.string().email(),
  address: z.string().min(5),
  plan: z.enum(['essentiel', 'premium', 'platine', 'tranquillite', 'immaculee']),
});

// Plan pricing and details
const PLANS = {
  essentiel: {
    name: 'Club Haie Lite - Essentiel',
    price: 299,
    interval: 'year',
    services: 1,
    description: '1 taille par année',
    isAnnualContract: false,
  },
  premium: {
    name: 'Club Haie Lite - Premium',
    price: 499,
    interval: 'year',
    services: 2,
    description: '2 tailles + fertilisation',
    isAnnualContract: false,
  },
  platine: {
    name: 'Club Haie Lite - Platine',
    price: 799,
    interval: 'year',
    services: 3,
    description: '3 tailles + fertilisation + traitement antiparasitaire',
    isAnnualContract: false,
  },
  tranquillite: {
    name: 'Plan Tranquillité',
    price: 1400,
    interval: 'year',
    services: 6, // vitres x2, gouttières x2, haies x2
    description: 'Vitres extérieures (2x) + Gouttières (2x) + Haies (2x) — photos avant/après incluses',
    isAnnualContract: true,
  },
  immaculee: {
    name: 'Plan Propriété Immaculée',
    price: 2400,
    interval: 'year',
    services: 9, // vitres int+ext x3, gouttières x2, haies x3
    description: 'Vitres int/ext (3x) + Gouttières (2x) + Haies (3x) + Inspection toit + Rapport photo détaillé',
    isAnnualContract: true,
  },
} as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = CreateSubscriptionSchema.parse(body);

    // Format phone
    const formattedPhone = formatPhoneQC(validated.phone);

    const plan = PLANS[validated.plan];

    // Split name
    const nameParts = validated.customer_name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    // Create or get Stripe customer
    const stripeCustomers = await stripe.customers.list({
      email: validated.email,
      limit: 1,
    });

    let stripeCustomer: Stripe.Customer;
    if (stripeCustomers.data.length > 0) {
      stripeCustomer = stripeCustomers.data[0];
    } else {
      stripeCustomer = await stripe.customers.create({
        email: validated.email,
        name: validated.customer_name,
        phone: formattedPhone,
        address: {
          line1: validated.address,
        },
      });
    }

    // Create or retrieve Stripe product
    const products = await stripe.products.list({ limit: 1, active: true });
    let productId: string;

    const existingProduct = products.data.find(p => p.name === plan.name);
    if (existingProduct) {
      productId = existingProduct.id;
    } else {
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
      });
      productId = product.id;
    }

    // Create Stripe subscription
    const stripeSubscription = await stripe.subscriptions.create({
      customer: stripeCustomer.id,
      items: [
        {
          price_data: {
            currency: 'cad',
            product: productId,
            unit_amount: plan.price * 100, // Stripe uses cents
            recurring: {
              interval: 'year',
            },
          },
        },
      ],
      metadata: {
        plan: validated.plan,
        services_per_year: plan.services.toString(),
      },
    });

    // Create company in ServiceM8 if new
    let companyUuid: string;
    try {
      const existingCompanies = await servicem8.getCompanies(
        `phone eq '${formattedPhone}'`
      );

      if (existingCompanies.length > 0) {
        companyUuid = existingCompanies[0].uuid;
      } else {
        const company = await servicem8.createCompany({
          name: validated.customer_name,
          phone: formattedPhone,
          email: validated.email,
          address: validated.address,
        });
        companyUuid = company.uuid;
      }
    } catch (error) {
      console.error('ServiceM8 company creation error:', error);
      // If ServiceM8 fails, cancel Stripe subscription
      await stripe.subscriptions.cancel(stripeSubscription.id);
      throw new Error('Failed to create customer in ServiceM8');
    }

    // Create subscription record in Supabase
    const { data: subscription, error: dbError } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        company_uuid: companyUuid,
        stripe_customer_id: stripeCustomer.id,
        stripe_subscription_id: stripeSubscription.id,
        plan: validated.plan,
        status: 'active',
        price_per_period: plan.price,
        billing_interval: 'year',
        services_per_period: plan.services,
        services_used_this_period: 0,
        start_date: new Date().toISOString().split('T')[0],
        next_billing_date: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString().split('T')[0],
      })
      .select()
      .single();

    if (dbError) {
      console.error('Supabase subscription creation error:', dbError);
      // Cancel Stripe subscription if DB fails
      await stripe.subscriptions.cancel(stripeSubscription.id);
      return NextResponse.json(
        { error: 'Failed to create subscription record' },
        { status: 500 }
      );
    }

    // Send welcome SMS
    try {
      let smsBody: string;
      const nextBilling = subscription.next_billing_date;
      if (validated.plan === 'immaculee') {
        smsBody = SMS.annualContractWelcomeImmaculee(firstName, 'dans les 3 prochaines semaines');
      } else if (validated.plan === 'tranquillite') {
        smsBody = SMS.annualContractWelcome(firstName, 'dans les 3 prochaines semaines');
      } else {
        smsBody = `Bienvenue au ${plan.name}! Votre abonnement est actif. ${plan.description}. Prochaine facturation: ${nextBilling}. Merci de votre confiance! - Haie Lite`;
      }
      await sendSMS(formattedPhone, smsBody);
    } catch (smsError) {
      console.error('Failed to send welcome SMS:', smsError);
    }

    return NextResponse.json({
      success: true,
      subscription_id: subscription.id,
      stripe_customer_id: stripeCustomer.id,
      stripe_subscription_id: stripeSubscription.id,
      plan: validated.plan,
      next_billing_date: subscription.next_billing_date,
      services_per_year: plan.services,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
