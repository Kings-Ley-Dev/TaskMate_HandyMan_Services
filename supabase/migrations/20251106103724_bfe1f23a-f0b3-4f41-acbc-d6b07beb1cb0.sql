-- Create job_interests table to track providers interested in jobs
CREATE TABLE public.job_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, provider_id)
);

-- Enable RLS
ALTER TABLE public.job_interests ENABLE ROW LEVEL SECURITY;

-- Providers can insert their own interests
CREATE POLICY "Providers can express interest in jobs"
ON public.job_interests
FOR INSERT
WITH CHECK (auth.uid() = provider_id AND has_role(auth.uid(), 'provider'::app_role));

-- Providers can view their own interests
CREATE POLICY "Providers can view their interests"
ON public.job_interests
FOR SELECT
USING (auth.uid() = provider_id);

-- Customers can view interests for their jobs
CREATE POLICY "Customers can view interests for their jobs"
ON public.job_interests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE jobs.id = job_interests.job_id
    AND jobs.customer_id = auth.uid()
  )
);

-- Admins can view all interests
CREATE POLICY "Admins can view all interests"
ON public.job_interests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for performance
CREATE INDEX idx_job_interests_job_id ON public.job_interests(job_id);
CREATE INDEX idx_job_interests_provider_id ON public.job_interests(provider_id);