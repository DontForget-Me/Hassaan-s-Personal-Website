-- Feature templates: pre-defined features per gig category + tier
-- Safe to re-run (INSERT with DELETE + fresh insert)

CREATE TABLE IF NOT EXISTS gig_feature_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('basic', 'standard', 'premium')),
  feature TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE gig_feature_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read feature templates" ON gig_feature_templates;
DROP POLICY IF EXISTS "Admins can manage feature templates" ON gig_feature_templates;

CREATE POLICY "Public can read feature templates" ON gig_feature_templates
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage feature templates" ON gig_feature_templates
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE INDEX IF NOT EXISTS idx_ft_service_type ON gig_feature_templates(service_type);
CREATE INDEX IF NOT EXISTS idx_ft_tier ON gig_feature_templates(tier);

-- Clear and reseed (safe re-run)
DELETE FROM gig_feature_templates;

-- ===== WEB / FULL STACK DEVELOPMENT =====
-- Basic (starter package — single page / landing page)
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('web-development', 'basic', 'Responsive Design (Mobile + Tablet + Desktop)', 1),
  ('web-development', 'basic', '1 Page / Landing Page', 2),
  ('web-development', 'basic', 'Contact Form Integration', 3),
  ('web-development', 'basic', 'Basic SEO (Meta Tags + Keywords)', 4),
  ('web-development', 'basic', 'Mobile-Friendly Layout', 5),
  ('web-development', 'basic', 'Google Maps Integration', 6),
  ('web-development', 'basic', 'Social Media Links', 7),
  ('web-development', 'basic', '1 Revision Round', 8),
  ('web-development', 'basic', 'Source Code Delivery', 9),
  ('web-development', 'basic', '7 Days Delivery', 10);
-- Standard (multi-page business website)
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('web-development', 'standard', 'Everything in Basic', 1),
  ('web-development', 'standard', 'Up to 10 Pages', 2),
  ('web-development', 'standard', 'Custom UI/UX Design', 3),
  ('web-development', 'standard', 'Advanced SEO (Schema + Sitemap + Analytics)', 4),
  ('web-development', 'standard', 'REST API Integration', 5),
  ('web-development', 'standard', 'CMS Integration (WordPress / Sanity / Strapi)', 6),
  ('web-development', 'standard', 'Admin Dashboard', 7),
  ('web-development', 'standard', 'Payment Gateway (Stripe / PayPal)', 8),
  ('web-development', 'standard', 'User Authentication (Sign Up / Login)', 9),
  ('web-development', 'standard', 'Database Setup (PostgreSQL / Supabase)', 10),
  ('web-development', 'standard', '3 Revision Rounds', 11),
  ('web-development', 'standard', '14 Days Delivery', 12);
-- Premium (full-stack SaaS / e-commerce platform)
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('web-development', 'premium', 'Everything in Standard', 1),
  ('web-development', 'premium', 'Unlimited Pages', 2),
  ('web-development', 'premium', 'E-commerce / Marketplace Ready', 3),
  ('web-development', 'premium', 'Custom Animations & Interactions', 4),
  ('web-development', 'premium', 'Performance Optimization (Core Web Vitals)', 5),
  ('web-development', 'premium', 'Third-Party API Integrations (as needed)', 6),
  ('web-development', 'premium', 'Multi-language / i18n Support', 7),
  ('web-development', 'premium', 'Role-based Access Control (RBAC)', 8),
  ('web-development', 'premium', 'CI/CD Pipeline Setup', 9),
  ('web-development', 'premium', 'Cloud Deployment (Vercel / AWS / Docker)', 10),
  ('web-development', 'premium', 'SSL + Custom Domain Setup', 11),
  ('web-development', 'premium', 'Post-Launch Support (30 Days)', 12),
  ('web-development', 'premium', '5 Revision Rounds', 13),
  ('web-development', 'premium', 'Priority 24/7 Support', 14);

-- ===== AI & MACHINE LEARNING =====
-- Basic (chatbot / simple AI integration)
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('ai-integration', 'basic', 'Basic AI Chatbot Setup', 1),
  ('ai-integration', 'basic', 'FAQ-based Q&A System', 2),
  ('ai-integration', 'basic', 'Single Platform Integration (Website)', 3),
  ('ai-integration', 'basic', 'Pre-built Response Templates', 4),
  ('ai-integration', 'basic', 'Basic Documentation', 5),
  ('ai-integration', 'basic', '1 Revision Round', 6),
  ('ai-integration', 'basic', '7 Days Delivery', 7);
-- Standard (RAG + multiple sources)
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('ai-integration', 'standard', 'Everything in Basic', 1),
  ('ai-integration', 'standard', 'RAG Pipeline (Retrieval-Augmented Generation)', 2),
  ('ai-integration', 'standard', 'Multiple Data Sources (PDF, Docs, Web)', 3),
  ('ai-integration', 'standard', 'Custom Training on Your Data', 4),
  ('ai-integration', 'standard', 'Analytics Dashboard (Query Logs + Metrics)', 5),
  ('ai-integration', 'standard', 'Multi-platform Integration (Web + Slack + WhatsApp)', 6),
  ('ai-integration', 'standard', 'Human Handoff Escalation', 7),
  ('ai-integration', 'standard', '3 Revision Rounds', 8),
  ('ai-integration', 'standard', '14 Days Delivery', 9);
-- Premium (advanced LLM + custom development)
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('ai-integration', 'premium', 'Everything in Standard', 1),
  ('ai-integration', 'premium', 'Advanced LLM Integration (GPT-4, Claude, Gemini)', 2),
  ('ai-integration', 'premium', 'Custom AI Agent / Workflow Automation', 3),
  ('ai-integration', 'premium', 'Multi-language Support (10+ Languages)', 4),
  ('ai-integration', 'premium', 'Custom API Development for AI Features', 5),
  ('ai-integration', 'premium', 'File Upload & Analysis (Images, PDFs, Audio)', 6),
  ('ai-integration', 'premium', 'Vector Database Setup (Pinecone / pgvector)', 7),
  ('ai-integration', 'premium', 'Performance Optimization & Caching', 8),
  ('ai-integration', 'premium', 'Priority 24/7 Support', 9),
  ('ai-integration', 'premium', '30 Days Post-Launch Support', 10);

-- ===== BACKEND & API DEVELOPMENT =====
-- Basic
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('backend-apis', 'basic', 'RESTful API Design & Development', 1),
  ('backend-apis', 'basic', 'API Documentation (Swagger/OpenAPI)', 2),
  ('backend-apis', 'basic', '3 Custom API Endpoints', 3),
  ('backend-apis', 'basic', 'Basic Data Validation', 4),
  ('backend-apis', 'basic', 'Standard Hosting Setup', 5),
  ('backend-apis', 'basic', 'Email Support', 6),
  ('backend-apis', 'basic', '1 Revision Round', 7),
  ('backend-apis', 'basic', '7 Days Delivery', 8);
-- Standard
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('backend-apis', 'standard', 'Everything in Basic', 1),
  ('backend-apis', 'standard', '10 Custom API Endpoints', 2),
  ('backend-apis', 'standard', 'Database Schema Design (PostgreSQL/Supabase)', 3),
  ('backend-apis', 'standard', 'User Authentication (JWT / OAuth)', 4),
  ('backend-apis', 'standard', 'Role-based Access Control', 5),
  ('backend-apis', 'standard', 'API Testing Suite (Unit + Integration)', 6),
  ('backend-apis', 'standard', 'Error Handling & Logging', 7),
  ('backend-apis', 'standard', 'Performance Optimization', 8),
  ('backend-apis', 'standard', '3 Revision Rounds', 9),
  ('backend-apis', 'standard', '14 Days Delivery', 10);
-- Premium
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('backend-apis', 'premium', 'Everything in Standard', 1),
  ('backend-apis', 'premium', 'Unlimited API Endpoints', 2),
  ('backend-apis', 'premium', 'Microservices Architecture Design', 3),
  ('backend-apis', 'premium', 'CI/CD Pipeline (GitHub Actions)', 4),
  ('backend-apis', 'premium', 'Security Audit & Penetration Testing', 5),
  ('backend-apis', 'premium', 'Rate Limiting & Caching (Redis)', 6),
  ('backend-apis', 'premium', 'Webhook Integrations', 7),
  ('backend-apis', 'premium', 'Cloud Deployment (AWS / Docker / Vercel)', 8),
  ('backend-apis', 'premium', 'Database Migration & Optimization', 9),
  ('backend-apis', 'premium', 'Dedicated Support & SLA', 10),
  ('backend-apis', 'premium', '30 Days Post-Launch Support', 11);

-- ===== TECHNICAL CONSULTING =====
-- Basic
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('consulting', 'basic', '1-hour Video Consultation Call', 1),
  ('consulting', 'basic', 'High-level Project Review', 2),
  ('consulting', 'basic', 'Summary Report with Findings', 3),
  ('consulting', 'basic', 'Email Follow-up', 4),
  ('consulting', 'basic', 'Technology Stack Recommendations', 5),
  ('consulting', 'basic', '5 Days Delivery', 6);
-- Standard
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('consulting', 'standard', 'Everything in Basic', 1),
  ('consulting', 'standard', 'Full Code Review (Up to 10 Files)', 2),
  ('consulting', 'standard', 'Architecture Assessment & Diagram', 3),
  ('consulting', 'standard', 'Detailed Recommendations Document', 4),
  ('consulting', 'standard', '30-min Follow-up Call', 5),
  ('consulting', 'standard', 'Performance Bottleneck Analysis', 6),
  ('consulting', 'standard', 'Security Vulnerability Scan', 7),
  ('consulting', 'standard', '10 Days Delivery', 8);
-- Premium
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('consulting', 'premium', 'Everything in Standard', 1),
  ('consulting', 'premium', 'Complete System Audit Report', 2),
  ('consulting', 'premium', 'Step-by-Step Implementation Plan', 3),
  ('consulting', 'premium', 'Database Schema Review & Optimization', 4),
  ('consulting', 'premium', 'CI/CD Pipeline Recommendations', 5),
  ('consulting', 'premium', '2 Weeks Priority Support', 6),
  ('consulting', 'premium', 'Monthly Check-in (3 Months)', 7),
  ('consulting', 'premium', '15 Days Delivery', 8);

-- ===== UI/UX DESIGN =====
-- Basic
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('ui-ux-design', 'basic', '3 Screen/Page Designs', 1),
  ('ui-ux-design', 'basic', 'Wireframing (Low Fidelity)', 2),
  ('ui-ux-design', 'basic', 'Color Palette Selection', 3),
  ('ui-ux-design', 'basic', 'Typography Selection', 4),
  ('ui-ux-design', 'basic', 'Basic Prototype (Clickable)', 5),
  ('ui-ux-design', 'basic', 'Figma Source File', 6),
  ('ui-ux-design', 'basic', '2 Revision Rounds', 7),
  ('ui-ux-design', 'basic', '5 Days Delivery', 8);
-- Standard
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('ui-ux-design', 'standard', 'Everything in Basic', 1),
  ('ui-ux-design', 'standard', '6 Screen/Page Designs', 2),
  ('ui-ux-design', 'standard', 'Interactive High-Fidelity Prototype', 3),
  ('ui-ux-design', 'standard', 'Responsive Design (Mobile + Tablet + Desktop)', 4),
  ('ui-ux-design', 'standard', 'UI Kit / Component Library', 5),
  ('ui-ux-design', 'standard', 'User Flow Diagram', 6),
  ('ui-ux-design', 'standard', 'Design System Foundation', 7),
  ('ui-ux-design', 'standard', '4 Revision Rounds', 8),
  ('ui-ux-design', 'standard', '10 Days Delivery', 9);
-- Premium
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('ui-ux-design', 'premium', 'Everything in Standard', 1),
  ('ui-ux-design', 'premium', '12+ Screen/Page Designs', 2),
  ('ui-ux-design', 'premium', 'Full Design System (Colors + Typography + Components)', 3),
  ('ui-ux-design', 'premium', 'Micro-interactions & Animations', 4),
  ('ui-ux-design', 'premium', 'User Research & Persona Development', 5),
  ('ui-ux-design', 'premium', 'Usability Testing Report', 6),
  ('ui-ux-design', 'premium', 'Handoff Package (Developer-ready Specs)', 7),
  ('ui-ux-design', 'premium', 'HTML/CSS Conversion of Design', 8),
  ('ui-ux-design', 'premium', 'Unlimited Revisions', 9),
  ('ui-ux-design', 'premium', '14 Days Delivery', 10);

-- ===== MOBILE APP DEVELOPMENT =====
-- Basic
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('mobile-app-development', 'basic', 'Single Platform (iOS OR Android)', 1),
  ('mobile-app-development', 'basic', '3 App Screens', 2),
  ('mobile-app-development', 'basic', 'Basic UI Implementation', 3),
  ('mobile-app-development', 'basic', 'Navigation Setup', 4),
  ('mobile-app-development', 'basic', 'App Icon & Splash Screen', 5),
  ('mobile-app-development', 'basic', '1 Revision Round', 6),
  ('mobile-app-development', 'basic', 'Source Code Delivery', 7),
  ('mobile-app-development', 'basic', '14 Days Delivery', 8);
-- Standard
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('mobile-app-development', 'standard', 'Everything in Basic', 1),
  ('mobile-app-development', 'standard', 'Cross-Platform (iOS + Android via React Native/Flutter)', 2),
  ('mobile-app-development', 'standard', '8 App Screens', 3),
  ('mobile-app-development', 'standard', 'REST API Integration', 4),
  ('mobile-app-development', 'standard', 'User Authentication (Sign Up / Login)', 5),
  ('mobile-app-development', 'standard', 'Database Integration (Firebase/Supabase)', 6),
  ('mobile-app-development', 'standard', 'Push Notifications', 7),
  ('mobile-app-development', 'standard', 'Custom UI Components', 8),
  ('mobile-app-development', 'standard', '3 Revision Rounds', 9),
  ('mobile-app-development', 'standard', '21 Days Delivery', 10);
-- Premium
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('mobile-app-development', 'premium', 'Everything in Standard', 1),
  ('mobile-app-development', 'premium', 'Both Platforms (iOS + Android)', 2),
  ('mobile-app-development', 'premium', 'Full App (Unlimited Screens)', 3),
  ('mobile-app-development', 'premium', 'Backend API Development', 4),
  ('mobile-app-development', 'premium', 'In-app Purchases / Subscription', 5),
  ('mobile-app-development', 'premium', 'Real-time Features (Chat / Live Updates)', 6),
  ('mobile-app-development', 'premium', 'Third-party SDK Integration', 7),
  ('mobile-app-development', 'premium', 'App Store & Play Store Submission', 8),
  ('mobile-app-development', 'premium', 'Analytics & Crash Reporting', 9),
  ('mobile-app-development', 'premium', '5 Revision Rounds', 10),
  ('mobile-app-development', 'premium', '30 Days Post-Launch Support', 11),
  ('mobile-app-development', 'premium', '30 Days Delivery', 12);

-- ===== FULL STACK DEVELOPMENT =====
-- Basic
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('full-stack-development', 'basic', 'Simple CRUD Web Application', 1),
  ('full-stack-development', 'basic', '2 Pages (List + Detail)', 2),
  ('full-stack-development', 'basic', 'Basic REST API', 3),
  ('full-stack-development', 'basic', 'Database Setup (PostgreSQL/Supabase)', 4),
  ('full-stack-development', 'basic', 'Responsive Frontend (React/Next.js)', 5),
  ('full-stack-development', 'basic', 'Source Code on GitHub', 6),
  ('full-stack-development', 'basic', '1 Revision Round', 7),
  ('full-stack-development', 'basic', '14 Days Delivery', 8);
-- Standard
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('full-stack-development', 'standard', 'Everything in Basic', 1),
  ('full-stack-development', 'standard', 'Multi-page Web Application (Up to 8 Pages)', 2),
  ('full-stack-development', 'standard', 'User Authentication & Authorization', 3),
  ('full-stack-development', 'standard', 'Admin Dashboard with Analytics', 4),
  ('full-stack-development', 'standard', 'Third-party API Integration', 5),
  ('full-stack-development', 'standard', 'File Upload & Management', 6),
  ('full-stack-development', 'standard', 'Email Notifications (SendGrid/Resend)', 7),
  ('full-stack-development', 'standard', 'Database Schema Design & Migrations', 8),
  ('full-stack-development', 'standard', 'Cloud Deployment (Vercel/Railway)', 9),
  ('full-stack-development', 'standard', '3 Revision Rounds', 10),
  ('full-stack-development', 'standard', '21 Days Delivery', 11);
-- Premium
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('full-stack-development', 'premium', 'Everything in Standard', 1),
  ('full-stack-development', 'premium', 'Full SaaS / Enterprise Platform', 2),
  ('full-stack-development', 'premium', 'Custom Dashboard with Data Visualization', 3),
  ('full-stack-development', 'premium', 'AI/ML Feature Integration', 4),
  ('full-stack-development', 'premium', 'Real-time Features (WebSockets)', 5),
  ('full-stack-development', 'premium', 'Multi-tenant Architecture', 6),
  ('full-stack-development', 'premium', 'CI/CD Pipeline (GitHub Actions)', 7),
  ('full-stack-development', 'premium', 'Performance Optimization & Caching', 8),
  ('full-stack-development', 'premium', 'Comprehensive Testing Suite', 9),
  ('full-stack-development', 'premium', 'Post-Launch Monitoring Setup', 10),
  ('full-stack-development', 'premium', '30 Days Priority Support', 11),
  ('full-stack-development', 'premium', '5 Revision Rounds', 12),
  ('full-stack-development', 'premium', '30 Days Delivery', 13);
