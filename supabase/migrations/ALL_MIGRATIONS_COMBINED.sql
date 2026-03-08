-- ============================================
-- AUTO-CURE DATABASE MIGRATIONS
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- ============================================
-- MIGRATION 1: Fix Auth Trigger
-- ============================================
-- Fix: Attach trigger to auth.users for auto-creating profiles
-- This ensures new signups automatically get a profile row

-- Create the function first
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists to avoid errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verify the trigger was created
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Auto-creates a profile row when a new user signs up';

-- ============================================
-- MIGRATION 2: Add Payment Columns
-- ============================================
-- Add payment tracking columns to orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS payment_intent_id text,
  ADD COLUMN IF NOT EXISTS payment_provider text;

-- Add constraint for valid payment statuses
DO $$
BEGIN
  ALTER TABLE public.orders
    ADD CONSTRAINT valid_payment_status 
    CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'failed'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create index for payment lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent 
  ON public.orders(payment_intent_id) 
  WHERE payment_intent_id IS NOT NULL;

COMMENT ON COLUMN public.orders.payment_status IS 'Payment status: unpaid, paid, refunded, or failed';
COMMENT ON COLUMN public.orders.payment_intent_id IS 'Stripe PaymentIntent ID for tracking';
COMMENT ON COLUMN public.orders.payment_provider IS 'Payment provider used (stripe, razorpay, etc.)';

-- ============================================
-- MIGRATION 3: Fix RLS Policies
-- ============================================
-- Fix RLS Policy Gaps

-- 1. Fix contact_messages - change to PERMISSIVE and allow anonymous inserts
ALTER TABLE public.contact_messages FORCE ROW LEVEL SECURITY;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can update messages" ON public.contact_messages;

-- Create PERMISSIVE policies
CREATE POLICY "Anyone can insert contact messages"
ON public.contact_messages FOR INSERT
TO PUBLIC
WITH CHECK (true);

CREATE POLICY "Admins can view all messages"
ON public.contact_messages FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update messages"
ON public.contact_messages FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Fix products table - ensure admin policies work correctly
-- Drop and recreate to ensure PERMISSIVE
DROP POLICY IF EXISTS "Products viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

-- Everyone can view products
CREATE POLICY "Products viewable by everyone"
ON public.products FOR SELECT
TO PUBLIC
USING (true);

-- Admins can do everything
CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Add admin policy for profiles (user management)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Ensure orders policies are correct
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

CREATE POLICY "Users can view own orders"
ON public.orders FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all orders"
ON public.orders FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Ensure order_items policies are correct
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;

CREATE POLICY "Users can view own order items"
ON public.order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create order items"
ON public.order_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all order items"
ON public.order_items FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- MIGRATION COMPLETE!
-- ============================================
SELECT 'All migrations completed successfully!' as status;
