-- Allow customers to delete their own jobs
CREATE POLICY "Customers can delete their own jobs"
ON public.jobs
FOR DELETE
USING (auth.uid() = customer_id);