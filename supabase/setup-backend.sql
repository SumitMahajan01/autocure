-- ============================================
-- BACKEND SETUP INSTRUCTIONS
-- ============================================
-- Run these SQL commands in Supabase SQL Editor in order:
--
-- 1. First run: 008_complete_backend.sql (creates all tables)
-- 2. Then run: 006_add_sample_products.sql (adds products)
-- 3. Finally run this file to configure edge functions
-- ============================================

-- ============================================
-- EDGE FUNCTION SECRETS SETUP
-- ============================================
-- These need to be set via Supabase CLI or Dashboard:
--
-- supabase secrets set STRIPE_SECRET_KEY=sk_test_...
-- supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
-- supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...

-- ============================================
-- VERIFY SETUP
-- ============================================

-- Check tables exist
SELECT 
  'profiles' as table_name, 
  COUNT(*) as row_count 
FROM public.profiles
UNION ALL
SELECT 
  'products' as table_name, 
  COUNT(*) as row_count 
FROM public.products
UNION ALL
SELECT 
  'orders' as table_name, 
  COUNT(*) as row_count 
FROM public.orders
UNION ALL
SELECT 
  'order_items' as table_name, 
  COUNT(*) as row_count 
FROM public.order_items
UNION ALL
SELECT 
  'reviews' as table_name, 
  COUNT(*) as row_count 
FROM public.reviews
UNION ALL
SELECT 
  'wishlist' as table_name, 
  COUNT(*) as row_count 
FROM public.wishlist
UNION ALL
SELECT 
  'inventory_logs' as table_name, 
  COUNT(*) as row_count 
FROM public.inventory_logs;

-- ============================================
-- TEST FUNCTIONS
-- ============================================

-- Test order stats function
SELECT * FROM public.get_order_stats();

-- Test product stats function
SELECT * FROM public.get_product_stats();

-- ============================================
-- DEPLOY EDGE FUNCTIONS
-- ============================================
-- Run these commands in your terminal:
--
-- supabase functions deploy create-payment-session
-- supabase functions deploy stripe-webhook
-- supabase functions deploy admin-api
--
-- ============================================

SELECT 'Backend setup verification complete!' as status;
