/**
 * Acquisition M&A API client library
 * Provides typed functions for all prospect operations
 */

import {
  AcquisitionProspect,
  AcquisitionActivity,
  ProspectWithActivities,
  CreateProspectRequest,
  CreateProspectResponse,
  UpdateProspectRequest,
  UpdateProspectResponse,
  ListProspectsResponse,
  BulkImportRequest,
  BulkImportResponse,
  PipelineStats,
  ProspectsFilterParams,
} from "@/types/acquisitions";

const API_BASE = "/api/acquisitions";

/**
 * Get authorization header with DASHBOARD_KEY
 */
function getAuthHeader(): HeadersInit {
  const key = process.env.NEXT_PUBLIC_DASHBOARD_KEY || "";
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

/**
 * Handle API responses
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.error || `API error: ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
}

// ============================================================================
// Prospect CRUD
// ============================================================================

/**
 * Create a new acquisition prospect
 */
export async function createProspect(
  data: CreateProspectRequest,
): Promise<AcquisitionProspect> {
  const response = await fetch(`${API_BASE}/prospects`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  const result = await handleResponse<CreateProspectResponse>(response);
  return result.prospect;
}

/**
 * Get prospect details with activity history
 */
export async function getProspect(id: string): Promise<ProspectWithActivities> {
  const response = await fetch(`${API_BASE}/prospects/${id}`, {
    method: "GET",
    headers: getAuthHeader(),
  });
  return handleResponse<ProspectWithActivities>(response);
}

/**
 * Update a prospect
 */
export async function updateProspect(
  id: string,
  data: UpdateProspectRequest,
): Promise<AcquisitionProspect> {
  const response = await fetch(`${API_BASE}/prospects/${id}`, {
    method: "PATCH",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  const result = await handleResponse<UpdateProspectResponse>(response);
  return result.prospect;
}

/**
 * Archive a prospect (soft delete)
 */
export async function archiveProspect(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/prospects/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  await handleResponse(response);
}

// ============================================================================
// Prospect Listing
// ============================================================================

/**
 * List prospects with optional filters
 */
export async function listProspects(
  params?: ProspectsFilterParams,
): Promise<AcquisitionProspect[]> {
  const searchParams = new URLSearchParams();

  if (params?.status) {
    searchParams.set("status", params.status);
  }
  if (params?.sequence_type) {
    searchParams.set("sequence_type", params.sequence_type);
  }
  if (params?.priority) {
    searchParams.set("priority", params.priority);
  }
  if (params?.territory) {
    searchParams.set("territory", params.territory);
  }
  if (params?.search) {
    searchParams.set("search", params.search);
  }
  if (params?.limit) {
    searchParams.set("limit", params.limit.toString());
  }
  if (params?.offset) {
    searchParams.set("offset", params.offset.toString());
  }

  const url = `${API_BASE}/prospects${searchParams.toString() ? `?${searchParams}` : ""}`;
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeader(),
  });
  const result = await handleResponse<ListProspectsResponse>(response);
  return result.prospects;
}

/**
 * Search prospects by company or owner name
 */
export async function searchProspects(
  query: string,
): Promise<AcquisitionProspect[]> {
  return listProspects({ search: query });
}

/**
 * Get prospects by status
 */
export async function getProspectsByStatus(
  status: string,
): Promise<AcquisitionProspect[]> {
  return listProspects({ status: status as any });
}

/**
 * Get paginated prospects
 */
export async function getPaginatedProspects(
  limit: number = 20,
  offset: number = 0,
  filters?: Omit<ProspectsFilterParams, "limit" | "offset">,
): Promise<{
  prospects: AcquisitionProspect[];
  pagination: { offset: number; limit: number; total: number };
}> {
  const searchParams = new URLSearchParams();

  if (filters?.status) {
    searchParams.set("status", filters.status);
  }
  if (filters?.sequence_type) {
    searchParams.set("sequence_type", filters.sequence_type);
  }
  if (filters?.priority) {
    searchParams.set("priority", filters.priority);
  }
  if (filters?.territory) {
    searchParams.set("territory", filters.territory);
  }
  if (filters?.search) {
    searchParams.set("search", filters.search);
  }

  searchParams.set("limit", limit.toString());
  searchParams.set("offset", offset.toString());

  const url = `${API_BASE}/prospects?${searchParams}`;
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeader(),
  });
  return handleResponse<ListProspectsResponse>(response);
}

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Import multiple prospects in batch
 */
export async function bulkImportProspects(
  prospects: BulkImportRequest["prospects"],
): Promise<BulkImportResponse> {
  const response = await fetch(`${API_BASE}/import`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify({ prospects }),
  });
  return handleResponse<BulkImportResponse>(response);
}

// ============================================================================
// Analytics
// ============================================================================

/**
 * Get pipeline statistics
 */
export async function getPipelineStats(): Promise<PipelineStats> {
  const response = await fetch(`${API_BASE}/stats`, {
    method: "GET",
    headers: getAuthHeader(),
  });
  return handleResponse<PipelineStats>(response);
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Update multiple prospects
 */
export async function updateMultipleProspects(
  ids: string[],
  data: UpdateProspectRequest,
): Promise<AcquisitionProspect[]> {
  return Promise.all(ids.map((id) => updateProspect(id, data)));
}

/**
 * Archive multiple prospects
 */
export async function archiveMultipleProspects(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => archiveProspect(id)));
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format date for display
 */
export function formatProspectDate(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Calculate days since prospect was created
 */
export function daysSinceCreated(prospect: AcquisitionProspect): number {
  const created = new Date(prospect.created_at);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if prospect needs follow-up
 */
export function needsFollowUp(prospect: AcquisitionProspect): boolean {
  if (!prospect.next_followup_at) return false;
  return new Date(prospect.next_followup_at) <= new Date();
}

/**
 * Check if next email is due
 */
export function isEmailDue(prospect: AcquisitionProspect): boolean {
  if (!prospect.next_email_at) return false;
  return new Date(prospect.next_email_at) <= new Date();
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: "bg-gray-100 text-gray-800",
    contacted: "bg-blue-100 text-blue-800",
    qualified: "bg-indigo-100 text-indigo-800",
    in_discussion: "bg-purple-100 text-purple-800",
    offer_made: "bg-orange-100 text-orange-800",
    negotiating: "bg-yellow-100 text-yellow-800",
    due_diligence: "bg-pink-100 text-pink-800",
    agreed: "bg-green-100 text-green-800",
    closed: "bg-emerald-100 text-emerald-800",
    declined: "bg-red-100 text-red-800",
    archived: "bg-slate-100 text-slate-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

/**
 * Get priority badge color
 */
export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: "bg-slate-100 text-slate-800",
    medium: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };
  return colors[priority] || "bg-gray-100 text-gray-800";
}
