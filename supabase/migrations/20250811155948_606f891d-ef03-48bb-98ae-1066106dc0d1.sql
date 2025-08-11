-- Secure RLS for subscribers table: restrict updates/inserts to own row
-- 1) Update INSERT policy to require own identity (user_id or email)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'subscribers' AND policyname = 'insert_subscription'
  ) THEN
    EXECUTE $$
      DROP POLICY "insert_subscription" ON public.subscribers;
    $$;
  END IF;
END $$;

CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT
TO authenticated
WITH CHECK ((user_id = auth.uid()) OR (email = auth.email()));

-- 2) Replace overly-permissive UPDATE policy with scoped version
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'subscribers' AND policyname = 'update_own_subscription'
  ) THEN
    EXECUTE $$
      DROP POLICY "update_own_subscription" ON public.subscribers;
    $$;
  END IF;
END $$;

CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE
TO authenticated
USING ((user_id = auth.uid()) OR (email = auth.email()))
WITH CHECK ((user_id = auth.uid()) OR (email = auth.email()));