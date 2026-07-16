export interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  github_url: string;
  created_at?: string;
}

export interface ProjectEmbedding {
  id: string;
  project_id: string;
  content: string;
  embedding: number[];
}

export interface ProfileContent {
  id: string;
  section_name: 'bio' | 'skills' | 'education' | 'experience' | 'certifications';
  content: string;
  created_at?: string;
}

export interface ProfileEmbedding {
  id: string;
  profile_id: string;
  content: string;
  embedding: number[];
}

export interface AiChatLog {
  id: string;
  session_id: string;
  visitor_query: string;
  ai_response: string;
  ip_address?: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
}
