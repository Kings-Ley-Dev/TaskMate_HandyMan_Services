-- Add phone number to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create job_timeline table
CREATE TABLE IF NOT EXISTS public.job_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create messages table for in-app messaging
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Users can view reviews for their jobs" ON public.reviews
  FOR SELECT USING (
    auth.uid() = reviewer_id 
    OR auth.uid() = reviewee_id 
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Users can create reviews for completed jobs" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE id = job_id 
      AND status = 'completed'
      AND (customer_id = auth.uid() OR provider_id = auth.uid())
    )
  );

CREATE POLICY "Admins can manage all reviews" ON public.reviews
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for job_timeline
CREATE POLICY "Users can view timeline for their jobs" ON public.job_timeline
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE id = job_id 
      AND (customer_id = auth.uid() OR provider_id = auth.uid())
    )
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Users can create timeline events for their jobs" ON public.job_timeline
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE id = job_id 
      AND (customer_id = auth.uid() OR provider_id = auth.uid())
    )
  );

CREATE POLICY "Admins can manage all timeline events" ON public.job_timeline
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for messages
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (
    auth.uid() = sender_id 
    OR auth.uid() = receiver_id 
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages" ON public.messages
  FOR UPDATE USING (auth.uid() = receiver_id);

CREATE POLICY "Admins can manage all messages" ON public.messages
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for reviews to update profile rating
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    rating = (
      SELECT AVG(rating)::numeric(3,2)
      FROM public.reviews
      WHERE reviewee_id = NEW.reviewee_id
    ),
    reviews_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE reviewee_id = NEW.reviewee_id
    )
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_rating();

-- Create trigger for job timeline events
CREATE OR REPLACE FUNCTION create_job_timeline_event()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.job_timeline (job_id, event_type, description, created_by)
    VALUES (NEW.id, 'created', 'Job created', NEW.customer_id);
  ELSIF (TG_OP = 'UPDATE' AND OLD.status != NEW.status) THEN
    INSERT INTO public.job_timeline (job_id, event_type, description, created_by)
    VALUES (NEW.id, 'status_changed', 'Status changed to ' || NEW.status, auth.uid());
  ELSIF (TG_OP = 'UPDATE' AND OLD.provider_id IS NULL AND NEW.provider_id IS NOT NULL) THEN
    INSERT INTO public.job_timeline (job_id, event_type, description, created_by)
    VALUES (NEW.id, 'provider_assigned', 'Provider assigned to job', NEW.customer_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER job_timeline_trigger
  AFTER INSERT OR UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION create_job_timeline_event();

-- Create trigger for message notifications
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
BEGIN
  SELECT full_name INTO sender_name
  FROM public.profiles
  WHERE id = NEW.sender_id;
  
  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (
    NEW.receiver_id,
    'New Message',
    sender_name || ' sent you a message',
    'message',
    '/dashboard/messages?recipient=' || sender_name || '&job_id=' || NEW.job_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER message_notification_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;