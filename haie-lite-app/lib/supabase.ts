import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy singletons — initialized on first use to avoid build-time env errors
let _admin: SupabaseClient | null = null;
let _anon: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
  }
  return _admin;
}

export function getSupabase(): SupabaseClient {
  if (!_anon) {
    _anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _anon;
}

// Backward-compat aliases (lazy proxies)
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_t, prop) {
    return (getSupabaseAdmin() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const supabase = new Proxy({} as SupabaseClient, {
  get(_t, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// ============================================================
// Database helper functions
// ============================================================

// Leads
export async function createLead(lead: {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  source: string;
  hedge_type?: string;
  hedge_length_m?: number;
  hedge_height_m?: number;
  hedge_sides?: number;
  notes?: string;
}) {
  const { data, error } = await supabaseAdmin
    .from('leads')
    .insert(lead)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getLeadByPhone(phone: string) {
  const { data } = await supabaseAdmin
    .from('leads')
    .select('*')
    .eq('phone', phone)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  return data;
}

// Leads needing follow-up
export async function getLeadsForFollowup(stage: string) {
  const { data, error } = await supabaseAdmin
    .from('leads')
    .select('*')
    .eq('followup_stage', stage)
    .eq('status', 'quoted')
    .lte('next_followup_at', new Date().toISOString());
  if (error) throw error;
  return data || [];
}

// Timesheets
export async function upsertTimesheet(entry: {
  employee_id: string;
  date: string;
  job_uuid: string;
  start_time: string;
  end_time?: string;
  hours?: number;
  job_revenue?: number;
}) {
  const { data, error } = await supabaseAdmin
    .from('timesheets')
    .upsert(entry, { onConflict: 'employee_id,date,job_uuid' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Daily payroll
export async function getDailyPayroll(date: string) {
  const { data } = await supabaseAdmin
    .from('daily_payroll')
    .select('*')
    .eq('date', date)
    .single();
  return data;
}

export async function upsertDailyPayroll(payroll: {
  date: string;
  total_hours: number;
  total_labor_cost: number;
  total_revenue: number;
  margin_pct: number;
  jobs_completed: number;
  employees_active: number;
  breakdown: Record<string, unknown>;
}) {
  const { data, error } = await supabaseAdmin
    .from('daily_payroll')
    .upsert(payroll, { onConflict: 'date' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Employee incentives
export async function createIncentive(incentive: {
  employee_id: string;
  type: 'review_bonus' | 'referral_commission' | 'performance_bonus' | 'upsell_commission';
  amount: number;
  description?: string;
  google_review_id?: string;
  referral_id?: string;
  job_uuid?: string;
  month?: string;
}) {
  const { data, error } = await supabaseAdmin
    .from('employee_incentives')
    .insert({ ...incentive, status: 'pending' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Upsell opportunities
export async function createUpsellOpportunity(upsell: {
  job_uuid: string;
  employee_id: string;
  service_type: string;
  description?: string;
  photo_url?: string;
  estimated_value?: number;
}) {
  const { data, error } = await supabaseAdmin
    .from('upsell_opportunities')
    .insert({ ...upsell, status: 'flagged' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Messages sent (tracking)
export async function logMessageSent(msg: {
  lead_id?: string;
  employee_id?: string;
  channel: 'sms' | 'email';
  type: string;
  content: string;
  recipient_phone?: string;
  recipient_email?: string;
}) {
  const { error } = await supabaseAdmin
    .from('messages_sent')
    .insert(msg);
  if (error) throw error;
}

// Employees
export async function getActiveEmployees() {
  const { data, error } = await supabaseAdmin
    .from('employees')
    .select('*')
    .eq('active', true);
  if (error) throw error;
  return data || [];
}

export async function getEmployeeByServiceM8Id(staffUuid: string) {
  const { data } = await supabaseAdmin
    .from('employees')
    .select('*')
    .eq('servicem8_staff_uuid', staffUuid)
    .single();
  return data;
}

// KPIs
export async function upsertDailyKPI(kpi: {
  date: string;
  leads_received: number;
  quotes_sent: number;
  jobs_completed: number;
  revenue: number;
  avg_ticket: number;
  conversion_rate: number;
}) {
  const { data, error } = await supabaseAdmin
    .from('daily_kpis')
    .upsert(kpi, { onConflict: 'date' })
    .select()
    .single();
  if (error) throw error;
  return data;
}
