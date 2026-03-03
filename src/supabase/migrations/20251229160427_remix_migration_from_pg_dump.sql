CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user',
    'moderator',
    'support'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );
  
  -- Insert default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: contact_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    ip_address text,
    status text DEFAULT 'new'::text,
    CONSTRAINT contact_submissions_status_check CHECK ((status = ANY (ARRAY['new'::text, 'read'::text, 'responded'::text, 'archived'::text])))
);


--
-- Name: datacenter_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.datacenter_locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    region text NOT NULL,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    is_primary_hub boolean DEFAULT false,
    status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    amount numeric NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    invoice_number text NOT NULL,
    issued_at timestamp with time zone DEFAULT now() NOT NULL,
    due_at timestamp with time zone NOT NULL,
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT invoices_amount_check CHECK ((amount >= (0)::numeric)),
    CONSTRAINT invoices_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'paid'::text, 'overdue'::text, 'cancelled'::text])))
);

ALTER TABLE ONLY public.invoices REPLICA IDENTITY FULL;


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    notification_email_tickets boolean DEFAULT true,
    notification_email_invoices boolean DEFAULT true,
    notification_push_enabled boolean DEFAULT true
);


--
-- Name: servers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.servers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    datacenter_id uuid,
    cpu text NOT NULL,
    ram text NOT NULL,
    storage text NOT NULL,
    bandwidth text NOT NULL,
    price_monthly numeric(10,2) NOT NULL,
    status text DEFAULT 'available'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_tickets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    subject text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT support_tickets_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text]))),
    CONSTRAINT support_tickets_status_check CHECK ((status = ANY (ARRAY['open'::text, 'in_progress'::text, 'resolved'::text, 'closed'::text])))
);

ALTER TABLE ONLY public.support_tickets REPLICA IDENTITY FULL;


--
-- Name: ticket_replies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_replies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_id uuid NOT NULL,
    user_id uuid NOT NULL,
    message text NOT NULL,
    is_staff boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    attachment_url text,
    attachment_name text
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_servers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_servers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    server_id uuid NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    purchased_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_servers_status_check CHECK ((status = ANY (ARRAY['active'::text, 'suspended'::text, 'expired'::text, 'cancelled'::text])))
);


--
-- Name: contact_submissions contact_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_submissions
    ADD CONSTRAINT contact_submissions_pkey PRIMARY KEY (id);


--
-- Name: datacenter_locations datacenter_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.datacenter_locations
    ADD CONSTRAINT datacenter_locations_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: servers servers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.servers
    ADD CONSTRAINT servers_pkey PRIMARY KEY (id);


--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- Name: ticket_replies ticket_replies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_replies
    ADD CONSTRAINT ticket_replies_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: user_servers user_servers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_servers
    ADD CONSTRAINT user_servers_pkey PRIMARY KEY (id);


--
-- Name: idx_contact_submissions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_submissions_status ON public.contact_submissions USING btree (status);


--
-- Name: idx_contact_submissions_submitted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_submissions_submitted_at ON public.contact_submissions USING btree (submitted_at DESC);


--
-- Name: idx_invoices_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_status ON public.invoices USING btree (status);


--
-- Name: idx_invoices_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_user_id ON public.invoices USING btree (user_id);


--
-- Name: idx_profiles_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_email ON public.profiles USING btree (email);


--
-- Name: idx_support_tickets_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_tickets_status ON public.support_tickets USING btree (status);


--
-- Name: idx_support_tickets_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_tickets_user_id ON public.support_tickets USING btree (user_id);


--
-- Name: idx_user_roles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);


--
-- Name: idx_user_servers_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_servers_status ON public.user_servers USING btree (status);


--
-- Name: idx_user_servers_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_servers_user_id ON public.user_servers USING btree (user_id);


--
-- Name: invoices update_invoices_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: support_tickets update_support_tickets_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_servers update_user_servers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_servers_updated_at BEFORE UPDATE ON public.user_servers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: invoices invoices_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: servers servers_datacenter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.servers
    ADD CONSTRAINT servers_datacenter_id_fkey FOREIGN KEY (datacenter_id) REFERENCES public.datacenter_locations(id) ON DELETE CASCADE;


--
-- Name: support_tickets support_tickets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: ticket_replies ticket_replies_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_replies
    ADD CONSTRAINT ticket_replies_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_servers user_servers_server_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_servers
    ADD CONSTRAINT user_servers_server_id_fkey FOREIGN KEY (server_id) REFERENCES public.servers(id) ON DELETE RESTRICT;


--
-- Name: user_servers user_servers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_servers
    ADD CONSTRAINT user_servers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: datacenter_locations Admins can delete datacenter locations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete datacenter locations" ON public.datacenter_locations FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: servers Admins can delete servers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete servers" ON public.servers FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: contact_submissions Admins can delete submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete submissions" ON public.contact_submissions FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: datacenter_locations Admins can insert datacenter locations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert datacenter locations" ON public.datacenter_locations FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: servers Admins can insert servers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert servers" ON public.servers FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: invoices Admins can manage all invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all invoices" ON public.invoices USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can manage all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_servers Admins can manage all servers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all servers" ON public.user_servers USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: support_tickets Admins can manage all tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all tickets" ON public.support_tickets USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: datacenter_locations Admins can update datacenter locations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update datacenter locations" ON public.datacenter_locations FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: servers Admins can update servers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update servers" ON public.servers FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: contact_submissions Admins can update submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update submissions" ON public.contact_submissions FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: invoices Admins can view all invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all invoices" ON public.invoices FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Admins can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_servers Admins can view all servers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all servers" ON public.user_servers FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: contact_submissions Admins can view all submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all submissions" ON public.contact_submissions FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: support_tickets Admins can view all tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all tickets" ON public.support_tickets FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: contact_submissions Anyone can submit contact forms; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can submit contact forms" ON public.contact_submissions FOR INSERT WITH CHECK (true);


--
-- Name: datacenter_locations Anyone can view datacenter locations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view datacenter locations" ON public.datacenter_locations FOR SELECT USING (true);


--
-- Name: servers Anyone can view servers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view servers" ON public.servers FOR SELECT USING (true);


--
-- Name: ticket_replies Staff can reply to any ticket; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can reply to any ticket" ON public.ticket_replies FOR INSERT WITH CHECK (((auth.uid() = user_id) AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'support'::public.app_role) OR public.has_role(auth.uid(), 'moderator'::public.app_role))));


--
-- Name: ticket_replies Staff can view all replies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view all replies" ON public.ticket_replies FOR SELECT USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'support'::public.app_role) OR public.has_role(auth.uid(), 'moderator'::public.app_role)));


--
-- Name: profiles Users can create their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: support_tickets Users can create tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create tickets" ON public.support_tickets FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: invoices Users can insert their own invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own invoices" ON public.invoices FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_servers Users can insert their own servers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own servers" ON public.user_servers FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: ticket_replies Users can reply to their own tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can reply to their own tickets" ON public.ticket_replies FOR INSERT WITH CHECK (((auth.uid() = user_id) AND (EXISTS ( SELECT 1
   FROM public.support_tickets
  WHERE ((support_tickets.id = ticket_replies.ticket_id) AND (support_tickets.user_id = auth.uid()))))));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: ticket_replies Users can view replies on their tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view replies on their tickets" ON public.ticket_replies FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.support_tickets
  WHERE ((support_tickets.id = ticket_replies.ticket_id) AND (support_tickets.user_id = auth.uid())))));


--
-- Name: invoices Users can view their own invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own invoices" ON public.invoices FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_servers Users can view their own servers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own servers" ON public.user_servers FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: support_tickets Users can view their own tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own tickets" ON public.support_tickets FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: contact_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: datacenter_locations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.datacenter_locations ENABLE ROW LEVEL SECURITY;

--
-- Name: invoices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: servers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;

--
-- Name: support_tickets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

--
-- Name: ticket_replies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_servers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_servers ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;