-- Ejecutar la función para confirmar el email del usuario demo@vlptech.es
DO $$
DECLARE
    user_uuid uuid;
BEGIN
    -- Obtener el UUID del usuario con email demo@vlptech.es
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'demo@vlptech.es';
    
    -- Si el usuario existe, confirmar su email
    IF user_uuid IS NOT NULL THEN
        PERFORM public.confirm_user_email(user_uuid);
        RAISE NOTICE 'Email confirmado para usuario: %', user_uuid;
    ELSE
        RAISE NOTICE 'Usuario no encontrado con email: demo@vlptech.es';
    END IF;
END $$;