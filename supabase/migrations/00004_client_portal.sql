-- ============================================================
-- Client Portal — Safe to re-run (uses IF NOT EXISTS)
-- ============================================================

-- 1. Profiles (links to Supabase Auth)
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

CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'client')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. Client Orders
CREATE TABLE IF NOT EXISTS client_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  service_type TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  budget_amount DECIMAL(10,2),
  budget_currency TEXT NOT NULL DEFAULT 'USD',
  timeline_days INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  admin_notes TEXT NOT NULL DEFAULT '',
  -- For anonymous orders (from /services page)
  contact_name TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE client_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can read own orders" ON client_orders;
DROP POLICY IF EXISTS "Clients can insert orders" ON client_orders;
DROP POLICY IF EXISTS "Public can insert anonymous orders" ON client_orders;
DROP POLICY IF EXISTS "Admins can read all orders" ON client_orders;

CREATE POLICY "Clients can read own orders" ON client_orders
  FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients can insert orders" ON client_orders
  FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Public can insert anonymous orders" ON client_orders
  FOR INSERT WITH CHECK (client_id IS NULL);
CREATE POLICY "Admins can read all orders" ON client_orders
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE INDEX IF NOT EXISTS idx_client_orders_client_id ON client_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_client_orders_status ON client_orders(status);
CREATE INDEX IF NOT EXISTS idx_client_orders_created_at ON client_orders(created_at);

-- 3. Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES client_orders(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'paused', 'cancelled')),
  start_date DATE,
  deadline DATE,
  total_amount DECIMAL(10,2),
  penalty_per_day DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can read own projects" ON projects;
DROP POLICY IF EXISTS "Admins can manage projects" ON projects;

CREATE POLICY "Clients can read own projects" ON projects
  FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Admins can manage projects" ON projects
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- 4. Project Milestones
CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  amount DECIMAL(10,2),
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'approved', 'rejected')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can read own milestones" ON project_milestones;
DROP POLICY IF EXISTS "Admins can manage milestones" ON project_milestones;

CREATE POLICY "Clients can read own milestones" ON project_milestones
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_milestones.project_id AND client_id = auth.uid())
  );
CREATE POLICY "Admins can manage milestones" ON project_milestones
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON project_milestones(project_id);

-- 5. Project Messages
CREATE TABLE IF NOT EXISTS project_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  file_attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE project_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can read messages" ON project_messages;
DROP POLICY IF EXISTS "Participants can send messages" ON project_messages;

CREATE POLICY "Participants can read messages" ON project_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_messages.project_id AND client_id = auth.uid())
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
CREATE POLICY "Participants can send messages" ON project_messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE id = project_messages.project_id AND client_id = auth.uid())
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE INDEX IF NOT EXISTS idx_messages_project_id ON project_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON project_messages(created_at);

-- 6. Project Files
CREATE TABLE IF NOT EXISTS project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
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

CREATE POLICY "Participants can read files" ON project_files
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_files.project_id AND client_id = auth.uid())
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
CREATE POLICY "Participants can upload files" ON project_files
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE id = project_files.project_id AND client_id = auth.uid())
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE INDEX IF NOT EXISTS idx_files_project_id ON project_files(project_id);

-- 7. Project Timeline
CREATE TABLE IF NOT EXISTS project_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE project_timeline_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can read timeline" ON project_timeline_events;
DROP POLICY IF EXISTS "Admins can create timeline events" ON project_timeline_events;

CREATE POLICY "Participants can read timeline" ON project_timeline_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_timeline_events.project_id AND client_id = auth.uid())
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
CREATE POLICY "Admins can create timeline events" ON project_timeline_events
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE INDEX IF NOT EXISTS idx_timeline_project_id ON project_timeline_events(project_id);
CREATE INDEX IF NOT EXISTS idx_timeline_created_at ON project_timeline_events(created_at);

-- 8. Extension Requests
CREATE TABLE IF NOT EXISTS extension_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES project_milestones(id) ON DELETE SET NULL,
  requested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  old_deadline DATE NOT NULL,
  new_deadline DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  response_notes TEXT NOT NULL DEFAULT '',
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE extension_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can read extensions" ON extension_requests;
DROP POLICY IF EXISTS "Clients can request extensions" ON extension_requests;

CREATE POLICY "Participants can read extensions" ON extension_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE id = extension_requests.project_id AND client_id = auth.uid())
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
CREATE POLICY "Clients can request extensions" ON extension_requests
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE id = extension_requests.project_id AND client_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_extensions_project_id ON extension_requests(project_id);

-- 9. Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES project_milestones(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
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

CREATE POLICY "Clients can read own payments" ON payments
  FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Admins can manage payments" ON payments
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE INDEX IF NOT EXISTS idx_payments_project_id ON payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
