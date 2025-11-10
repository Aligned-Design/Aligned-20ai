-- ============================================================================
-- MIGRATION 002: Brands & Agency Management
-- Created: 2025-01-01
-- Description: Multi-tenant brand structure with agency support
-- ============================================================================

-- Brands Table (Multi-tenant core)
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  industry VARCHAR(100),
  website VARCHAR(255),
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Brand Members Table (Role-based access control)
CREATE TABLE IF NOT EXISTS brand_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  invited_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  UNIQUE(brand_id, user_id)
);

-- Brand Assets Table (Media library for brands)
CREATE TABLE IF NOT EXISTS brand_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('logo', 'brand_guide', 'color_palette', 'typography', 'image', 'video')),
  url TEXT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  uploaded_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- White Label Configuration Table
CREATE TABLE IF NOT EXISTS white_label_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  custom_domain VARCHAR(255),
  brand_name VARCHAR(255),
  logo_url TEXT,
  primary_color VARCHAR(20),
  secondary_color VARCHAR(20),
  favicon_url TEXT,
  preview_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(custom_domain)
);

-- Indexes for performance
CREATE INDEX idx_brands_agency_id ON brands(agency_id);
CREATE INDEX idx_brands_is_active ON brands(is_active);
CREATE INDEX idx_brands_created_at ON brands(created_at);
CREATE INDEX idx_brand_members_brand_id ON brand_members(brand_id);
CREATE INDEX idx_brand_members_user_id ON brand_members(user_id);
CREATE INDEX idx_brand_members_role ON brand_members(role);
CREATE INDEX idx_brand_assets_brand_id ON brand_assets(brand_id);
CREATE INDEX idx_brand_assets_asset_type ON brand_assets(asset_type);
CREATE INDEX idx_white_label_agency_id ON white_label_configs(agency_id);

-- Triggers
CREATE TRIGGER update_brands_updated_at
BEFORE UPDATE ON brands
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_white_label_configs_updated_at
BEFORE UPDATE ON white_label_configs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS)
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE white_label_configs ENABLE ROW LEVEL SECURITY;

-- Members of a brand can read brand details
CREATE POLICY "Brand members can read brand"
  ON brands
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brand_members
      WHERE brand_members.brand_id = brands.id
      AND brand_members.user_id = auth.uid()::uuid
    )
  );

-- Only brand owners/admins can update brand
CREATE POLICY "Brand owners/admins can update brand"
  ON brands
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM brand_members
      WHERE brand_members.brand_id = brands.id
      AND brand_members.user_id = auth.uid()::uuid
      AND brand_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brand_members
      WHERE brand_members.brand_id = brands.id
      AND brand_members.user_id = auth.uid()::uuid
      AND brand_members.role IN ('owner', 'admin')
    )
  );

-- Members can read their own membership info
CREATE POLICY "Members can read their own membership"
  ON brand_members
  FOR SELECT
  USING (user_id = auth.uid()::uuid OR
    EXISTS (
      SELECT 1 FROM brand_members bm2
      WHERE bm2.brand_id = brand_members.brand_id
      AND bm2.user_id = auth.uid()::uuid
      AND bm2.role IN ('owner', 'admin')
    ));

-- Brand admins can manage members
CREATE POLICY "Brand admins can manage members"
  ON brand_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM brand_members bm2
      WHERE bm2.brand_id = brand_members.brand_id
      AND bm2.user_id = auth.uid()::uuid
      AND bm2.role IN ('owner', 'admin')
    )
  );

-- Members can read brand assets
CREATE POLICY "Members can read brand assets"
  ON brand_assets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brand_members
      WHERE brand_members.brand_id = brand_assets.brand_id
      AND brand_members.user_id = auth.uid()::uuid
    )
  );

-- Editors and above can upload assets
CREATE POLICY "Editors can upload assets"
  ON brand_assets
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brand_members
      WHERE brand_members.brand_id = brand_assets.brand_id
      AND brand_members.user_id = auth.uid()::uuid
      AND brand_members.role IN ('owner', 'admin', 'editor')
    )
  );

-- Agency admins can read white label configs
CREATE POLICY "Agency admins can read white label config"
  ON white_label_configs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brand_members
      WHERE brand_members.brand_id = white_label_configs.agency_id
      AND brand_members.user_id = auth.uid()::uuid
      AND brand_members.role IN ('owner', 'admin')
    )
  );

-- Agency admins can manage white label configs
CREATE POLICY "Agency admins can manage white label config"
  ON white_label_configs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM brand_members
      WHERE brand_members.brand_id = white_label_configs.agency_id
      AND brand_members.user_id = auth.uid()::uuid
      AND brand_members.role IN ('owner', 'admin')
    )
  );
