-- ============================================================================
-- MIGRATION 003: Content & Social Media Posts
-- Created: 2025-01-01
-- Description: Content management and multi-platform publishing
-- ============================================================================

-- Content Items Table (Draft/scheduled content)
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('post', 'story', 'reel', 'article', 'video')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- Posts Table (Per-platform publishing records)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  platform_post_id VARCHAR(255),
  url TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_posts_content_platform (content_id, platform)
);

-- Post Approvals Table (Approval workflows)
CREATE TABLE IF NOT EXISTS post_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  approved_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  rejected_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  feedback TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_content_brand_id ON content(brand_id);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_created_by ON content(created_by);
CREATE INDEX idx_content_created_at ON content(created_at);
CREATE INDEX idx_content_scheduled_at ON content(scheduled_at);
CREATE INDEX idx_posts_content_id ON posts(content_id);
CREATE INDEX idx_posts_platform ON posts(platform);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at);
CREATE INDEX idx_post_approvals_post_id ON post_approvals(post_id);
CREATE INDEX idx_post_approvals_content_id ON post_approvals(content_id);
CREATE INDEX idx_post_approvals_status ON post_approvals(status);

-- Triggers
CREATE TRIGGER update_content_updated_at
BEFORE UPDATE ON content
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS)
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_approvals ENABLE ROW LEVEL SECURITY;

-- Brand members can view content
CREATE POLICY "Brand members can view content"
  ON content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brand_members
      WHERE brand_members.brand_id = content.brand_id
      AND brand_members.user_id = auth.uid()::uuid
    )
  );

-- Editors can create content
CREATE POLICY "Editors can create content"
  ON content
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brand_members
      WHERE brand_members.brand_id = content.brand_id
      AND brand_members.user_id = auth.uid()::uuid
      AND brand_members.role IN ('owner', 'admin', 'editor')
    )
  );

-- Editors can update their own content
CREATE POLICY "Editors can update content"
  ON content
  FOR UPDATE
  USING (
    created_by = auth.uid()::uuid OR
    EXISTS (
      SELECT 1 FROM brand_members
      WHERE brand_members.brand_id = content.brand_id
      AND brand_members.user_id = auth.uid()::uuid
      AND brand_members.role IN ('owner', 'admin')
    )
  );

-- Posts inherit content permissions
CREATE POLICY "Brand members can view posts"
  ON posts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM content
      JOIN brand_members ON brand_members.brand_id = content.brand_id
      WHERE content.id = posts.content_id
      AND brand_members.user_id = auth.uid()::uuid
    )
  );

-- Editors can create posts
CREATE POLICY "Editors can create posts"
  ON posts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM content
      JOIN brand_members ON brand_members.brand_id = content.brand_id
      WHERE content.id = posts.content_id
      AND brand_members.user_id = auth.uid()::uuid
      AND brand_members.role IN ('owner', 'admin', 'editor')
    )
  );

-- Approvers can view approvals
CREATE POLICY "Approvers can view approvals"
  ON post_approvals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM content
      JOIN brand_members ON brand_members.brand_id = content.brand_id
      WHERE content.id = post_approvals.content_id
      AND brand_members.user_id = auth.uid()::uuid
    )
  );

-- Admins can approve/reject posts
CREATE POLICY "Admins can manage approvals"
  ON post_approvals
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM content
      JOIN brand_members ON brand_members.brand_id = content.brand_id
      WHERE content.id = post_approvals.content_id
      AND brand_members.user_id = auth.uid()::uuid
      AND brand_members.role IN ('owner', 'admin')
    )
  );
