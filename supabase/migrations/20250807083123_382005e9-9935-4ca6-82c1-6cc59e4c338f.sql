-- Add email_confirmed flag to profiles table
ALTER TABLE public.profiles 
ADD COLUMN email_confirmed INTEGER DEFAULT 0 NOT NULL;

-- Update the handle_new_user function to set email_confirmed to 0 by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, email_confirmed)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 0);
  RETURN NEW;
END;
$$;

-- Create a function to confirm user email
CREATE OR REPLACE FUNCTION public.confirm_user_email(user_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path TO ''
AS $$
BEGIN
  UPDATE public.profiles 
  SET email_confirmed = 1 
  WHERE user_id = user_id_param;
END;
$$;

-- Update RLS policies to require email confirmation for access
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id AND email_confirmed = 1);

-- Create policy for confirming email (allows update even when not confirmed)
CREATE POLICY "Users can confirm their email" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id AND email_confirmed = 0)
WITH CHECK (auth.uid() = user_id);