-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  github_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Project embeddings (one project can have multiple chunks)
CREATE TABLE project_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(2048)
);

CREATE INDEX idx_project_embeddings_project_id ON project_embeddings(project_id);

-- Profile content (bio, skills, education, etc.)
CREATE TABLE profile_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profile embeddings
CREATE TABLE profile_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profile_content(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(2048)
);

CREATE INDEX idx_profile_embeddings_profile_id ON profile_embeddings(profile_id);

-- AI chat logs (for monitoring and rate limiting)
CREATE TABLE ai_chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  visitor_query TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  ip_address TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_chat_logs_ip_address ON ai_chat_logs(ip_address);
CREATE INDEX idx_ai_chat_logs_created_at ON ai_chat_logs(created_at);
CREATE INDEX idx_ai_chat_logs_session_id ON ai_chat_logs(session_id);

-- Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_logs ENABLE ROW LEVEL SECURITY;

-- Public can read projects and profile content
CREATE POLICY "Public can read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public can read project_embeddings" ON project_embeddings FOR SELECT USING (true);
CREATE POLICY "Public can read profile_content" ON profile_content FOR SELECT USING (true);
CREATE POLICY "Public can read profile_embeddings" ON profile_embeddings FOR SELECT USING (true);

-- Public can insert chat logs (for the AI assistant)
CREATE POLICY "Public can insert chat logs" ON ai_chat_logs FOR INSERT WITH CHECK (true);

-- Admin (authenticated users with service role) can do everything
-- These policies rely on the service_role key, not direct user auth
-- Admin operations go through API routes using the service_role client
