-- Tighten RLS on public.subscribers

-- 1) INSERT: only allow inserting own row
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT
TO authenticated
WITH CHECK ((user_id = auth.uid()) OR (email = auth.email()));

-- 2) UPDATE: only allow updating own row
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE
TO authenticated
USING ((user_id = auth.uid()) OR (email = auth.email()))
WITH CHECK ((user_id = auth.uid()) OR (email = auth.email()));