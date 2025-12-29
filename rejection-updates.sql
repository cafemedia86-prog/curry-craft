-- REJECTION REASON & AUTO-REFUND UPDATES

-- 1. Add rejection_reason column
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 2. Create reject_order function
CREATE OR REPLACE FUNCTION public.reject_order(order_id_input UUID, reason_input TEXT)
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

    IF v_current_status = 'Rejected' THEN
        RAISE EXCEPTION 'Order already rejected';
    END IF;

    IF v_current_status = 'Refunded' THEN
        RAISE EXCEPTION 'Order already refunded';
    END IF;

    -- Update Order Status and Reason
    UPDATE public.orders
    SET status = 'Rejected',
        rejection_reason = reason_input
    WHERE id = order_id_input;

    -- Insert Refund Transaction (Trigger will update balance)
    -- We assume the wallet_transactions table and trigger from the previous step exist.
    INSERT INTO public.wallet_transactions (user_id, amount, type, description)
    VALUES (v_user_id, v_order_total, 'refund', 'Refund for Order #' || substr(order_id_input::text, 1, 8) || ': ' || reason_input);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant execute permission
GRANT EXECUTE ON FUNCTION public.reject_order(UUID, TEXT) TO authenticated;
