// TypeScript Types
export type User = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string;
  subscription_ends_at: string | null;
  subscription_created_at: string | null;
};

export type Business = {
  id: number;
  user_id: string;
  business_name: string;
  phone_number: string | null;
  ringley_phone_number: string | null;
  transfer_phone_number: string | null;
  business_hours: Record<string, any>;
  services: string[];
  faqs: Record<string, string>[];
  greeting_message: string | null;
  google_calendar_id: string | null;
  google_refresh_token: string | null;
  timezone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Call = {
  id: number;
  business_id: number;
  caller_phone_number: string | null;
  caller_name: string | null;
  call_summary: string | null;
  call_duration_seconds: number | null;
  call_status: string;
  was_transferred: boolean;
  transcript: string | null;
  external_call_id: string | null;
  created_at: string;
};

export type Appointment = {
  id: number;
  business_id: number;
  call_id: number | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  service: string | null;
  starts_at: string;
  ends_at: string;
  google_event_id: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

export type SmsLog = {
  id: number;
  business_id: number;
  call_id: number | null;
  recipient_phone: string;
  message_body: string;
  status: string;
  external_message_id: string | null;
  created_at: string;
};