-- Ensure audit_logs is protected and immutable from client-side DML
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Explicitly deny direct modifications (restrictive so it cannot be overridden by future permissive policies)
DROP POLICY IF EXISTS "Deny direct audit log modifications" ON public.audit_logs;
DROP POLICY IF EXISTS "Deny audit log updates" ON public.audit_logs;
DROP POLICY IF EXISTS "Deny audit log deletions" ON public.audit_logs;

CREATE POLICY "Deny direct audit log modifications"
ON public.audit_logs
AS RESTRICTIVE
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Deny audit log updates"
ON public.audit_logs
AS RESTRICTIVE
FOR UPDATE
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny audit log deletions"
ON public.audit_logs
AS RESTRICTIVE
FOR DELETE
USING (false);
