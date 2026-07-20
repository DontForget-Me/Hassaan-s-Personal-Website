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

-- ===== WEB DEVELOPMENT =====
-- Basic
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('web-development', 'basic', 'Responsive Design', 1),
  ('web-development', 'basic', 'Up to 5 Pages', 2),
  ('web-development', 'basic', 'Contact Form', 3),
  ('web-development', 'basic', 'Basic SEO Setup', 4),
  ('web-development', 'basic', 'Mobile Friendly', 5),
  ('web-development', 'basic', '1 Revision', 6),
  ('web-development', 'basic', '7 Days Delivery', 7);
-- Standard
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('web-development', 'standard', 'Everything in Basic', 1),
  ('web-development', 'standard', 'Up to 10 Pages', 2),
  ('web-development', 'standard', 'Advanced SEO', 3),
  ('web-development', 'standard', 'API Integration', 4),
  ('web-development', 'standard', 'CMS Integration', 5),
  ('web-development', 'standard', 'Admin Dashboard', 6),
  ('web-development', 'standard', '3 Revisions', 7),
  ('web-development', 'standard', 'Payment Gateway', 8);
-- Premium
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('web-development', 'premium', 'Everything in Standard', 1),
  ('web-development', 'premium', 'Unlimited Pages', 2),
  ('web-development', 'premium', 'E-commerce Ready', 3),
  ('web-development', 'premium', 'Custom Animations', 4),
  ('web-development', 'premium', 'Performance Optimization', 5),
  ('web-development', 'premium', 'Priority Support', 6),
  ('web-development', 'premium', '5 Revisions', 7),
  ('web-development', 'premium', 'SLA Guarantee', 8);

-- ===== AI INTEGRATION =====
-- Basic
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('ai-integration', 'basic', 'Basic Chatbot Setup', 1),
  ('ai-integration', 'basic', 'FAQ-based Responses', 2),
  ('ai-integration', 'basic', 'Single Platform Integration', 3),
  ('ai-integration', 'basic', 'Basic Documentation', 4),
  ('ai-integration', 'basic', '7 Days Support', 5);
-- Standard
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('ai-integration', 'standard', 'Everything in Basic', 1),
  ('ai-integration', 'standard', 'RAG Pipeline', 2),
  ('ai-integration', 'standard', 'Multiple Data Sources', 3),
  ('ai-integration', 'standard', 'Custom Training Data', 4),
  ('ai-integration', 'standard', 'Analytics Dashboard', 5),
  ('ai-integration', 'standard', '14 Days Support', 6);
-- Premium
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('ai-integration', 'premium', 'Everything in Standard', 1),
  ('ai-integration', 'premium', 'Advanced LLM Integration', 2),
  ('ai-integration', 'premium', 'Multi-language Support', 3),
  ('ai-integration', 'premium', 'Custom API Development', 4),
  ('ai-integration', 'premium', 'Priority 24/7 Support', 5),
  ('ai-integration', 'premium', '30 Days Support', 6),
  ('ai-integration', 'premium', 'SLA Guarantee', 7);

-- ===== BACKEND & APIs =====
-- Basic
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('backend-apis', 'basic', 'RESTful API Design', 1),
  ('backend-apis', 'basic', 'Basic Documentation', 2),
  ('backend-apis', 'basic', 'Standard Hosting Setup', 3),
  ('backend-apis', 'basic', 'Email Support', 4),
  ('backend-apis', 'basic', '3 Endpoints', 5);
-- Standard
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('backend-apis', 'standard', 'Everything in Basic', 1),
  ('backend-apis', 'standard', 'Database Schema Design', 2),
  ('backend-apis', 'standard', 'Auth Integration', 3),
  ('backend-apis', 'standard', 'API Testing Suite', 4),
  ('backend-apis', 'standard', 'Performance Optimization', 5),
  ('backend-apis', 'standard', '10 Endpoints', 6);
-- Premium
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('backend-apis', 'premium', 'Everything in Standard', 1),
  ('backend-apis', 'premium', 'Microservices Architecture', 2),
  ('backend-apis', 'premium', 'CI/CD Pipeline', 3),
  ('backend-apis', 'premium', 'Security Audit', 4),
  ('backend-apis', 'premium', 'Dedicated Support', 5),
  ('backend-apis', 'premium', 'Unlimited Endpoints', 6);

-- ===== CONSULTING =====
-- Basic
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('consulting', 'basic', '1-hour Consultation Call', 1),
  ('consulting', 'basic', 'High-level Review', 2),
  ('consulting', 'basic', 'Summary Report', 3),
  ('consulting', 'basic', 'Email Follow-up', 4);
-- Standard
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('consulting', 'standard', 'Everything in Basic', 1),
  ('consulting', 'standard', 'Code Review', 2),
  ('consulting', 'standard', 'Architecture Assessment', 3),
  ('consulting', 'standard', 'Recommendations Document', 4),
  ('consulting', 'standard', '30-min Follow-up Call', 5);
-- Premium
INSERT INTO gig_feature_templates (service_type, tier, feature, sort_order) VALUES
  ('consulting', 'premium', 'Everything in Standard', 1),
  ('consulting', 'premium', 'Full Audit Report', 2),
  ('consulting', 'premium', 'Implementation Plan', 3),
  ('consulting', 'premium', '2 Weeks Support', 4),
  ('consulting', 'premium', 'Priority Access', 5),
  ('consulting', 'premium', 'Monthly Check-in', 6);
