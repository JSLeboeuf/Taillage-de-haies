/**
 * Acquisition M&A Prospects Type Definitions
 * Shared types for API routes and frontend components
 */

// ============================================================================
// Status & Sequence Types
// ============================================================================

export type AcquisitionStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "in_discussion"
  | "offer_made"
  | "negotiating"
  | "due_diligence"
  | "agreed"
  | "closed"
  | "declined"
  | "archived";

export type SequenceType = "cold" | "warm" | "referral" | "partner";

export type Priority = "low" | "medium" | "high" | "critical";

export type ActivityType =
  | "email_sent"
  | "email_replied"
  | "call_made"
  | "meeting"
  | "note_added"
  | "status_changed"
  | "offer_sent"
  | "document_sent";

// ============================================================================
// Prospect Types
// ============================================================================

export interface AcquisitionProspect {
  id: string;
  company_name: string;
  owner_name: string;
  owner_email: string | null;
  owner_phone: string | null;
  territory: string | null;
  source: string | null;
  estimated_age_years: number | null;
  status: AcquisitionStatus;
  sequence_type: SequenceType;
  sequence_step: number;
  priority: Priority;
  next_email_at: string | null;
  last_email_at: string | null;
  emails_sent_count: number;
  next_followup_at: string | null;
  last_followup_at: string | null;
  replied_at: string | null;
  emails_replied_count: number;
  tags: string[];
  notes: string | null;
  call_notes: string | null;
  offer_plan_a: string | null;
  offer_plan_b: string | null;
  deal_structure: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface AcquisitionActivity {
  id: string;
  prospect_id: string;
  activity_type: ActivityType;
  subject: string | null;
  notes: string | null;
  old_value: string | null;
  new_value: string | null;
  email_sent_to: string | null;
  associated_email_id: string | null;
  created_at: string;
}

export interface ProspectWithActivities {
  prospect: AcquisitionProspect;
  activities: AcquisitionActivity[];
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CreateProspectRequest {
  company_name: string;
  owner_name: string;
  owner_email?: string;
  owner_phone?: string;
  territory?: string;
  source?: string;
  estimated_age_years?: number;
  sequence_type?: SequenceType;
  priority?: Priority;
  tags?: string[];
  notes?: string;
}

export interface CreateProspectResponse {
  success: boolean;
  prospect: AcquisitionProspect;
}

export interface UpdateProspectRequest {
  status?: AcquisitionStatus;
  sequence_type?: SequenceType;
  sequence_step?: number;
  priority?: Priority;
  notes?: string;
  call_notes?: string;
  offer_plan_a?: string;
  offer_plan_b?: string;
  deal_structure?: string;
  next_email_at?: string;
  next_followup_at?: string;
  tags?: string[];
  assigned_to?: string;
}

export interface UpdateProspectResponse {
  success: boolean;
  prospect: AcquisitionProspect;
}

export interface ListProspectsResponse {
  prospects: AcquisitionProspect[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
}

export interface BulkImportProspect {
  company_name: string;
  owner_name: string;
  owner_email?: string;
  owner_phone?: string;
  territory?: string;
  source?: string;
  estimated_age_years?: number;
  notes?: string;
}

export interface BulkImportRequest {
  prospects: BulkImportProspect[];
}

export interface BulkImportResponse {
  imported: number;
  duplicates: number;
  errors: number;
  details: {
    imported_companies: string[];
    duplicate_companies: string[];
    error_messages: string[];
  };
}

export interface PipelineStats {
  summary: {
    total_prospects: number;
    active_prospects: number;
    total_replies: number;
    response_rate: number;
  };
  status_breakdown: Record<AcquisitionStatus, number>;
  sequence_breakdown: Record<SequenceType, number>;
  activity: {
    emails_sent_this_week: number;
    emails_sent_this_month: number;
    upcoming_emails_7_days: number;
  };
}

// ============================================================================
// Filter Types
// ============================================================================

export interface ProspectsFilterParams {
  status?: AcquisitionStatus | "all";
  sequence_type?: SequenceType | "all";
  priority?: Priority | "all";
  territory?: string | "all";
  search?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// UI Helper Types
// ============================================================================

export interface ProspectStats {
  totalProspects: number;
  byStatus: Record<AcquisitionStatus, number>;
  bySequence: Record<SequenceType, number>;
  responseRate: number;
  upcomingEmails: number;
}

export const StatusLabels: Record<AcquisitionStatus, string> = {
  new: "New Prospect",
  contacted: "Initial Contact",
  qualified: "Qualified",
  in_discussion: "In Discussion",
  offer_made: "Offer Made",
  negotiating: "Negotiating",
  due_diligence: "Due Diligence",
  agreed: "Agreed",
  closed: "Closed",
  declined: "Declined",
  archived: "Archived",
};

export const SequenceLabels: Record<SequenceType, string> = {
  cold: "Cold Outreach",
  warm: "Warm Introduction",
  referral: "Customer Referral",
  partner: "Partner Referral",
};

export const PriorityLabels: Record<Priority, string> = {
  low: "Low Priority",
  medium: "Medium Priority",
  high: "High Priority",
  critical: "Critical",
};

export const PriorityColors: Record<Priority, string> = {
  low: "gray",
  medium: "blue",
  high: "orange",
  critical: "red",
};

export const ActivityTypeLabels: Record<ActivityType, string> = {
  email_sent: "Email Sent",
  email_replied: "Email Reply",
  call_made: "Call Made",
  meeting: "Meeting",
  note_added: "Note Added",
  status_changed: "Status Changed",
  offer_sent: "Offer Sent",
  document_sent: "Document Sent",
};
