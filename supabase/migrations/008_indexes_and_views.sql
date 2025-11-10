-- ============================================================================
-- MIGRATION 008: Performance Indexes & Useful Views
-- Created: 2025-01-01
-- Description: Composite indexes and database views for common queries
-- ============================================================================

-- Composite indexes for common query patterns
CREATE INDEX idx_content_brand_status_created ON content(brand_id, status, created_at DESC);
CREATE INDEX idx_posts_content_platform_status ON posts(content_id, platform, status);
CREATE INDEX idx_brand_members_brand_role ON brand_members(brand_id, role);
CREATE INDEX idx_approval_requests_brand_status ON approval_requests(brand_id, status, created_at DESC);
CREATE INDEX idx_platform_connections_brand_active ON platform_connections(brand_id, is_active);
CREATE INDEX idx_analytics_data_brand_date_platform ON analytics_data(brand_id, date DESC, platform);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_audit_logs_brand_timestamp ON audit_logs(brand_id, created_at DESC);

-- Useful database views

-- View: Brand Analytics Summary
CREATE OR REPLACE VIEW v_brand_analytics_summary AS
SELECT
  b.id as brand_id,
  b.name as brand_name,
  COUNT(DISTINCT am.platform) as connected_platforms,
  COUNT(DISTINCT c.id) as total_content,
  SUM(CASE WHEN c.status = 'published' THEN 1 ELSE 0 END) as published_content,
  MAX(am.recorded_at) as last_metrics_update
FROM brands b
LEFT JOIN platform_connections pc ON pc.brand_id = b.id AND pc.is_active = TRUE
LEFT JOIN analytics_metrics am ON am.brand_id = b.id
LEFT JOIN content c ON c.brand_id = b.id
GROUP BY b.id, b.name;

-- View: Pending Approvals by Brand
CREATE OR REPLACE VIEW v_pending_approvals AS
SELECT
  b.id as brand_id,
  b.name as brand_name,
  ar.id as approval_id,
  ar.content_id,
  c.title as content_title,
  ar.requested_by,
  up.email as requester_email,
  ar.created_at,
  EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - ar.created_at))/3600 as hours_pending
FROM approval_requests ar
JOIN brands b ON b.id = ar.brand_id
JOIN content c ON c.id = ar.content_id
JOIN user_profiles up ON up.id = ar.requested_by
WHERE ar.status = 'pending'
ORDER BY ar.created_at ASC;

-- View: Content Publishing Status
CREATE OR REPLACE VIEW v_content_publishing_status AS
SELECT
  c.id as content_id,
  c.brand_id,
  c.title,
  c.status,
  COUNT(p.id) as total_platforms,
  COUNT(CASE WHEN p.status = 'published' THEN 1 END) as published_platforms,
  COUNT(CASE WHEN p.status = 'failed' THEN 1 END) as failed_platforms,
  MAX(p.published_at) as last_published_at
FROM content c
LEFT JOIN posts p ON p.content_id = c.id
GROUP BY c.id, c.brand_id, c.title, c.status;

-- View: User Activity
CREATE OR REPLACE VIEW v_user_activity AS
SELECT
  up.id as user_id,
  up.email,
  up.first_name,
  up.last_name,
  COUNT(DISTINCT bm.brand_id) as brands_managed,
  MAX(al.created_at) as last_activity,
  COUNT(DISTINCT al.id) as total_actions
FROM user_profiles up
LEFT JOIN brand_members bm ON bm.user_id = up.id
LEFT JOIN audit_logs al ON al.user_id = up.id AND al.created_at > CURRENT_TIMESTAMP - INTERVAL '30 days'
WHERE up.is_active = TRUE
GROUP BY up.id, up.email, up.first_name, up.last_name;

-- View: Sync Health
CREATE OR REPLACE VIEW v_sync_health AS
SELECT
  asl.brand_id,
  b.name as brand_name,
  asl.platform,
  asl.status,
  asl.completed_at,
  EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - asl.completed_at))/3600 as hours_since_sync,
  asl.records_synced,
  CASE
    WHEN asl.completed_at IS NULL THEN 'In Progress'
    WHEN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - asl.completed_at))/3600 > 24 THEN 'Stale'
    ELSE 'Current'
  END as sync_status
FROM analytics_sync_logs asl
JOIN brands b ON b.id = asl.brand_id
WHERE asl.started_at > CURRENT_TIMESTAMP - INTERVAL '30 days'
ORDER BY asl.completed_at DESC;

-- View: Workflow Completion Rate
CREATE OR REPLACE VIEW v_workflow_completion_rate AS
SELECT
  wt.brand_id,
  b.name as brand_name,
  wt.id as template_id,
  wt.name as template_name,
  COUNT(wi.id) as total_runs,
  COUNT(CASE WHEN wi.status = 'completed' THEN 1 END) as completed_runs,
  COUNT(CASE WHEN wi.status = 'failed' THEN 1 END) as failed_runs,
  ROUND(100.0 * COUNT(CASE WHEN wi.status = 'completed' THEN 1 END) / NULLIF(COUNT(wi.id), 0), 2) as completion_rate
FROM workflow_templates wt
LEFT JOIN workflow_instances wi ON wi.template_id = wt.id
LEFT JOIN brands b ON b.id = wt.brand_id
GROUP BY wt.brand_id, b.name, wt.id, wt.name;

-- View: Client Portal Activity
CREATE OR REPLACE VIEW v_client_portal_activity AS
SELECT
  cs.brand_id,
  b.name as brand_name,
  up.id as client_id,
  up.email as client_email,
  COUNT(DISTINCT cc.id) as comments_made,
  COUNT(DISTINCT cm.id) as media_uploaded,
  MAX(cc.created_at) as last_comment_date,
  MAX(cm.uploaded_at) as last_upload_date
FROM client_settings cs
JOIN user_profiles up ON up.id = cs.client_id
JOIN brands b ON b.id = cs.brand_id
LEFT JOIN client_comments cc ON cc.client_id = up.id
LEFT JOIN client_media cm ON cm.client_id = up.id
WHERE cs.client_id = up.id
GROUP BY cs.brand_id, b.name, up.id, up.email;

-- Materialized View: Daily Analytics Summary (refresh hourly)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_analytics_summary AS
SELECT
  DATE(recorded_at) as date,
  brand_id,
  platform,
  metric_type,
  COUNT(*) as record_count,
  AVG(value) as avg_value,
  MAX(value) as max_value,
  MIN(value) as min_value,
  SUM(value) as total_value
FROM analytics_data
WHERE recorded_at > CURRENT_TIMESTAMP - INTERVAL '365 days'
GROUP BY DATE(recorded_at), brand_id, platform, metric_type;

-- Create index on materialized view
CREATE INDEX idx_mv_daily_analytics ON mv_daily_analytics_summary(brand_id, date DESC, platform);

-- View: Request Status Summary
CREATE OR REPLACE VIEW v_request_status_summary AS
SELECT
  b.id as brand_id,
  b.name as brand_name,
  COUNT(ar.id) as total_approval_requests,
  COUNT(CASE WHEN ar.status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN ar.status = 'approved' THEN 1 END) as approved,
  COUNT(CASE WHEN ar.status = 'rejected' THEN 1 END) as rejected,
  COUNT(CASE WHEN ar.status = 'changes_requested' THEN 1 END) as changes_requested,
  ROUND(100.0 * COUNT(CASE WHEN ar.status = 'approved' THEN 1 END) / NULLIF(COUNT(ar.id), 0), 2) as approval_rate
FROM brands b
LEFT JOIN approval_requests ar ON ar.brand_id = b.id
GROUP BY b.id, b.name;

-- Grant view permissions (configure as needed)
GRANT SELECT ON v_brand_analytics_summary TO authenticated;
GRANT SELECT ON v_pending_approvals TO authenticated;
GRANT SELECT ON v_content_publishing_status TO authenticated;
GRANT SELECT ON v_user_activity TO authenticated;
GRANT SELECT ON v_sync_health TO authenticated;
GRANT SELECT ON v_workflow_completion_rate TO authenticated;
GRANT SELECT ON v_client_portal_activity TO authenticated;
GRANT SELECT ON mv_daily_analytics_summary TO authenticated;
GRANT SELECT ON v_request_status_summary TO authenticated;
