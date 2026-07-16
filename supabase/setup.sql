-- ============================================================
-- Complete Supabase Setup — Safe to run multiple times
-- Uses IF NOT EXISTS / OR REPLACE to avoid errors on re-run
-- ============================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- 2. Create tables
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

-- 3. Create indexes (IF NOT EXISTS for indexes)
CREATE INDEX IF NOT EXISTS idx_project_embeddings_project_id ON project_embeddings(project_id);
CREATE INDEX IF NOT EXISTS idx_profile_embeddings_profile_id ON profile_embeddings(profile_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_ip_address ON ai_chat_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_created_at ON ai_chat_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_session_id ON ai_chat_logs(session_id);

-- 4. Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_logs ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies and recreate (safe re-run)
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

-- 6. Vector search functions (OR REPLACE makes them safe to re-run)
CREATE OR REPLACE FUNCTION match_project_embeddings(
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  project_id uuid,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pe.id,
    pe.project_id,
    pe.content,
    1 - (pe.embedding <=> query_embedding) AS similarity
  FROM project_embeddings pe
  WHERE 1 - (pe.embedding <=> query_embedding) > match_threshold
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION match_profile_embeddings(
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  profile_id uuid,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pe.id,
    pe.profile_id,
    pe.content,
    1 - (pe.embedding <=> query_embedding) AS similarity
  FROM profile_embeddings pe
  WHERE 1 - (pe.embedding <=> query_embedding) > match_threshold
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
