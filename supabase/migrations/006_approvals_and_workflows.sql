-- ============================================================================
-- MIGRATION 006: Approvals & Workflow Management
-- Created: 2025-01-01
-- Description: Content approval workflows and automation
-- ============================================================================

-- Approval Requests Table
CREATE TABLE IF NOT EXISTS approval_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  requested_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  approval_level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- Approval Threads Table (Comment history on approvals)
CREATE TABLE IF NOT EXISTS approval_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  approval_request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  attachment_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workflow Templates Table (Automation templates)
CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  steps JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workflow Instances Table (Running workflows)
CREATE TABLE IF NOT EXISTS workflow_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE SET NULL,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  current_step INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workflow Step Results Table (Track individual step results)
CREATE TABLE IF NOT EXISTS workflow_step_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  step_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  result_data JSONB DEFAULT '{}',
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER
);

-- Approval Metadata Table (Extended approval info)
CREATE TABLE IF NOT EXISTS approval_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  approval_request_id UUID NOT NULL UNIQUE REFERENCES approval_requests(id) ON DELETE CASCADE,
  feedback_text TEXT,
  required_changes JSONB DEFAULT '[]',
  revision_count INTEGER DEFAULT 0,
  last_revised_at TIMESTAMP WITH TIME ZONE,
  sla_deadline TIMESTAMP WITH TIME ZONE,
  is_urgent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_approval_requests_brand_id ON approval_requests(brand_id);
CREATE INDEX idx_approval_requests_content_id ON approval_requests(content_id);
CREATE INDEX idx_approval_requests_status ON approval_requests(status);
CREATE INDEX idx_approval_requests_created_at ON approval_requests(created_at);
CREATE INDEX idx_approval_threads_approval_id ON approval_threads(approval_request_id);
CREATE INDEX idx_approval_threads_author_id ON approval_threads(author_id);
CREATE INDEX idx_workflow_templates_brand_id ON workflow_templates(brand_id);
CREATE INDEX idx_workflow_templates_is_active ON workflow_templates(is_active);
CREATE INDEX idx_workflow_instances_brand_id ON workflow_instances(brand_id);
CREATE INDEX idx_workflow_instances_content_id ON workflow_instances(content_id);
CREATE INDEX idx_workflow_instances_status ON workflow_instances(status);
CREATE INDEX idx_workflow_instances_created_at ON workflow_instances(created_at);
CREATE INDEX idx_workflow_step_results_workflow_id ON workflow_step_results(workflow_instance_id);
CREATE INDEX idx_workflow_step_results_status ON workflow_step_results(status);
CREATE INDEX idx_approval_metadata_approval_id ON approval_metadata(approval_request_id);

-- Triggers
CREATE TRIGGER update_approval_requests_updated_at
BEFORE UPDATE ON approval_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_workflow_templates_updated_at
BEFORE UPDATE ON workflow_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_approval_threads_updated_at
BEFORE UPDATE ON approval_threads
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_approval_metadata_updated_at
BEFORE UPDATE ON approval_metadata
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS)
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_step_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_metadata ENABLE ROW LEVEL SECURITY;

-- Brand members can view approval requests
CREATE POLICY "Brand members can view approvals"
  ON approval_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brand_members
      WHERE brand_members.brand_id = approval_requests.brand_id
      AND brand_members.user_id = auth.uid()::uuid
    )
  );

-- Users can create approval requests
CREATE POLICY "Members can create approval requests"
  ON approval_requests
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brand_members
      WHERE brand_members.brand_id = approval_requests.brand_id
      AND brand_members.user_id = auth.uid()::uuid
      AND brand_members.role IN ('owner', 'admin', 'editor')
    )
  );

-- Admins can approve/reject
CREATE POLICY "Admins can resolve approvals"
  ON approval_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM brand_members
      WHERE brand_members.brand_id = approval_requests.brand_id
      AND brand_members.user_id = auth.uid()::uuid
      AND brand_members.role IN ('owner', 'admin')
    )
  );

-- Members can comment on approvals
CREATE POLICY "Members can view approval threads"
  ON approval_threads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM approval_requests
      JOIN brand_members ON brand_members.brand_id = approval_requests.brand_id
      WHERE approval_requests.id = approval_threads.approval_request_id
      AND brand_members.user_id = auth.uid()::uuid
    )
  );

-- Members can post approval comments
CREATE POLICY "Members can post approval comments"
  ON approval_threads
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM approval_requests
      JOIN brand_members ON brand_members.brand_id = approval_requests.brand_id
      WHERE approval_requests.id = approval_threads.approval_request_id
      AND brand_members.user_id = auth.uid()::uuid
      AND author_id = auth.uid()::uuid
    )
  );

-- Brand admins can view workflow templates
CREATE POLICY "Admins can view workflow templates"
  ON workflow_templates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brand_members
      WHERE brand_members.brand_id = workflow_templates.brand_id
      AND brand_members.user_id = auth.uid()::uuid
      AND brand_members.role IN ('owner', 'admin')
    )
  );

-- Brand admins can manage workflow templates
CREATE POLICY "Admins can manage workflow templates"
  ON workflow_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM brand_members
      WHERE brand_members.brand_id = workflow_templates.brand_id
      AND brand_members.user_id = auth.uid()::uuid
      AND brand_members.role IN ('owner', 'admin')
    )
  );

-- Brand members can view workflow instances
CREATE POLICY "Members can view workflow instances"
  ON workflow_instances
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brand_members
      WHERE brand_members.brand_id = workflow_instances.brand_id
      AND brand_members.user_id = auth.uid()::uuid
    )
  );

-- System can manage workflow instances
CREATE POLICY "System can manage workflow instances"
  ON workflow_instances
  FOR ALL
  USING (
    auth.uid()::text = '00000000-0000-0000-0000-000000000000'
    OR EXISTS (
      SELECT 1 FROM brand_members
      WHERE brand_members.brand_id = workflow_instances.brand_id
      AND brand_members.user_id = auth.uid()::uuid
      AND brand_members.role IN ('owner', 'admin')
    )
  );
