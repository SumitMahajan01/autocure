-- Fix: Attach trigger to auth.users for auto-creating profiles
-- This ensures new signups automatically get a profile row

-- First, drop the trigger if it exists to avoid errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verify the trigger was created
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Auto-creates a profile row when a new user signs up';
