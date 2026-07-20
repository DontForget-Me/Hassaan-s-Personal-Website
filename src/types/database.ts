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

// --- Client Portal Types ---

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  role: 'client' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface ClientOrder {
  id: string;
  client_id: string | null;
  service_type: string;
  title: string;
  description: string;
  budget_amount: number | null;
  budget_currency: string;
  timeline_days: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  admin_notes: string;
  contact_name: string;
  contact_email: string;
  gig_id: string | null;
  package_name: string | null;
  package_price: number | null;
  created_at: string;
  updated_at: string;
}

export interface PortalProject {
  id: string;
  order_id: string | null;
  client_id: string;
  title: string;
  description: string;
  status: 'in_progress' | 'completed' | 'paused' | 'cancelled';
  start_date: string | null;
  deadline: string | null;
  total_amount: number | null;
  penalty_per_day: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  amount: number | null;
  deadline: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected';
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectMessage {
  id: string;
  project_id: string;
  sender_id: string;
  content: string;
  file_attachments: any[];
  created_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  uploader_id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string;
  expires_at: string | null;
  created_at: string;
}

export interface ProjectTimelineEvent {
  id: string;
  project_id: string;
  event_type: string;
  description: string;
  created_at: string;
}

export interface ExtensionRequest {
  id: string;
  project_id: string;
  milestone_id: string | null;
  requested_by: string;
  reason: string;
  old_deadline: string;
  new_deadline: string;
  status: 'pending' | 'approved' | 'rejected';
  response_notes: string;
  responded_at: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  project_id: string;
  milestone_id: string | null;
  client_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  transaction_id: string;
  proof_url: string;
  account_details: string;
  notes: string;
  paid_at: string | null;
  created_at: string;
}

// --- Phase 6 Types ---

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export interface Testimonial {
  id: string;
  client_name: string;
  client_role: string;
  content: string;
  rating: number;
  project_id: string | null;
  is_visible: boolean;
  created_at: string;
}

export interface TimeLog {
  id: string;
  project_id: string;
  milestone_id: string | null;
  user_id: string;
  description: string;
  hours: number;
  log_date: string;
  created_at: string;
}

// --- Gig Types ---

export interface Gig {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
  packages: GigPackage[];
  created_at: string;
  updated_at: string;
}

export interface GigPackage {
  id: string;
  gig_id: string;
  name: 'basic' | 'standard' | 'premium';
  price: number;
  delivery_days: number | null;
  features: string[];
  is_popular: boolean;
  sort_order: number;
  created_at: string;
}

export interface GigFeatureTemplate {
  id: string;
  service_type: string;
  tier: 'basic' | 'standard' | 'premium';
  feature: string;
  sort_order: number;
}

export interface ServiceOrder {
  id: string;
  client_name: string;
  email: string;
  service_type: string;
  budget: string;
  description: string;
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  created_at: string;
}
