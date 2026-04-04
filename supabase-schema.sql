-- Users table (standard)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  subscription_status VARCHAR(20) DEFAULT 'free',
  subscription_ends_at TIMESTAMPTZ,
  subscription_created_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS users_subscription_status_idx ON users(subscription_status);

-- Business profiles configured by the owner
CREATE TABLE IF NOT EXISTS businesses (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50),
  ringley_phone_number VARCHAR(50),
  transfer_phone_number VARCHAR(50),
  business_hours JSONB NOT NULL DEFAULT '{}',
  services TEXT[] NOT NULL DEFAULT '{}',
  faqs JSONB NOT NULL DEFAULT '[]',
  greeting_message TEXT,
  google_calendar_id VARCHAR(255),
  google_refresh_token TEXT,
  timezone VARCHAR(100) NOT NULL DEFAULT 'America/New_York',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS businesses_user_id_idx ON businesses(user_id);
CREATE INDEX IF NOT EXISTS businesses_ringley_phone_idx ON businesses(ringley_phone_number);
CREATE INDEX IF NOT EXISTS businesses_is_active_idx ON businesses(is_active);

-- Inbound call records
CREATE TABLE IF NOT EXISTS calls (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  caller_phone_number VARCHAR(50),
  caller_name VARCHAR(255),
  call_summary TEXT,
  call_duration_seconds INTEGER,
  call_status VARCHAR(30) NOT NULL DEFAULT 'completed',
  was_transferred BOOLEAN NOT NULL DEFAULT false,
  transcript TEXT,
  external_call_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS calls_business_id_idx ON calls(business_id);
CREATE INDEX IF NOT EXISTS calls_created_at_idx ON calls(created_at);
CREATE INDEX IF NOT EXISTS calls_external_call_id_idx ON calls(external_call_id);

-- Appointments booked via AI calls
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  call_id INTEGER REFERENCES calls(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  customer_email VARCHAR(255),
  service VARCHAR(255),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  google_event_id VARCHAR(255),
  status VARCHAR(30) NOT NULL DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS appointments_business_id_idx ON appointments(business_id);
CREATE INDEX IF NOT EXISTS appointments_starts_at_idx ON appointments(starts_at);
CREATE INDEX IF NOT EXISTS appointments_status_idx ON appointments(status);

-- SMS summaries sent to business owners
CREATE TABLE IF NOT EXISTS sms_logs (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  call_id INTEGER REFERENCES calls(id) ON DELETE SET NULL,
  recipient_phone VARCHAR(50) NOT NULL,
  message_body TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'sent',
  external_message_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS sms_logs_business_id_idx ON sms_logs(business_id);
CREATE INDEX IF NOT EXISTS sms_logs_call_id_idx ON sms_logs(call_id);