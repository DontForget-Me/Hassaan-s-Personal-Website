-- Gig system for service packages (safe to re-run)

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

CREATE POLICY "Public can read active gigs" ON gigs
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage gigs" ON gigs
  FOR ALL USING (
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

CREATE POLICY "Public can read gig packages" ON gig_packages
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage gig packages" ON gig_packages
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE INDEX IF NOT EXISTS idx_gig_packages_gig_id ON gig_packages(gig_id);
CREATE INDEX IF NOT EXISTS idx_gig_packages_sort ON gig_packages(sort_order);

-- Add gig fields to client_orders
DO $$ BEGIN
  ALTER TABLE client_orders ADD COLUMN IF NOT EXISTS gig_id UUID REFERENCES gigs(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE client_orders ADD COLUMN IF NOT EXISTS package_name TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE client_orders ADD COLUMN IF NOT EXISTS package_price DECIMAL(10,2);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
