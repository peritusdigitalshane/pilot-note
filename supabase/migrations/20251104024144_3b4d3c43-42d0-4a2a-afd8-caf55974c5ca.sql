-- Insert Stripe settings into system_settings if they don't exist
INSERT INTO system_settings (key, value, description)
VALUES 
  ('stripe_secret_key', '', 'Stripe secret key for server-side API calls'),
  ('stripe_publishable_key', '', 'Stripe publishable key for client-side integration'),
  ('stripe_webhook_secret', '', 'Webhook signing secret for verifying Stripe events')
ON CONFLICT (key) DO NOTHING;

-- Create subscription_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  price_cents INTEGER NOT NULL,
  description TEXT,
  features JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on subscription_plans
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view active plans
CREATE POLICY "Anyone can view active plans"
ON subscription_plans
FOR SELECT
USING (is_active = true);

-- Only super admins can manage plans
CREATE POLICY "Super admins can manage plans"
ON subscription_plans
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

-- Insert default plans
INSERT INTO subscription_plans (name, price_cents, description, features)
VALUES 
  ('free', 0, 'Perfect for getting started', '["10 AI conversations per month", "5 custom AI models", "1 knowledge base (max 50 documents)", "5 voice transcriptions per month", "10 notes storage", "Community support", "Access to free prompt packs only"]'::jsonb),
  ('pro', 2900, 'For power users and professionals', '["Unlimited AI conversations", "Unlimited custom AI models", "Unlimited knowledge bases with RAG", "Unlimited voice transcriptions", "Unlimited notes storage", "Priority support", "Access to all premium prompt packs", "Organization sharing & collaboration", "Advanced analytics & insights", "API access"]'::jsonb)
ON CONFLICT (name) DO UPDATE
SET 
  price_cents = EXCLUDED.price_cents,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  updated_at = now();