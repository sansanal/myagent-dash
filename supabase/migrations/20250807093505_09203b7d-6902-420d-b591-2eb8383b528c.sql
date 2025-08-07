-- Actualizar la función para confirmar email en la tabla auth.users de Supabase
CREATE OR REPLACE FUNCTION public.confirm_user_email(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Actualizar la tabla auth.users para marcar el email como confirmado
  UPDATE auth.users 
  SET email_confirmed_at = now()
  WHERE id = user_id_param AND email_confirmed_at IS NULL;
  
  -- También actualizar nuestra tabla de profiles
  UPDATE public.profiles 
  SET email_confirmed = 1 
  WHERE user_id = user_id_param;
END;
$$;