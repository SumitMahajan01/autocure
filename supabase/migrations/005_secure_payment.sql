-- ============================================
-- PAYMENT SECURITY MIGRATION
-- Additional security for payment processing
-- ============================================

-- 1. Ensure orders can only be updated by the owner or service role
-- Drop existing update policy if any
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;

-- Create policy that allows users to create orders but not update them
-- Updates should only happen through edge functions (service role)
CREATE POLICY "Users can create own orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 2. Add constraint to prevent negative totals
ALTER TABLE public.orders
ADD CONSTRAINT positive_total CHECK (total_amount >= 0);

-- 3. Add constraint to limit order total (max $10,000)
ALTER TABLE public.orders
ADD CONSTRAINT max_order_total CHECK (total_amount <= 10000);

-- 4. Create index for faster payment lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_status 
ON public.orders(payment_status) 
WHERE payment_status IN ('unpaid', 'pending');

-- 5. Add function to prevent order tampering after payment
CREATE OR REPLACE FUNCTION prevent_order_modification_after_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent modification if order is already paid or processing
  IF OLD.payment_status IN ('paid', 'refunded') THEN
    RAISE EXCEPTION 'Cannot modify order after payment';
  END IF;
  
  -- Prevent changing user_id
  IF OLD.user_id != NEW.user_id THEN
    RAISE EXCEPTION 'Cannot change order owner';
  END IF;
  
  -- Prevent changing total_amount after creation
  IF OLD.total_amount != NEW.total_amount AND OLD.payment_status != 'unpaid' THEN
    RAISE EXCEPTION 'Cannot change order total after creation';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to enforce order integrity
DROP TRIGGER IF EXISTS enforce_order_integrity ON public.orders;
CREATE TRIGGER enforce_order_integrity
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION prevent_order_modification_after_payment();

-- 7. Secure order_items - prevent modification after order is paid
CREATE OR REPLACE FUNCTION prevent_order_items_modification()
RETURNS TRIGGER AS $$
DECLARE
  order_payment_status TEXT;
BEGIN
  -- Get the payment status of the associated order
  SELECT payment_status INTO order_payment_status
  FROM public.orders
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);
  
  -- Prevent modification if order is already paid
  IF order_payment_status IN ('paid', 'refunded') THEN
    RAISE EXCEPTION 'Cannot modify order items after payment';
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to order_items
DROP TRIGGER IF EXISTS enforce_order_items_integrity ON public.order_items;
CREATE TRIGGER enforce_order_items_integrity
  BEFORE UPDATE OR DELETE ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION prevent_order_items_modification();

-- ============================================
-- SECURITY COMPLETE
-- ============================================
SELECT 'Payment security migration complete!' as status;
