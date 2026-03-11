/**
 * Zod schemas for runtime validation
 * Use these to validate incoming webhook payloads and API requests
 */

import { z } from 'zod';

// ============================================================================
// ServiceM8 Schemas
// ============================================================================

export const ServiceM8JobSchema = z.object({
  uuid: z.string().uuid(),
  active: z.enum(['0', '1']),
  status: z.enum(['Quote', 'Pending Approval', 'Approved', 'In Progress', 'Completed', 'Cancelled']),
  job_address: z.string(),
  description: z.string(),
  company_uuid: z.string().uuid().optional(),
  contact_uuid: z.string().uuid().optional(),
  staff_uuid: z.string().uuid().optional(),
  scheduled_date: z.string().optional(),
  scheduled_start: z.string().optional(),
  scheduled_end: z.string().optional(),
  actual_start: z.string().optional(),
  actual_end: z.string().optional(),
  generated_job_id: z.string().optional(),
  total: z.number().optional(),
  edit_date: z.string().optional(),
});

export const ServiceM8CompanySchema = z.object({
  uuid: z.string().uuid(),
  active: z.enum(['0', '1']),
  name: z.string(),
  phone: z.string(),
  email: z.string().email().optional(),
  address: z.string(),
  edit_date: z.string().optional(),
});

export const ServiceM8WebhookSchema = z.object({
  entry_type: z.enum(['job', 'company', 'staff', 'jobactivity']),
  event_type: z.enum(['insert', 'update', 'delete']),
  object: z.any(), // Further validate based on entry_type
});

// ============================================================================
// Lead Schemas
// ============================================================================

export const LeadSourceSchema = z.enum([
  'facebook_ads',
  'google_ads',
  'organic_search',
  'referral',
  'repeat_customer',
  'website_form',
  'phone_call',
  'walk_in',
  'other',
]);

export const LeadStatusSchema = z.enum([
  'new',
  'contacted',
  'qualified',
  'quote_sent',
  'follow_up',
  'won',
  'lost',
  'dormant',
]);

export const CreateLeadSchema = z.object({
  source: LeadSourceSchema,
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  address: z.string().min(5),
  property_type: z.enum(['residential', 'commercial', 'institutional']).optional(),
  hedge_length_estimate: z.number().positive().optional(),
  hedge_height_estimate: z.number().positive().optional(),
  urgency: z.enum(['low', 'medium', 'high']).optional(),
  budget_range: z.string().optional(),
  notes: z.string().optional(),
});

// ============================================================================
// Quote Calculator Schemas
// ============================================================================

export const HedgeTypeSchema = z.enum([
  'cedar',
  'privet',
  'boxwood',
  'yew',
  'mixed',
  'other',
]);

export const ServiceTypeSchema = z.enum([
  'trimming',
  'shaping',
  'reduction',
  'removal',
  'cleanup',
  'maintenance_plan',
]);

export const QuoteCalculationInputSchema = z.object({
  hedge_type: HedgeTypeSchema,
  service_type: ServiceTypeSchema,
  linear_meters: z.number().positive(),
  height_meters: z.number().positive(),
  complexity_factor: z.number().min(0.5).max(3.0).default(1.0),
  access_difficulty: z.enum(['easy', 'medium', 'difficult']).default('medium'),
  cleanup_required: z.boolean().default(true),
  disposal_required: z.boolean().default(false),
});

// ============================================================================
// Upsell Schemas
// ============================================================================

export const UpsellServiceTypeSchema = z.enum([
  'fertilization',
  'pest_treatment',
  'hedge_rejuvenation',
  'irrigation_repair',
  'landscape_design',
  'seasonal_cleanup',
  'maintenance_subscription',
]);

export const FlagUpsellSchema = z.object({
  job_uuid: z.string().uuid(),
  company_uuid: z.string().uuid(),
  service_type: UpsellServiceTypeSchema,
  detected_by: z.enum(['staff', 'ai', 'automated_rule']),
  detection_notes: z.string().optional(),
  estimated_value: z.number().positive(),
});

export const UpsellQuoteSchema = z.object({
  upsell_id: z.string().uuid(),
  quote_amount: z.number().positive(),
  send_immediately: z.boolean().default(false),
});

// ============================================================================
// Subscription Schemas
// ============================================================================

export const SubscriptionPlanSchema = z.enum([
  'monthly_basic',
  'monthly_premium',
  'quarterly_basic',
  'quarterly_premium',
  'annual_basic',
  'annual_premium',
]);

export const CreateSubscriptionSchema = z.object({
  company_uuid: z.string().uuid(),
  plan: SubscriptionPlanSchema,
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // ISO date
  stripe_payment_method_id: z.string().optional(),
});

// ============================================================================
// Webhook Schemas
// ============================================================================

export const MetaLeadWebhookSchema = z.object({
  object: z.literal('page'),
  entry: z.array(
    z.object({
      id: z.string(),
      time: z.number(),
      changes: z.array(
        z.object({
          field: z.literal('leadgen'),
          value: z.object({
            ad_id: z.string(),
            form_id: z.string(),
            leadgen_id: z.string(),
            created_time: z.number(),
            page_id: z.string(),
            adgroup_id: z.string(),
          }),
        })
      ),
    })
  ),
});

export const TwilioSMSWebhookSchema = z.object({
  MessageSid: z.string(),
  SmsSid: z.string(),
  AccountSid: z.string(),
  From: z.string(),
  To: z.string(),
  Body: z.string(),
  NumMedia: z.string(),
  SmsStatus: z.enum(['received', 'sent', 'delivered', 'undelivered', 'failed']),
  FromCity: z.string().optional(),
  FromState: z.string().optional(),
  FromZip: z.string().optional(),
  FromCountry: z.string().optional(),
});

export const VapiWebhookSchema = z.object({
  type: z.enum(['call.started', 'call.ended', 'transcript.update', 'call.forwarded']),
  call_id: z.string(),
  timestamp: z.string(),
  data: z.object({
    phone_number: z.string().optional(),
    duration: z.number().optional(),
    transcript: z.string().optional(),
    intent: z.string().optional(),
    forwarded_to: z.string().optional(),
    outcome: z.enum(['completed', 'voicemail', 'no_answer', 'busy', 'failed']).optional(),
  }),
});

export const StripeWebhookSchema = z.object({
  id: z.string(),
  object: z.literal('event'),
  type: z.string(),
  data: z.object({
    object: z.any(),
  }),
});

// ============================================================================
// Cron Authorization Schema
// ============================================================================

export const CronAuthSchema = z.object({
  authorization: z.string().startsWith('Bearer '),
});
