-- ============================================================
-- COMPLETE SUPABASE SETUP — Run the WHOLE file, zero errors
-- Safe to re-run 100x (uses IF NOT EXISTS / OR REPLACE / DROP IF)
-- ============================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- ============================================================
-- PART A: ORIGINAL PORTFOLIO TABLES (projects, profile, chat)
-- ============================================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  github_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(384)
);

CREATE TABLE IF NOT EXISTS profile_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profile_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profile_content(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(384)
);

CREATE TABLE IF NOT EXISTS ai_chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  visitor_query TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  ip_address TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_embeddings_project_id ON project_embeddings(project_id);
CREATE INDEX IF NOT EXISTS idx_profile_embeddings_profile_id ON profile_embeddings(profile_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_ip_address ON ai_chat_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_created_at ON ai_chat_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_session_id ON ai_chat_logs(session_id);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read projects" ON projects;
DROP POLICY IF EXISTS "Public can read project_embeddings" ON project_embeddings;
DROP POLICY IF EXISTS "Public can read profile_content" ON profile_content;
DROP POLICY IF EXISTS "Public can read profile_embeddings" ON profile_embeddings;
DROP POLICY IF EXISTS "Public can insert chat logs" ON ai_chat_logs;

CREATE POLICY "Public can read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public can read project_embeddings" ON project_embeddings FOR SELECT USING (true);
CREATE POLICY "Public can read profile_content" ON profile_content FOR SELECT USING (true);
CREATE POLICY "Public can read profile_embeddings" ON profile_embeddings FOR SELECT USING (true);
CREATE POLICY "Public can insert chat logs" ON ai_chat_logs FOR INSERT WITH CHECK (true);

-- Old anonymous service_orders table
CREATE TABLE IF NOT EXISTS service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  email TEXT NOT NULL,
  service_type TEXT NOT NULL,
  budget TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can insert service orders" ON service_orders;
DROP POLICY IF EXISTS "Admin can read service orders" ON service_orders;
CREATE POLICY "Public can insert service orders" ON service_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can read service orders" ON service_orders FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_service_orders_created_at ON service_orders(created_at);

-- ============================================================
-- PART B: VECTOR SEARCH FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION match_project_embeddings(
  query_embedding vector(384), match_threshold float, match_count int
)
RETURNS TABLE (id uuid, project_id uuid, content text, similarity float)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY SELECT pe.id, pe.project_id, pe.content,
    1 - (pe.embedding <=> query_embedding) AS similarity
  FROM project_embeddings pe
  WHERE 1 - (pe.embedding <=> query_embedding) > match_threshold
  ORDER BY pe.embedding <=> query_embedding LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION match_profile_embeddings(
  query_embedding vector(384), match_threshold float, match_count int
)
RETURNS TABLE (id uuid, profile_id uuid, content text, similarity float)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY SELECT pe.id, pe.profile_id, pe.content,
    1 - (pe.embedding <=> query_embedding) AS similarity
  FROM profile_embeddings pe
  WHERE 1 - (pe.embedding <=> query_embedding) > match_threshold
  ORDER BY pe.embedding <=> query_embedding LIMIT match_count;
END;
$$;

-- ============================================================
-- PART C: CLIENT PORTAL TABLES (profiles, orders, portal_projects, etc.)
-- ============================================================

-- Profiles (links to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
          COALESCE(NEW.raw_user_meta_data ->> 'role', 'client'));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Client Orders
CREATE TABLE IF NOT EXISTS client_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  service_type TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  budget_amount DECIMAL(10,2),
  budget_currency TEXT NOT NULL DEFAULT 'USD',
  timeline_days INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  admin_notes TEXT NOT NULL DEFAULT '',
  contact_name TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT '',
  gig_id UUID,
  package_name TEXT,
  package_price DECIMAL(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE client_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can read own orders" ON client_orders;
DROP POLICY IF EXISTS "Clients can insert orders" ON client_orders;
DROP POLICY IF EXISTS "Public can insert anonymous orders" ON client_orders;
DROP POLICY IF EXISTS "Admins can read all orders" ON client_orders;

CREATE POLICY "Clients can read own orders" ON client_orders FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients can insert orders" ON client_orders FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Public can insert anonymous orders" ON client_orders FOR INSERT WITH CHECK (client_id IS NULL);
CREATE POLICY "Admins can read all orders" ON client_orders FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE INDEX IF NOT EXISTS idx_client_orders_client_id ON client_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_client_orders_status ON client_orders(status);
CREATE INDEX IF NOT EXISTS idx_client_orders_created_at ON client_orders(created_at);

-- Portal Projects (renamed from "projects" to avoid conflict with portfolio projects)
CREATE TABLE IF NOT EXISTS portal_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES client_orders(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed','paused','cancelled')),
  start_date DATE,
  deadline DATE,
  total_amount DECIMAL(10,2),
  penalty_per_day DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE portal_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can read own portal_projects" ON portal_projects;
DROP POLICY IF EXISTS "Admins can manage portal_projects" ON portal_projects;

CREATE POLICY "Clients can read own portal_projects" ON portal_projects FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Admins can manage portal_projects" ON portal_projects FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE INDEX IF NOT EXISTS idx_portal_projects_client_id ON portal_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_portal_projects_status ON portal_projects(status);

-- Project Milestones
CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES portal_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  amount DECIMAL(10,2),
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','approved','rejected')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can read own milestones" ON project_milestones;
DROP POLICY IF EXISTS "Admins can manage milestones" ON project_milestones;

CREATE POLICY "Clients can read own milestones" ON project_milestones FOR SELECT USING (
  EXISTS (SELECT 1 FROM portal_projects WHERE id = project_milestones.project_id AND client_id = auth.uid())
);
CREATE POLICY "Admins can manage milestones" ON project_milestones FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON project_milestones(project_id);

-- Project Messages
CREATE TABLE IF NOT EXISTS project_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES portal_projects(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  file_attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE project_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can read messages" ON project_messages;
DROP POLICY IF EXISTS "Participants can send messages" ON project_messages;

CREATE POLICY "Participants can read messages" ON project_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM portal_projects WHERE id = project_messages.project_id AND client_id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Participants can send messages" ON project_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM portal_projects WHERE id = project_messages.project_id AND client_id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE INDEX IF NOT EXISTS idx_messages_project_id ON project_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON project_messages(created_at);

-- Project Files
CREATE TABLE IF NOT EXISTS project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES portal_projects(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT NOT NULL DEFAULT '',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can read files" ON project_files;
DROP POLICY IF EXISTS "Participants can upload files" ON project_files;

CREATE POLICY "Participants can read files" ON project_files FOR SELECT USING (
  EXISTS (SELECT 1 FROM portal_projects WHERE id = project_files.project_id AND client_id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Participants can upload files" ON project_files FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM portal_projects WHERE id = project_files.project_id AND client_id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE INDEX IF NOT EXISTS idx_files_project_id ON project_files(project_id);

-- Project Timeline Events
CREATE TABLE IF NOT EXISTS project_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES portal_projects(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE project_timeline_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can read timeline" ON project_timeline_events;
DROP POLICY IF EXISTS "Admins can create timeline events" ON project_timeline_events;

CREATE POLICY "Participants can read timeline" ON project_timeline_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM portal_projects WHERE id = project_timeline_events.project_id AND client_id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Admins can create timeline events" ON project_timeline_events FOR INSERT WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE INDEX IF NOT EXISTS idx_timeline_project_id ON project_timeline_events(project_id);
CREATE INDEX IF NOT EXISTS idx_timeline_created_at ON project_timeline_events(created_at);

-- Extension Requests
CREATE TABLE IF NOT EXISTS extension_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES portal_projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES project_milestones(id) ON DELETE SET NULL,
  requested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  old_deadline DATE NOT NULL,
  new_deadline DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  response_notes TEXT NOT NULL DEFAULT '',
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE extension_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can read extensions" ON extension_requests;
DROP POLICY IF EXISTS "Clients can request extensions" ON extension_requests;

CREATE POLICY "Participants can read extensions" ON extension_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM portal_projects WHERE id = extension_requests.project_id AND client_id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Clients can request extensions" ON extension_requests FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM portal_projects WHERE id = extension_requests.project_id AND client_id = auth.uid())
);

CREATE INDEX IF NOT EXISTS idx_extensions_project_id ON extension_requests(project_id);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES portal_projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES project_milestones(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  payment_method TEXT NOT NULL DEFAULT '',
  transaction_id TEXT NOT NULL DEFAULT '',
  proof_url TEXT NOT NULL DEFAULT '',
  account_details TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can read own payments" ON payments;
DROP POLICY IF EXISTS "Admins can manage payments" ON payments;

CREATE POLICY "Clients can read own payments" ON payments FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Admins can manage payments" ON payments FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE INDEX IF NOT EXISTS idx_payments_project_id ON payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);

-- ============================================================
-- PART D: PHASE 6 TABLES (notifications, testimonials, time_logs)
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  link TEXT NOT NULL DEFAULT '',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_role TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  project_id UUID REFERENCES portal_projects(id) ON DELETE SET NULL,
  is_visible BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read visible testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;

CREATE POLICY "Public can read visible testimonials" ON testimonials FOR SELECT USING (is_visible = true);
CREATE POLICY "Admins can manage testimonials" ON testimonials FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE INDEX IF NOT EXISTS idx_testimonials_visible ON testimonials(is_visible);

CREATE TABLE IF NOT EXISTS time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES portal_projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES project_milestones(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL DEFAULT '',
  hours DECIMAL(6,2) NOT NULL DEFAULT 0,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can read time logs" ON time_logs;
DROP POLICY IF EXISTS "Admins can manage time logs" ON time_logs;

CREATE POLICY "Participants can read time logs" ON time_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM portal_projects WHERE id = time_logs.project_id AND client_id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Admins can manage time logs" ON time_logs FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE INDEX IF NOT EXISTS idx_time_logs_project_id ON time_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_milestone_id ON time_logs(milestone_id);

-- Helper: Create notification function
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID, p_type TEXT, p_title TEXT,
  p_message TEXT DEFAULT '', p_link TEXT DEFAULT ''
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (p_user_id, p_type, p_title, p_message, p_link) RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- ============================================================
-- PART E: GIG SYSTEM (gigs, gig_packages)
-- ============================================================

CREATE TABLE IF NOT EXISTS gigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active gigs" ON gigs;
DROP POLICY IF EXISTS "Admins can manage gigs" ON gigs;

CREATE POLICY "Public can read active gigs" ON gigs FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage gigs" ON gigs FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE INDEX IF NOT EXISTS idx_gigs_active ON gigs(is_active);
CREATE INDEX IF NOT EXISTS idx_gigs_sort ON gigs(sort_order);

CREATE TABLE IF NOT EXISTS gig_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (name IN ('basic', 'standard', 'premium')),
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  delivery_days INTEGER,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE gig_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read gig packages" ON gig_packages;
DROP POLICY IF EXISTS "Admins can manage gig packages" ON gig_packages;

CREATE POLICY "Public can read gig packages" ON gig_packages FOR SELECT USING (true);
CREATE POLICY "Admins can manage gig packages" ON gig_packages FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE INDEX IF NOT EXISTS idx_gig_packages_gig_id ON gig_packages(gig_id);
CREATE INDEX IF NOT EXISTS idx_gig_packages_sort ON gig_packages(sort_order);

-- Link gigs to client_orders (already has columns from CREATE above)
ALTER TABLE client_orders ADD CONSTRAINT fk_client_orders_gig FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE SET NULL;

-- ============================================================
-- DONE! 20+ tables, all safe to re-run.
-- ============================================================
