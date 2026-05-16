-- ProSource CRM v2 Multi-tenant Schema

-- 1. Organizations Table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Profiles Table (Links Supabase Auth users to Organizations)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  username TEXT,
  role TEXT CHECK (role IN ('admin', 'employee')) DEFAULT 'employee',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Clients Table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  company TEXT,
  platform TEXT,
  currency TEXT NOT NULL,
  notes TEXT,
  custom_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  qty NUMERIC NOT NULL,
  unit TEXT,
  cost NUMERIC NOT NULL,
  cost_cur TEXT,
  charge NUMERIC NOT NULL,
  charge_cur TEXT,
  status TEXT CHECK (status IN ('pending', 'sourced', 'delivered', 'cancelled')),
  supplier TEXT,
  link TEXT,
  tracking TEXT,
  shipstatus TEXT,
  note TEXT,
  images TEXT[],
  files TEXT[],
  custom_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Leads Table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact TEXT,
  product TEXT,
  country TEXT,
  budget TEXT,
  status TEXT CHECK (status IN ('new', 'contacted', 'negotiating', 'closed', 'lost')),
  followup TEXT,
  source TEXT,
  notes TEXT,
  converted_to_client_id UUID REFERENCES clients(id),
  custom_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Invoices Table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  num TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  discount NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  notes TEXT,
  pay_status TEXT CHECK (pay_status IN ('unpaid', 'partial', 'paid')),
  currency TEXT NOT NULL,
  subtotal NUMERIC NOT NULL,
  disc_amt NUMERIC NOT NULL,
  tax_amt NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  products JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Settings Table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT,
  wa TEXT,
  email TEXT,
  currency TEXT,
  inv_prefix TEXT,
  industry TEXT,
  is_configured BOOLEAN DEFAULT false,
  auth_enabled BOOLEAN DEFAULT false,
  template_customization JSONB,
  invoice_branding JSONB,
  dashboard_blueprint TEXT[],
  crm_blueprint TEXT[],
  operations_blueprint TEXT[],
  finance_blueprint TEXT[],
  reports_blueprint TEXT[],
  kpi_blueprint TEXT[],
  workflow_blueprint TEXT[],
  action_blueprint TEXT[],
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Organization access: Users can see the organization they belong to
CREATE POLICY "Organization access" ON organizations
  USING (id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Profile access: Users can read their own profile
CREATE POLICY "Profile access" ON profiles
  USING (id = auth.uid());

-- Multi-tenant isolation for all other tables
CREATE POLICY "Client isolation" ON clients
  USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Product isolation" ON products
  USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Lead isolation" ON leads
  USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Invoice isolation" ON invoices
  USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Settings isolation" ON settings
  USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Allow all policies to apply for INSERT, UPDATE, DELETE as well
CREATE POLICY "Client all access" ON clients FOR ALL
  USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Product all access" ON products FOR ALL
  USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Lead all access" ON leads FOR ALL
  USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Invoice all access" ON invoices FOR ALL
  USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Settings all access" ON settings FOR ALL
  USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
