-- WALLET & REFUND SYSTEM UPDATE

-- 1. Create Wallet Transactions Table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'refund', 'order_payment')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Users can view their own transactions
DROP POLICY IF EXISTS "Users can view their own wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Users can view their own wallet transactions"
ON public.wallet_transactions FOR SELECT
USING (auth.uid() = user_id);

-- Admins/Managers can view all
DROP POLICY IF EXISTS "Staff can view all wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Staff can view all wallet transactions"
ON public.wallet_transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND (profiles.role IN ('ADMIN', 'MANAGER'))
  )
);

-- Allow users/server to insert (for payments/top-ups)
DROP POLICY IF EXISTS "Users and triggers can insert transactions" ON public.wallet_transactions;
CREATE POLICY "Users and triggers can insert transactions"
ON public.wallet_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND (profiles.role IN ('ADMIN', 'MANAGER'))
));


-- 4. Trigger to Auto-Update Wallet Balance
CREATE OR REPLACE FUNCTION public.update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET wallet_balance = wallet_balance + NEW.amount
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_wallet_transaction_created ON public.wallet_transactions;
CREATE TRIGGER on_wallet_transaction_created
AFTER INSERT ON public.wallet_transactions
FOR EACH ROW EXECUTE PROCEDURE public.update_wallet_balance();


-- 5. Secure Process Refund Function
CREATE OR REPLACE FUNCTION public.process_refund(order_id_input UUID)
RETURNS VOID AS $$
DECLARE
    v_order_total NUMERIC;
    v_user_id UUID;
    v_current_status TEXT;
BEGIN
    -- Get order details
    SELECT total, user_id, status INTO v_order_total, v_user_id, v_current_status
    FROM public.orders
    WHERE id = order_id_input;

    -- Validations
    IF v_order_total IS NULL THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    IF v_current_status = 'Refunded' THEN
        RAISE EXCEPTION 'Order already refunded';
    END IF;

    -- Update Order Status
    UPDATE public.orders
    SET status = 'Refunded'
    WHERE id = order_id_input;

    -- Insert Refund Transaction (Trigger will update balance)
    INSERT INTO public.wallet_transactions (user_id, amount, type, description)
    VALUES (v_user_id, v_order_total, 'refund', 'Refund for Order #' || substr(order_id_input::text, 1, 8));

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant execute permission
GRANT EXECUTE ON FUNCTION public.process_refund(UUID) TO authenticated;
