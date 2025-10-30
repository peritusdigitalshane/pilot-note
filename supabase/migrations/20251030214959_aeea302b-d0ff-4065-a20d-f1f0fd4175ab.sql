-- Create system settings table for secure configuration storage
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage system settings
CREATE POLICY "Super admins manage system settings"
  ON system_settings
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'))
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default Stripe settings placeholders
INSERT INTO system_settings (key, value, description) VALUES
  ('stripe_secret_key', '', 'Stripe Secret Key for payment processing'),
  ('stripe_publishable_key', '', 'Stripe Publishable Key for client-side'),
  ('stripe_webhook_secret', '', 'Stripe Webhook Secret for signature verification')
ON CONFLICT (key) DO NOTHING;