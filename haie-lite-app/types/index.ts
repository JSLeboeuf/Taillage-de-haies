/**
 * Type definitions for Haie Lite application
 * Covers ServiceM8, leads, quotes, employees, upsells, subscriptions, and webhooks
 */

// ============================================================================
// ServiceM8 Core Entities
// ============================================================================

/**
 * ServiceM8 Job entity
 * Represents a scheduled hedge trimming service job
 */
export interface ServiceM8Job {
  uuid: string;
  active: '0' | '1';
  status: 'Quote' | 'Pending Approval' | 'Approved' | 'In Progress' | 'Completed' | 'Cancelled';
  job_address: string;
  description: string;
  company_uuid?: string;
  contact_uuid?: string;
  staff_uuid?: string;
  scheduled_date?: string; // ISO date
  scheduled_start?: string; // ISO datetime
  scheduled_end?: string; // ISO datetime
  actual_start?: string; // ISO datetime
  actual_end?: string; // ISO datetime
  generated_job_id?: string;
  total?: number;
  edit_date?: string; // ISO datetime
}

/**
 * ServiceM8 Company (customer) entity
 */
export interface ServiceM8Company {
  uuid: string;
  active: '0' | '1';
  name: string;
  phone: string;
  email?: string;
  address: string;
  edit_date?: string;
}

/**
 * ServiceM8 Company Contact entity
 */
export interface ServiceM8CompanyContact {
  uuid: string;
  company_uuid: string;
  first: string;
  last: string;
  mobile?: string;
  email?: string;
  type: 'Primary' | 'Secondary' | 'Billing' | 'Other';
  edit_date?: string;
}

/**
 * ServiceM8 Job Activity (timesheet) entity
 */
export interface ServiceM8JobActivity {
  uuid: string;
  job_uuid: string;
  staff_uuid: string;
  active: '0' | '1';
  start_date: string; // ISO datetime
  end_date?: string; // ISO datetime
  duration?: number; // minutes
  description?: string;
  billable: '0' | '1';
  edit_date?: string;
}

/**
 * ServiceM8 Staff entity
 */
export interface ServiceM8Staff {
  uuid: string;
  active: '0' | '1';
  first: string;
  last: string;
  mobile?: string;
  email?: string;
  colour?: string;
  edit_date?: string;
}

// ============================================================================
// Lead Pipeline
// ============================================================================

/**
 * Lead source - where the lead came from
 */
export type LeadSource =
  | 'facebook_ads'
  | 'google_ads'
  | 'organic_search'
  | 'referral'
  | 'repeat_customer'
  | 'website_form'
  | 'phone_call'
  | 'walk_in'
  | 'other';

/**
 * Lead status in the pipeline
 */
export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'quote_sent'
  | 'follow_up'
  | 'won'
  | 'lost'
  | 'dormant';

/**
 * Lead entity - potential customer
 */
export interface Lead {
  id: string;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
  source: LeadSource;
  status: LeadStatus;

  // Contact info
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  address: string;

  // Lead qualification
  property_type?: 'residential' | 'commercial' | 'institutional';
  hedge_length_estimate?: number; // meters
  hedge_height_estimate?: number; // meters
  urgency?: 'low' | 'medium' | 'high';
  budget_range?: string;

  // Pipeline tracking
  first_contact_date?: string; // ISO datetime
  last_contact_date?: string; // ISO datetime
  follow_up_date?: string; // ISO datetime
  quote_amount?: number;
  quote_sent_date?: string; // ISO datetime
  won_date?: string; // ISO datetime
  lost_reason?: string;

  // ServiceM8 integration
  servicem8_company_uuid?: string;
  servicem8_job_uuid?: string;

  // Notes
  notes?: string;
}

// ============================================================================
// Quote Calculator
// ============================================================================

/**
 * Hedge type classification
 */
export type HedgeType =
  | 'cedar'
  | 'privet'
  | 'boxwood'
  | 'yew'
  | 'mixed'
  | 'other';

/**
 * Service type
 */
export type ServiceType =
  | 'trimming'
  | 'shaping'
  | 'reduction'
  | 'removal'
  | 'cleanup'
  | 'maintenance_plan';

/**
 * Quote calculation input
 */
export interface QuoteCalculationInput {
  hedge_type: HedgeType;
  service_type: ServiceType;
  linear_meters: number;
  height_meters: number;
  complexity_factor?: number; // 1.0 = normal, 1.5 = complex
  access_difficulty?: 'easy' | 'medium' | 'difficult';
  cleanup_required?: boolean;
  disposal_required?: boolean;
}

/**
 * Quote calculation result
 */
export interface QuoteCalculation {
  subtotal: number;
  complexity_adjustment: number;
  access_adjustment: number;
  cleanup_fee: number;
  disposal_fee: number;
  total: number;
  estimated_hours: number;
  recommended_crew_size: number;
  pricing_breakdown: {
    base_rate_per_meter: number;
    total_linear_meters: number;
    base_cost: number;
  };
}

// ============================================================================
// Employee & Timesheet
// ============================================================================

/**
 * Employee entity (extends ServiceM8 Staff with incentive tracking)
 */
export interface Employee {
  id: string;
  servicem8_staff_uuid: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  hire_date: string; // ISO date
  active: boolean;

  // Compensation
  hourly_rate: number;
  incentive_eligible: boolean;

  // Performance tracking
  total_hours_ytd: number;
  total_jobs_completed_ytd: number;
  quality_score?: number; // 0-100
  customer_rating?: number; // 0-5

  // Incentive tracking
  current_period_revenue: number;
  current_period_incentive: number;
  lifetime_incentive_earned: number;
}

/**
 * Timesheet entry
 */
export interface TimesheetEntry {
  id: string;
  employee_id: string;
  servicem8_activity_uuid: string;
  job_uuid: string;
  date: string; // ISO date
  start_time: string; // ISO datetime
  end_time?: string; // ISO datetime
  duration_minutes?: number;
  billable: boolean;
  approved: boolean;
  approved_by?: string;
  approved_at?: string; // ISO datetime
}

/**
 * Employee incentive calculation
 */
export interface IncentiveCalculation {
  employee_id: string;
  period_start: string; // ISO date
  period_end: string; // ISO date
  total_revenue_generated: number;
  base_salary: number;
  incentive_percentage: number;
  incentive_amount: number;
  total_compensation: number;
}

// ============================================================================
// Upsell Engine
// ============================================================================

/**
 * Upsell service types
 */
export type UpsellServiceType =
  | 'fertilization'
  | 'pest_treatment'
  | 'hedge_rejuvenation'
  | 'irrigation_repair'
  | 'landscape_design'
  | 'seasonal_cleanup'
  | 'maintenance_subscription';

/**
 * Upsell opportunity entity
 */
export interface UpsellOpportunity {
  id: string;
  created_at: string; // ISO datetime
  job_uuid: string;
  company_uuid: string;
  service_type: UpsellServiceType;
  status: 'identified' | 'quoted' | 'accepted' | 'declined' | 'deferred';

  // Detection
  detected_by: 'staff' | 'ai' | 'automated_rule';
  detection_notes?: string;

  // Quote
  estimated_value: number;
  quote_sent_date?: string; // ISO datetime
  quote_amount?: number;

  // Conversion
  accepted_date?: string; // ISO datetime
  declined_reason?: string;
  deferred_until?: string; // ISO date

  // Follow-up
  follow_up_count: number;
  last_follow_up_date?: string; // ISO datetime
  next_follow_up_date?: string; // ISO datetime
}

// ============================================================================
// Subscriptions
// ============================================================================

/**
 * Subscription plan type
 */
export type SubscriptionPlan =
  | 'monthly_basic'
  | 'monthly_premium'
  | 'quarterly_basic'
  | 'quarterly_premium'
  | 'annual_basic'
  | 'annual_premium';

/**
 * Subscription status
 */
export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'cancelled'
  | 'paused'
  | 'expired';

/**
 * Customer subscription entity
 */
export interface Subscription {
  id: string;
  created_at: string; // ISO datetime
  company_uuid: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;

  // Billing
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  price_per_period: number;
  billing_interval: 'month' | 'quarter' | 'year';

  // Dates
  start_date: string; // ISO date
  end_date?: string; // ISO date
  next_billing_date?: string; // ISO date
  cancelled_at?: string; // ISO datetime
  pause_start?: string; // ISO date
  pause_end?: string; // ISO date

  // Services included
  services_per_period: number;
  services_used_this_period: number;

  // Performance
  total_revenue: number;
  periods_completed: number;
}

// ============================================================================
// SMS Messages
// ============================================================================

/**
 * SMS message direction
 */
export type SMSDirection = 'inbound' | 'outbound';

/**
 * SMS message status
 */
export type SMSStatus =
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'received';

/**
 * SMS message entity
 */
export interface SMSMessage {
  id: string;
  created_at: string; // ISO datetime
  direction: SMSDirection;
  status: SMSStatus;

  // Twilio
  twilio_sid?: string;
  from_number: string;
  to_number: string;
  body: string;

  // Association
  company_uuid?: string;
  job_uuid?: string;
  lead_id?: string;

  // AI analysis
  intent?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  requires_followup?: boolean;
}

// ============================================================================
// Webhook Payloads
// ============================================================================

/**
 * ServiceM8 webhook payload
 */
export interface ServiceM8Webhook {
  entry_type: 'job' | 'company' | 'staff' | 'jobactivity';
  event_type: 'insert' | 'update' | 'delete';
  object: ServiceM8Job | ServiceM8Company | ServiceM8Staff | ServiceM8JobActivity;
}

/**
 * Meta (Facebook) lead webhook payload
 */
export interface MetaLeadWebhook {
  object: 'page';
  entry: Array<{
    id: string;
    time: number;
    changes: Array<{
      field: 'leadgen';
      value: {
        ad_id: string;
        form_id: string;
        leadgen_id: string;
        created_time: number;
        page_id: string;
        adgroup_id: string;
      };
    }>;
  }>;
}

/**
 * Twilio SMS webhook payload
 */
export interface TwilioSMSWebhook {
  MessageSid: string;
  SmsSid: string;
  AccountSid: string;
  MessagingServiceSid?: string;
  From: string;
  To: string;
  Body: string;
  NumMedia: string;
  FromCity?: string;
  FromState?: string;
  FromZip?: string;
  FromCountry?: string;
  SmsStatus: 'received' | 'sent' | 'delivered' | 'undelivered' | 'failed';
}

/**
 * Vapi voice AI webhook payload
 */
export interface VapiWebhook {
  type: 'call.started' | 'call.ended' | 'transcript.update' | 'call.forwarded';
  call_id: string;
  timestamp: string;
  data: {
    phone_number?: string;
    duration?: number;
    transcript?: string;
    intent?: string;
    forwarded_to?: string;
    outcome?: 'completed' | 'voicemail' | 'no_answer' | 'busy' | 'failed';
  };
}

/**
 * Stripe webhook payload
 */
export interface StripeWebhook {
  id: string;
  object: 'event';
  type:
    | 'customer.subscription.created'
    | 'customer.subscription.updated'
    | 'customer.subscription.deleted'
    | 'invoice.payment_succeeded'
    | 'invoice.payment_failed';
  data: {
    object: any; // Stripe object (subscription, invoice, etc.)
  };
}

// ============================================================================
// Cron Job Responses
// ============================================================================

/**
 * Standard cron job response
 */
export interface CronJobResponse {
  success: boolean;
  message: string;
  executed_at: string; // ISO datetime
  data?: {
    records_processed?: number;
    records_created?: number;
    records_updated?: number;
    errors?: Array<{
      record_id?: string;
      error: string;
    }>;
  };
}

/**
 * KPI metrics for daily reports
 */
export interface DailyKPIMetrics {
  date: string; // ISO date

  // Revenue
  revenue_today: number;
  revenue_mtd: number;
  revenue_ytd: number;

  // Jobs
  jobs_completed_today: number;
  jobs_scheduled_today: number;
  jobs_in_progress: number;

  // Leads
  leads_new_today: number;
  leads_contacted_today: number;
  leads_converted_today: number;
  conversion_rate_mtd: number;

  // Operations
  avg_job_duration_hours: number;
  crew_utilization_rate: number;

  // Customer satisfaction
  avg_rating: number;
  reviews_count_today: number;
}

/**
 * Employee performance report
 */
export interface EmployeePerformanceReport {
  employee_id: string;
  employee_name: string;
  period_start: string; // ISO date
  period_end: string; // ISO date

  // Time
  total_hours: number;
  billable_hours: number;
  billable_percentage: number;

  // Jobs
  jobs_completed: number;
  avg_job_duration: number;

  // Quality
  quality_score: number;
  customer_rating: number;
  customer_complaints: number;

  // Revenue
  revenue_generated: number;
  revenue_per_hour: number;

  // Incentives
  incentive_earned: number;
  total_compensation: number;
}
