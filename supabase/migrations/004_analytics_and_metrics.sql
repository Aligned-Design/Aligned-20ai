-- ============================================================================
-- MIGRATION 004: Analytics & Metrics Tracking
-- Created: 2025-01-01
-- Description: Real-time analytics sync and metrics collection
-- ============================================================================

-- Analytics Data Table (Raw metrics)
CREATE TABLE IF NOT EXISTS analytics_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  metric_type VARCHAR(100) NOT NULL,
  value NUMERIC NOT NULL,
  date DATE NOT NULL,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analytics Metrics Table (Aggregated metrics)
CREATE TABLE IF NOT EXISTS analytics_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  current_value NUMERIC NOT NULL,
  previous_value NUMERIC,
  change_percentage NUMERIC,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sync Events Table (Async sync tracking)
CREATE TABLE IF NOT EXISTS sync_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  sync_id VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('started', 'progress', 'completed', 'failed')),
  status VARCHAR(100),
  progress INTEGER DEFAULT 0,
  records_processed INTEGER,
  total_records INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analytics Sync Logs Table (Audit trail for sync operations)
CREATE TABLE IF NOT EXISTS analytics_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  sync_id VARCHAR(255) NOT NULL UNIQUE,
  platform VARCHAR(50) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
  records_synced INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_analytics_data_brand_id ON analytics_data(brand_id);
CREATE INDEX idx_analytics_data_platform ON analytics_data(platform);
CREATE INDEX idx_analytics_data_metric_type ON analytics_data(metric_type);
CREATE INDEX idx_analytics_data_date ON analytics_data(date);
CREATE INDEX idx_analytics_data_recorded_at ON analytics_data(recorded_at);
CREATE INDEX idx_analytics_metrics_brand_id ON analytics_metrics(brand_id);
CREATE INDEX idx_analytics_metrics_platform ON analytics_metrics(platform);
CREATE INDEX idx_analytics_metrics_metric_name ON analytics_metrics(metric_name);
CREATE INDEX idx_sync_events_brand_id ON sync_events(brand_id);
CREATE INDEX idx_sync_events_sync_id ON sync_events(sync_id);
CREATE INDEX idx_sync_events_platform ON sync_events(platform);
CREATE INDEX idx_sync_events_created_at ON sync_events(created_at);
CREATE INDEX idx_analytics_sync_logs_brand_id ON analytics_sync_logs(brand_id);
CREATE INDEX idx_analytics_sync_logs_platform ON analytics_sync_logs(platform);
CREATE INDEX idx_analytics_sync_logs_status ON analytics_sync_logs(status);

-- Function to archive old analytics data
CREATE OR REPLACE FUNCTION archive_old_analytics()
RETURNS void AS $$
BEGIN
  DELETE FROM analytics_data
  WHERE recorded_at < CURRENT_TIMESTAMP - INTERVAL '90 days';

  DELETE FROM sync_events
  WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS)
ALTER TABLE analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sync_logs ENABLE ROW LEVEL SECURITY;

-- Brand members can view analytics data
CREATE POLICY "Brand members can view analytics"
  ON analytics_data
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brand_members
      WHERE brand_members.brand_id = analytics_data.brand_id
      AND brand_members.user_id = auth.uid()::uuid
    )
  );

-- Only admins can write analytics data
CREATE POLICY "Admins can write analytics"
  ON analytics_data
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brand_members
      WHERE brand_members.brand_id = analytics_data.brand_id
      AND brand_members.user_id = auth.uid()::uuid
      AND brand_members.role IN ('owner', 'admin')
    )
  );

-- Brand members can view metrics
CREATE POLICY "Brand members can view metrics"
  ON analytics_metrics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brand_members
      WHERE brand_members.brand_id = analytics_metrics.brand_id
      AND brand_members.user_id = auth.uid()::uuid
    )
  );

-- Admins can write metrics
CREATE POLICY "Admins can write metrics"
  ON analytics_metrics
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brand_members
      WHERE brand_members.brand_id = analytics_metrics.brand_id
      AND brand_members.user_id = auth.uid()::uuid
      AND brand_members.role IN ('owner', 'admin')
    )
  );

-- Brand members can view sync events
CREATE POLICY "Brand members can view sync events"
  ON sync_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brand_members
      WHERE brand_members.brand_id = sync_events.brand_id
      AND brand_members.user_id = auth.uid()::uuid
    )
  );

-- Admins can create sync events
CREATE POLICY "Admins can create sync events"
  ON sync_events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brand_members
      WHERE brand_members.brand_id = sync_events.brand_id
      AND brand_members.user_id = auth.uid()::uuid
      AND brand_members.role IN ('owner', 'admin')
    )
  );

-- Brand members can view sync logs
CREATE POLICY "Brand members can view sync logs"
  ON analytics_sync_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brand_members
      WHERE brand_members.brand_id = analytics_sync_logs.brand_id
      AND brand_members.user_id = auth.uid()::uuid
    )
  );

-- Admins can create/update sync logs
CREATE POLICY "Admins can manage sync logs"
  ON analytics_sync_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM brand_members
      WHERE brand_members.brand_id = analytics_sync_logs.brand_id
      AND brand_members.user_id = auth.uid()::uuid
      AND brand_members.role IN ('owner', 'admin')
    )
  );
