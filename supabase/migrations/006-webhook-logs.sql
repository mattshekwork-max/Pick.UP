-- Create webhook_logs table for debugging
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read logs
CREATE POLICY "Authenticated users can view webhook logs"
  ON public.webhook_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role to insert (webhook uses service key)
CREATE POLICY "Service role can insert webhook logs"
  ON public.webhook_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at 
  ON public.webhook_logs(created_at DESC);

-- Create index for event type filtering
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type 
  ON public.webhook_logs(event_type);
