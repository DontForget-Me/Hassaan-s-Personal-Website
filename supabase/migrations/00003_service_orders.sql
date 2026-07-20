-- Add service_orders table (safe to re-run)
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

CREATE POLICY "Public can insert service orders" ON service_orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can read service orders" ON service_orders
  FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_service_orders_created_at ON service_orders(created_at);
