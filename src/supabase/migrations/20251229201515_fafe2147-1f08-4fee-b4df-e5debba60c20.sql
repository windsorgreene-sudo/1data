-- Create audit_logs table to track sensitive actions
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  actor_id uuid NOT NULL,
  actor_email text,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs (read-only)
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- No direct inserts/updates/deletes from client - only via triggers
-- We use SECURITY DEFINER functions to insert logs

-- Function to insert audit log (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.insert_audit_log(
  p_action_type text,
  p_table_name text,
  p_record_id uuid,
  p_actor_id uuid,
  p_actor_email text,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (action_type, table_name, record_id, actor_id, actor_email, old_values, new_values)
  VALUES (p_action_type, p_table_name, p_record_id, p_actor_id, p_actor_email, p_old_values, p_new_values);
END;
$$;

-- Trigger function for user_roles changes
CREATE OR REPLACE FUNCTION public.audit_user_roles_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_email text;
BEGIN
  -- Get actor email from profiles
  SELECT email INTO v_actor_email FROM public.profiles WHERE id = auth.uid();
  
  IF TG_OP = 'INSERT' THEN
    PERFORM public.insert_audit_log(
      'ROLE_GRANTED',
      'user_roles',
      NEW.id,
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
      v_actor_email,
      NULL,
      jsonb_build_object('user_id', NEW.user_id, 'role', NEW.role)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.insert_audit_log(
      'ROLE_REVOKED',
      'user_roles',
      OLD.id,
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
      v_actor_email,
      jsonb_build_object('user_id', OLD.user_id, 'role', OLD.role),
      NULL
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.insert_audit_log(
      'ROLE_CHANGED',
      'user_roles',
      NEW.id,
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
      v_actor_email,
      jsonb_build_object('user_id', OLD.user_id, 'role', OLD.role),
      jsonb_build_object('user_id', NEW.user_id, 'role', NEW.role)
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger function for invoice changes
CREATE OR REPLACE FUNCTION public.audit_invoice_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_email text;
BEGIN
  SELECT email INTO v_actor_email FROM public.profiles WHERE id = auth.uid();
  
  IF TG_OP = 'UPDATE' THEN
    PERFORM public.insert_audit_log(
      'INVOICE_UPDATED',
      'invoices',
      NEW.id,
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
      v_actor_email,
      jsonb_build_object('status', OLD.status, 'amount', OLD.amount, 'paid_at', OLD.paid_at),
      jsonb_build_object('status', NEW.status, 'amount', NEW.amount, 'paid_at', NEW.paid_at)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.insert_audit_log(
      'INVOICE_DELETED',
      'invoices',
      OLD.id,
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
      v_actor_email,
      jsonb_build_object('invoice_number', OLD.invoice_number, 'amount', OLD.amount, 'status', OLD.status),
      NULL
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger function for ticket status changes
CREATE OR REPLACE FUNCTION public.audit_ticket_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_email text;
BEGIN
  SELECT email INTO v_actor_email FROM public.profiles WHERE id = auth.uid();
  
  IF TG_OP = 'UPDATE' AND (OLD.status IS DISTINCT FROM NEW.status OR OLD.priority IS DISTINCT FROM NEW.priority) THEN
    PERFORM public.insert_audit_log(
      'TICKET_UPDATED',
      'support_tickets',
      NEW.id,
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
      v_actor_email,
      jsonb_build_object('status', OLD.status, 'priority', OLD.priority),
      jsonb_build_object('status', NEW.status, 'priority', NEW.priority)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER audit_user_roles_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.audit_user_roles_changes();

CREATE TRIGGER audit_invoice_trigger
AFTER UPDATE OR DELETE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.audit_invoice_changes();

CREATE TRIGGER audit_ticket_trigger
AFTER UPDATE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.audit_ticket_changes();

-- Add index for faster queries
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX idx_audit_logs_actor_id ON public.audit_logs(actor_id);