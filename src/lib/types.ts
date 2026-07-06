export type ComplaintStatus = 'submitted' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed' | 'rejected' | 'escalated';
export type ComplaintSeverity = '1' | '2' | '3' | '4' | '5';
export type SubmissionChannel = 'web' | 'whatsapp' | 'ussd' | 'ivr' | 'sms';
export type NotificationChannel = 'sms' | 'whatsapp' | 'push' | 'email';
export type OfficerRole = 'field_worker' | 'supervisor' | 'dept_head' | 'commissioner';
export type TenantPlan = 'free' | 'starter' | 'pro' | 'enterprise';

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  state: string;
  city_hindi: string;
  plan: TenantPlan;
  config: Record<string, any>;
  created_at: string;
}

export interface Citizen {
  id: string;
  phone: string;
  name: string | null;
  preferred_lang: 'en' | 'hi';
  tenant_id: string | null;
  ward_id: string | null;
  created_at: string;
}

export interface Department {
  id: string;
  tenant_id: string;
  name: string;
  name_hi: string;
  head_name: string | null;
  head_phone: string | null;
  sla_hours: number;
  created_at: string;
}

export interface Ward {
  id: string;
  tenant_id: string;
  ward_number: number;
  ward_name: string;
  ward_name_hi: string;
  zone: string | null;
  geom: any; // GeoJSON geometry
  dept_id: string | null;
  created_at: string;
}

export interface Complaint {
  id: string;
  ticket_id: string;
  citizen_id: string | null;
  tenant_id: string;
  master_id: string | null;
  category: string;
  sub_category: string | null;
  severity: number;
  status: ComplaintStatus;
  title: string | null;
  description: string | null;
  location: any; // Point geometry
  geohash: string | null;
  address_text: string | null;
  ward_id: string | null;
  dept_id: string | null;
  media_before: string[] | null;
  media_after: string[] | null;
  channel: SubmissionChannel;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  due_at: string | null;
}

export interface Officer {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  dept_id: string;
  ward_id: string | null;
  role: OfficerRole;
  created_at: string;
}

export interface Escalation {
  id: string;
  complaint_id: string;
  level: number;
  escalated_to: string;
  escalated_at: string;
  reason: string | null;
}

export interface Notification {
  id: string;
  citizen_id: string;
  complaint_id: string | null;
  channel: NotificationChannel;
  message: string;
  sent_at: string;
  status: string;
}
