const BASE_URL = 'https://api.servicem8.com/api_1.0';

class ServiceM8Client {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SERVICEM8_API_KEY || '';
    if (!this.apiKey) throw new Error('SERVICEM8_API_KEY is required');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 429) {
      // Rate limited - wait and retry once
      await new Promise(r => setTimeout(r, 2000));
      return this.request<T>(endpoint, options);
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`ServiceM8 API error ${response.status}: ${text}`);
    }

    // For POST, return the UUID from header
    if (options.method === 'POST') {
      const uuid = response.headers.get('x-record-uuid');
      const body = await response.text();
      return { uuid, ...(body ? JSON.parse(body) : {}) } as T;
    }

    return response.json();
  }

  // Jobs
  async getJobs(filter?: string) {
    const query = filter ? `?$filter=${encodeURIComponent(filter)}` : '';
    return this.request<ServiceM8Job[]>(`/job.json${query}`);
  }

  async getJob(uuid: string) {
    return this.request<ServiceM8Job>(`/job/${uuid}.json`);
  }

  async createJob(data: Partial<ServiceM8Job>) {
    return this.request<{ uuid: string }>('/job.json', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateJob(uuid: string, data: Partial<ServiceM8Job>) {
    return this.request<void>(`/job/${uuid}.json`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Companies (Clients)
  async getCompanies(filter?: string) {
    const query = filter ? `?$filter=${encodeURIComponent(filter)}` : '';
    return this.request<ServiceM8Company[]>(`/company.json${query}`);
  }

  async getCompany(uuid: string) {
    return this.request<ServiceM8Company>(`/company/${uuid}.json`);
  }

  async createCompany(data: Partial<ServiceM8Company>) {
    return this.request<{ uuid: string }>('/company.json', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Contacts
  async getContacts(companyUuid: string) {
    return this.request<ServiceM8Contact[]>(
      `/companycontact.json?$filter=company_uuid eq '${companyUuid}'`
    );
  }

  async createContact(data: Partial<ServiceM8Contact>) {
    return this.request<{ uuid: string }>('/companycontact.json', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Job Activities (Bookings / Time Tracking)
  async getJobActivities(filter?: string) {
    const query = filter ? `?$filter=${encodeURIComponent(filter)}` : '';
    return this.request<ServiceM8JobActivity[]>(`/jobactivity.json${query}`);
  }

  async createJobActivity(data: Partial<ServiceM8JobActivity>) {
    return this.request<{ uuid: string }>('/jobactivity.json', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Staff
  async getStaff() {
    return this.request<ServiceM8Staff[]>('/staff.json');
  }

  async getStaffMember(uuid: string) {
    return this.request<ServiceM8Staff>(`/staff/${uuid}.json`);
  }

  // SMS
  async sendSMS(jobUuid: string, to: string, message: string) {
    return this.request<void>('/platform_service_sms', {
      method: 'POST',
      body: JSON.stringify({
        job_uuid: jobUuid,
        phone_number: to,
        message,
      }),
    });
  }

  // Pagination helper
  async getAllPaginated<T>(endpoint: string, filter?: string): Promise<T[]> {
    const results: T[] = [];
    let cursor = '-1';

    while (true) {
      const query = filter
        ? `?$filter=${encodeURIComponent(filter)}&cursor=${cursor}`
        : `?cursor=${cursor}`;

      const response = await fetch(`${BASE_URL}${endpoint}${query}`, {
        headers: { 'X-API-Key': this.apiKey },
      });

      const nextCursor = response.headers.get('x-next-cursor');
      const data = await response.json();
      results.push(...data);

      if (!nextCursor) break;
      cursor = nextCursor;
    }

    return results;
  }

  // Convenience: Get today's completed jobs
  async getTodayCompletedJobs() {
    const today = new Date().toISOString().split('T')[0];
    return this.getJobs(`status eq 'Completed' and completion_date gt '${today}'`);
  }

  // Convenience: Get activities for a date range (for time tracking)
  async getActivitiesForDate(date: string) {
    return this.getJobActivities(
      `start_date gt '${date} 00:00:00' and start_date lt '${date} 23:59:59'`
    );
  }

  // Convenience: Get open quotes
  async getOpenQuotes() {
    return this.getJobs("status eq 'Quote' and active eq 1");
  }
}

// TypeScript interfaces for ServiceM8 entities
interface ServiceM8Job {
  uuid: string;
  company_uuid: string;
  status: 'Quote' | 'Work Order' | 'Approved' | 'In Progress' | 'Completed' | 'Unsuccessful';
  job_address: string;
  description: string;
  job_is_quoted: string;
  total_invoice_amount: string;
  active: number;
  create_date: string;
  completion_date: string;
  generated_job_id: string;
}

interface ServiceM8Company {
  uuid: string;
  name: string;
  phone?: string;
  email?: string;
  address: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_postcode: string;
  address_country: string;
}

interface ServiceM8Contact {
  uuid: string;
  company_uuid: string;
  first: string;
  last: string;
  email: string;
  mobile: string;
}

interface ServiceM8JobActivity {
  uuid: string;
  job_uuid: string;
  staff_uuid: string;
  start_date: string;
  end_date: string;
  activity_was_scheduled: string;
}

interface ServiceM8Staff {
  uuid: string;
  first: string;
  last: string;
  mobile: string;
  email: string;
  is_active: string;
}

export const servicem8 = new ServiceM8Client();
export type { ServiceM8Job, ServiceM8Company, ServiceM8Contact, ServiceM8JobActivity, ServiceM8Staff };
export { ServiceM8Client };
