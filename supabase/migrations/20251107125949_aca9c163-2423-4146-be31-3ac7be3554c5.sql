-- Fix search_path security issue for SECURITY DEFINER functions
-- This prevents privilege escalation attacks by setting immutable search_path

CREATE OR REPLACE FUNCTION public.update_profile_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.create_job_timeline_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.create_message_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;