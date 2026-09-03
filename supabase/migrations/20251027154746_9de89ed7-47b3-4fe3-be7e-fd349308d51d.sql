-- Add provider-specific fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN service_type TEXT,
ADD COLUMN hourly_rate NUMERIC,
ADD COLUMN skills TEXT[],
ADD COLUMN location TEXT,
ADD COLUMN rating NUMERIC DEFAULT 0,
ADD COLUMN reviews_count INTEGER DEFAULT 0,
ADD COLUMN avatar_url TEXT,
ADD COLUMN bio TEXT;

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  budget NUMERIC NOT NULL,
  location TEXT NOT NULL,
  deadline DATE NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on jobs table
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies for jobs
CREATE POLICY "Customers can view their own jobs"
ON public.jobs
FOR SELECT
USING (auth.uid() = customer_id);

CREATE POLICY "Providers can view jobs"
ON public.jobs
FOR SELECT
USING (has_role(auth.uid(), 'provider'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Customers can create jobs"
ON public.jobs
FOR INSERT
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their own jobs"
ON public.jobs
FOR UPDATE
USING (auth.uid() = customer_id);

CREATE POLICY "Admins can manage all jobs"
ON public.jobs
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at on jobs
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for job attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-attachments', 'job-attachments', false);

-- Storage policies for job attachments
CREATE POLICY "Users can upload job attachments"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'job-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own attachments"
ON storage.objects
FOR SELECT
USING (bucket_id = 'job-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Providers can view job attachments"
ON storage.objects
FOR SELECT
USING (bucket_id = 'job-attachments' AND has_role(auth.uid(), 'provider'::app_role));