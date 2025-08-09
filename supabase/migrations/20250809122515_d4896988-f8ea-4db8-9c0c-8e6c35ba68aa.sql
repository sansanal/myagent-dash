-- Add payment_method_added field to existing subscribers table
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS payment_method_added BOOLEAN NOT NULL DEFAULT false;