-- Fix database functions with proper search_path configuration
-- Update find_similar_questions function
CREATE OR REPLACE FUNCTION public.find_similar_questions(search_title text, search_text text, similarity_threshold double precision DEFAULT 0.8)
 RETURNS TABLE(id uuid, title text, question_text text, similarity_score double precision)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    qb.id,
    qb.title,
    qb.question_text,
    GREATEST(
      similarity(qb.title, search_title),
      similarity(qb.question_text, search_text)
    ) as similarity_score
  FROM public.question_bank qb
  WHERE 
    similarity(qb.title, search_title) > similarity_threshold
    OR similarity(qb.question_text, search_text) > similarity_threshold
  ORDER BY similarity_score DESC;
END;
$function$;

-- Update is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = user_uuid
  );
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = now();
  RETURN NEW;
END;
$function$;

-- Create function to validate password strength
CREATE OR REPLACE FUNCTION public.validate_password_strength(password_input text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
DECLARE
  result jsonb := '{"valid": true, "errors": []}'::jsonb;
  errors text[] := ARRAY[]::text[];
BEGIN
  -- Check minimum length
  IF length(password_input) < 12 THEN
    errors := array_append(errors, 'Password must be at least 12 characters long');
  END IF;
  
  -- Check for uppercase letter
  IF password_input !~ '[A-Z]' THEN
    errors := array_append(errors, 'Password must contain at least one uppercase letter');
  END IF;
  
  -- Check for lowercase letter
  IF password_input !~ '[a-z]' THEN
    errors := array_append(errors, 'Password must contain at least one lowercase letter');
  END IF;
  
  -- Check for number
  IF password_input !~ '[0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one number');
  END IF;
  
  -- Check for special character
  IF password_input !~ '[^A-Za-z0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one special character');
  END IF;
  
  -- Update result
  IF array_length(errors, 1) > 0 THEN
    result := jsonb_build_object('valid', false, 'errors', to_jsonb(errors));
  END IF;
  
  RETURN result;
END;
$function$;