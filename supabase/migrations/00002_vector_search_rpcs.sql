-- Match project embeddings by vector similarity
CREATE OR REPLACE FUNCTION match_project_embeddings(
  query_embedding vector(2048),
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

-- Match profile embeddings by vector similarity
CREATE OR REPLACE FUNCTION match_profile_embeddings(
  query_embedding vector(2048),
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
