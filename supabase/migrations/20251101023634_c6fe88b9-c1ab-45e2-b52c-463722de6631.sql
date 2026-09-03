-- Update the trigger function to save provider-specific data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles with provider data if available
  INSERT INTO public.profiles (
    id, 
    full_name, 
    email,
    service_type,
    hourly_rate,
    skills,
    location,
    bio
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'service_type',
    CASE 
      WHEN NEW.raw_user_meta_data->>'hourly_rate' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'hourly_rate')::numeric 
      ELSE NULL 
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->'skills' IS NOT NULL 
      THEN ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'skills'))
      ELSE NULL 
    END,
    NEW.raw_user_meta_data->>'location',
    NEW.raw_user_meta_data->>'bio'
  );
  
  -- Insert user role from metadata
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'customer'::app_role)
  );
  
  RETURN NEW;
END;
$$;