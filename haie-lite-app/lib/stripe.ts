import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-02-24.acacia',
    });
  }
  return _stripe;
}

// Lazy proxy — drop-in replacement for `const stripe = new Stripe(...)`
export const stripe = new Proxy({} as Stripe, {
  get(_t, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
