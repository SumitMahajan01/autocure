-- Add demo account for testing
-- Note: This creates the user profile. The auth user must be created via Supabase Auth UI or API.

-- First, check if demo user exists in auth.users (this will be created manually or via signup)
-- Then insert the profile

INSERT INTO public.profiles (id, display_name, role)
SELECT 
  id,
  'Demo User',
  'user'
FROM auth.users 
WHERE email = 'demo@autocure.com'
ON CONFLICT (id) DO UPDATE SET
  display_name = 'Demo User',
  role = 'user';

-- Also ensure the user's email is confirmed
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'demo@autocure.com' AND email_confirmed_at IS NULL;

SELECT 'Demo account setup complete. Create auth user via Supabase Auth if not exists.' as status;
