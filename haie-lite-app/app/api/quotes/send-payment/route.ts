export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { sendSMS } from '@/lib/twilio';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

// Validation schema
const SendPaymentSchema = z.object({
  lead_id: z.string().uuid(),
  amount: z.number().positive(),
  description: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lead_id, amount, description } = SendPaymentSchema.parse(body);

    // Fetch lead details
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Create Stripe Product and Price for this quote
    const product = await stripe.products.create({
      name: description,
      description: `Taille de haie - ${lead.address || 'Address not provided'}`,
      metadata: {
        lead_id,
        customer_name: lead.name,
      },
    });

    const price = await stripe.prices.create({
      product: product.id,
      currency: 'cad',
      unit_amount: Math.round(amount * 100), // Convert to cents
    });

    // Create Stripe Payment Link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?lead_id=${lead_id}`,
        },
      },
      metadata: {
        lead_id,
        customer_name: lead.name,
        customer_phone: lead.phone,
      },
    });

    // Update lead status to 'payment_sent'
    await supabaseAdmin
      .from('leads')
      .update({
        status: 'quoted',
        quote_amount: amount,
        quote_sent_at: new Date().toISOString(),
      })
      .eq('id', lead_id);

    // Send SMS to customer with payment link
    const smsBody = `Bonjour ${lead.name}! Voici le lien de paiement pour votre taille de haie (${amount}$ taxes incl.): ${paymentLink.url}\n\nMerci de votre confiance! - Haie Lite`;

    await sendSMS(lead.phone, smsBody);

    // Log message sent
    await supabaseAdmin.from('messages_sent').insert({
      recipient_phone: lead.phone,
      recipient_name: lead.name,
      lead_id,
      message_type: 'quote_sent',
      template_name: 'paymentLink',
      content_preview: smsBody.substring(0, 200),
      full_content: smsBody,
      channel: 'sms',
      status: 'sent',
    });

    return NextResponse.json({
      payment_url: paymentLink.url,
      stripe_payment_link_id: paymentLink.id,
      lead_id,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe error:', error.message);
      return NextResponse.json(
        { error: 'Payment link creation failed', details: error.message },
        { status: 500 }
      );
    }

    console.error('Send payment error:', error);
    return NextResponse.json(
      { error: 'Failed to send payment link' },
      { status: 500 }
    );
  }
}
