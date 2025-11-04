# Signup & Entitlement Implementation

## Overview
Complete implementation of the signup → entitlement flow with server-side enforcement, Stripe payment integration, and automatic model access management.

## What Changed

### 1. Database Schema Changes
- **Created `system_metadata` table** to store system configuration (e.g., base model ID)
- **Updated `handle_new_user()` trigger** to automatically assign Base Model access on signup
- **Created Base Model** (ID: `00000000-0000-0000-0000-000000000002`) - GPT-3.5-turbo that all users receive
- **Updated RLS policies** on `fullpilot_models` to ensure users can only see models they have access to
- **Added indices** on `user_models` for performance optimisation

### 2. Stripe Integration Updates
**File: `supabase/functions/stripe-webhook/index.ts`**
- On successful payment (`checkout.session.completed`):
  - Updates `profiles.is_premium_member = true`
  - Grants access to all premium models (excludes base model)
  - Logs all actions for audit trail
- On subscription cancellation (`customer.subscription.deleted`):
  - Reverts `profiles.is_premium_member = false`
  - Removes premium model access (retains base model)
  - Idempotent handling of duplicate events

### 3. Frontend Changes
**File: `src/pages/Auth.tsx`**
- Improved post-signup messaging to clarify Base Model is already active
- Updated success toasts to be more informative
- Auto-redirects to dashboard after choosing free plan

**File: `src/components/PricingPlans.tsx`**
- Clarified plan names: "Free (Base Model)" vs "Pro (Premium Models)"
- Highlighted that Base Model (GPT-3.5-turbo) is already active for free users
- Premium plan now clearly shows "All Premium AI Models" as first feature

## Server-Side Enforcement

### Access Control Flow
1. **User signup** → `handle_new_user()` trigger fires → Base Model automatically assigned
2. **Model queries** → RLS policy checks `user_models` table → Only returns models user has access to
3. **Premium upgrade** → Stripe webhook → Grants premium models server-side
4. **Downgrade/cancel** → Stripe webhook → Removes premium models, keeps base

### RLS Policies
- **`fullpilot_models`**: Users can only SELECT models they have installed
- **`user_models`**: Users can only view/manage their own model assignments
- **`system_metadata`**: Super admins can manage, all authenticated users can read

## Environment Variables Required

```bash
# Stripe (already configured in system_settings table)
STRIPE_SECRET_KEY=sk_test_... (stored in system_settings)
STRIPE_WEBHOOK_SECRET=whsec_... (stored in system_settings)

# Supabase (already configured)
SUPABASE_URL=https://krdwypftyokqsffxoobk.supabase.co
SUPABASE_ANON_KEY=eyJ... (already in .env)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (Supabase secret)
```

## Testing Instructions

### 1. Test New User Signup (Base Model Assignment)
```bash
# Sign up at /auth
# Expected: After signup, user sees pricing page with "Base Model - already active!"
# Choose "Continue with Free" → Redirected to dashboard
# Check: User should have Base Model in their models list
```

**SQL verification:**
```sql
-- Check user has base model assigned
SELECT um.*, fm.name 
FROM user_models um
JOIN fullpilot_models fm ON fm.id = um.model_id
WHERE um.user_id = '<new_user_id>';

-- Should return: Base Model
```

### 2. Test Stripe Upgrade Flow
```bash
# 1. Sign up → Choose "Upgrade to Pro"
# 2. Complete Stripe checkout (use test card: 4242 4242 4242 4242)
# 3. Redirected back with payment=success
# Expected: User now has is_premium_member = true and access to all premium models
```

**SQL verification:**
```sql
-- Check premium status
SELECT is_premium_member FROM profiles WHERE user_id = '<user_id>';

-- Check all models granted
SELECT fm.name 
FROM user_models um
JOIN fullpilot_models fm ON fm.id = um.model_id
WHERE um.user_id = '<user_id>';

-- Should return: Base Model + all premium models
```

### 3. Test Stripe Webhook (Simulate Locally)
```bash
# Install Stripe CLI
stripe listen --forward-to https://krdwypftyokqsffxoobk.supabase.co/functions/v1/stripe-webhook

# Trigger test event
stripe trigger checkout.session.completed
```

**Check edge function logs:**
```
https://supabase.com/dashboard/project/krdwypftyokqsffxoobk/functions/stripe-webhook/logs
```

### 4. Test Server-Side Enforcement
```bash
# Attempt to access premium model as free user
# Expected: 403 or model not visible in list

# Query via Supabase client (as free user):
const { data } = await supabase
  .from('fullpilot_models')
  .select('*');

# Should only return Base Model for free users
```

### 5. Test Subscription Cancellation
```bash
# Cancel subscription in Stripe Dashboard
# Or trigger via CLI:
stripe trigger customer.subscription.deleted

# Expected: User loses premium models, keeps Base Model
```

## Edge Cases Handled

1. **User closes browser after signup** → Base Model access persists
2. **Duplicate webhook events** → Idempotent inserts (ON CONFLICT DO NOTHING)
3. **Payment failure** → No premium access granted
4. **Webhook signature verification** → Rejects invalid requests
5. **User already has model** → Ignores duplicate key errors
6. **First user** → Automatically becomes super admin

## Rollback Plan

### If issues arise, rollback in this order:

1. **Revert RLS policy** (if users can't see models):
```sql
DROP POLICY IF EXISTS "Users can view installed models" ON fullpilot_models;
CREATE POLICY "Users can view active models" ON fullpilot_models
FOR SELECT TO authenticated
USING (is_active = true AND auth.uid() IS NOT NULL);
```

2. **Revert webhook changes** (if premium assignment fails):
```bash
# Redeploy previous version of stripe-webhook function
# Or manually grant models via SQL:
INSERT INTO user_models (user_id, model_id)
SELECT '<user_id>', id FROM fullpilot_models WHERE is_active = true;
```

3. **Revert trigger** (if signup breaks):
```sql
-- Restore previous handle_new_user function without base model assignment
-- See migration history for previous version
```

## Admin Operations

### Manually grant premium access:
```sql
-- Update premium status
UPDATE profiles SET is_premium_member = true WHERE user_id = '<user_id>';

-- Grant all premium models
INSERT INTO user_models (user_id, model_id)
SELECT '<user_id>', id FROM fullpilot_models 
WHERE is_active = true 
AND id != '00000000-0000-0000-0000-000000000002'
ON CONFLICT DO NOTHING;
```

### Manually revoke premium access:
```sql
UPDATE profiles SET is_premium_member = false WHERE user_id = '<user_id>';

DELETE FROM user_models 
WHERE user_id = '<user_id>' 
AND model_id != '00000000-0000-0000-0000-000000000002';
```

### Check payment status:
```sql
-- View user entitlements
SELECT 
  p.email,
  p.is_premium_member,
  COUNT(um.model_id) as model_count,
  STRING_AGG(fm.name, ', ') as models
FROM profiles p
LEFT JOIN user_models um ON um.user_id = p.user_id
LEFT JOIN fullpilot_models fm ON fm.id = um.model_id
WHERE p.user_id = '<user_id>'
GROUP BY p.email, p.is_premium_member;
```

## Monitoring & Logging

### Check webhook events:
```bash
# View Supabase edge function logs
https://supabase.com/dashboard/project/krdwypftyokqsffxoobk/functions/stripe-webhook/logs

# Look for:
- "Updating premium status for user: <id>"
- "Granted access to X premium models"
- "Failed to grant model" (errors)
```

### Check signup flow:
```sql
-- Recent signups with model assignments
SELECT 
  p.email,
  p.created_at,
  COUNT(um.model_id) as models_assigned
FROM profiles p
LEFT JOIN user_models um ON um.user_id = p.user_id
WHERE p.created_at > NOW() - INTERVAL '24 hours'
GROUP BY p.email, p.created_at
ORDER BY p.created_at DESC;
```

## QA Checklist

- [x] New user receives Base Model immediately on signup
- [x] Post-signup modal shows "Base Model - already active!"
- [x] "Continue with Free" redirects to dashboard with Base Model access
- [x] "Upgrade to Pro" initiates Stripe checkout
- [x] Successful payment grants premium models server-side
- [x] Failed payment keeps user on Base Model
- [x] Webhook verifies Stripe signature
- [x] Subscription cancellation removes premium models
- [x] RLS enforces model access at database level
- [x] Edge function logs all entitlement changes
- [x] Idempotency prevents duplicate model grants
- [x] Tests documented for all flows

## Security Notes

⚠️ **Leaked Password Protection Warning**: Supabase auth has leaked password protection disabled. Enable this in:
```
https://supabase.com/dashboard/project/krdwypftyokqsffxoobk/auth/providers
```

✅ **All RLS policies enabled** on relevant tables
✅ **Server-side role enforcement** via `has_role()` function
✅ **No client-side-only access control**
✅ **Stripe webhook signature verification** implemented
✅ **Service role key** used only in edge functions (server-side)

## Further Improvements (Optional)

- [ ] Add promo code support in Stripe checkout
- [ ] Implement trial period (temporary premium, expires via cron)
- [ ] Add refund handling via admin dashboard
- [ ] Create analytics dashboard for subscription metrics
- [ ] Add email notifications on subscription changes
- [ ] Implement usage limits enforcement (e.g., 10 conversations/month for free)

## Summary

✅ **Problem**: New users had no access after signup  
✅ **Solution**: Automatic Base Model assignment via database trigger  
✅ **Premium flow**: Stripe checkout → webhook → grant premium models  
✅ **Enforcement**: Server-side RLS policies + edge function checks  
✅ **UX**: Clear messaging about Base Model access and upgrade options  

**Result**: Secure, scalable signup-to-entitlement flow with proper server-side enforcement and payment integration.
