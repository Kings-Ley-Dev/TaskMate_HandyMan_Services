-- Drop the foreign key constraint that references auth.users
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_customer_id_fkey;

-- Add a proper foreign key constraint that references profiles instead
ALTER TABLE public.jobs 
ADD CONSTRAINT jobs_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add a foreign key for provider_id as well
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_provider_id_fkey;

ALTER TABLE public.jobs 
ADD CONSTRAINT jobs_provider_id_fkey 
FOREIGN KEY (provider_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Add RLS policy to allow customers to view provider profiles
CREATE POLICY "Customers can view provider profiles" 
ON public.profiles 
FOR SELECT 
USING (service_type IS NOT NULL);