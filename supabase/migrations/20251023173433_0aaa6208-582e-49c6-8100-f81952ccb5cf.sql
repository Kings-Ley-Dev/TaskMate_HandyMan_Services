-- Add approved status to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false NOT NULL;

-- Add approved_at timestamp
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_approved ON public.profiles(approved);

-- Update existing users to be approved (grandfather them in)
UPDATE public.profiles SET approved = true WHERE approved = false;