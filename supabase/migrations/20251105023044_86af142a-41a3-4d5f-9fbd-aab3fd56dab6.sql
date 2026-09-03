-- Create user-avatars storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-avatars', 'user-avatars', true);

-- Storage RLS Policies for avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-avatars');

-- Add missing RLS policy for providers to update their assigned jobs
CREATE POLICY "Providers can update their assigned jobs"
ON jobs FOR UPDATE
USING (auth.uid() = provider_id)
WITH CHECK (auth.uid() = provider_id);

-- Fix handle_new_user function search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
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