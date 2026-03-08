-- Add payment tracking columns to orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS payment_intent_id text,
  ADD COLUMN IF NOT EXISTS payment_provider text;

-- Add constraint for valid payment statuses
ALTER TABLE public.orders
  ADD CONSTRAINT valid_payment_status 
  CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'failed'));

-- Create index for payment lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent 
  ON public.orders(payment_intent_id) 
  WHERE payment_intent_id IS NOT NULL;

COMMENT ON COLUMN public.orders.payment_status IS 'Payment status: unpaid, paid, refunded, or failed';
COMMENT ON COLUMN public.orders.payment_intent_id IS 'Stripe PaymentIntent ID for tracking';
COMMENT ON COLUMN public.orders.payment_provider IS 'Payment provider used (stripe, razorpay, etc.)';
