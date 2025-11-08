# Supabase Migrations

This directory contains all database migrations for the Aligned AI platform. Migrations are SQL scripts that define the database schema and are executed in order to set up and maintain the database structure.

## Migration Naming Convention

Migrations follow the naming pattern: `YYYYMMDD_description_here.sql`

Example: `20250108_create_client_settings_table.sql`

This ensures migrations are executed in chronological order.

## Core Tables

### 1. client_settings
**File:** `20250108_create_client_settings_table.sql`

**Purpose:** Manages client email preferences, notification settings, and account preferences.

**Key Fields:**
- `client_id` (VARCHAR): Unique identifier for the client
- `brand_id` (VARCHAR): Brand/tenant identifier for multi-tenancy
- `email_preferences` (JSONB): Nested email notification preferences
- `timezone` (VARCHAR): Client's timezone setting
- `language` (VARCHAR): Client's language preference
- `unsubscribe_token` (VARCHAR): Token for unsubscribe links
- `unsubscribed_from_all` (BOOLEAN): Whether client unsubscribed from all emails
- `unsubscribed_types` (TEXT[]): Array of notification types user unsubscribed from

**Features:**
- Multi-tenant isolation via brand_id
- Unique constraint on (client_id, brand_id) combination
- Automatic updated_at timestamp management
- Row-level security policies for data isolation
- Full-text search indexes on common query fields

**Email Preferences Structure:**
```json
{
  "approvalsNeeded": true,
  "approvalReminders": true,
  "publishFailures": true,
  "publishSuccess": false,
  "weeklyDigest": false,
  "dailyDigest": false,
  "reminderFrequency": "24h",
  "digestFrequency": "weekly",
  "maxEmailsPerDay": 20
}
```

## Existing Tables

The following tables are referenced by the application but may already exist in your Supabase project:

### Database Services Tables

**Media Management:**
- `media_assets` - Media files and metadata
- `media_storage_quota` - Storage quota tracking per brand

**Integrations:**
- `platform_connections` - OAuth and platform integration connections
- `integration_sync_events` - Sync event tracking

**User Preferences:**
- `user_preferences` - User settings per brand

**Branding:**
- `white_label_configs` - Agency branding configurations

**Approvals & Workflow:**
- `approval_requests` - Approval workflow requests
- `post_approvals` - Post approval status
- `workflow_templates` - Approval workflow templates
- `workflow_instances` - Active workflow instances
- `workflow_notifications` - Workflow notifications

**Content & Comments:**
- `content` - Main content records
- `content_comments` - Comments on content
- `client_media` - Client-uploaded media

**Analytics & Audit:**
- `brand_analytics` - Brand metrics and analytics
- `audit_logs` - Audit trail for all operations

## Applying Migrations

### Supabase Dashboard

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy and paste the migration SQL
4. Execute the query
5. Verify the table was created successfully

### Using Supabase CLI

```bash
# Create a new migration
supabase migration new create_client_settings_table

# Apply all pending migrations
supabase db push

# Pull latest schema from remote
supabase db pull
```

### Manual PostgreSQL Connection

```bash
# Connect to your Supabase PostgreSQL database
psql "postgresql://[user]:[password]@[host]:[port]/[database]"

# Execute the migration file
\i 20250108_create_client_settings_table.sql
```

## Migration Checklist

Before deploying a new migration:

- [ ] Migration has chronological naming (YYYYMMDD)
- [ ] SQL is properly formatted and commented
- [ ] Indexes created for performance
- [ ] Row-level security (RLS) policies defined
- [ ] Update triggers set for timestamp columns
- [ ] Foreign keys properly defined
- [ ] Constraints added for data integrity
- [ ] Table comments document purpose
- [ ] Column comments explain complex fields

## Rollback Strategy

Supabase doesn't support automatic rollbacks, but you can:

1. **Drop table** (if needed):
```sql
DROP TABLE IF EXISTS public.client_settings;
```

2. **Drop and recreate**:
```sql
DROP TABLE IF EXISTS public.client_settings CASCADE;
-- Re-run the migration
```

3. **Data preservation**:
```sql
-- Backup data before migrations
CREATE TABLE client_settings_backup AS SELECT * FROM client_settings;

-- Restore if needed
TRUNCATE client_settings;
INSERT INTO client_settings SELECT * FROM client_settings_backup;
```

## Performance Considerations

All migrations include:
- **Indexes** on frequently queried columns
- **Unique constraints** to prevent duplicates
- **Check constraints** to enforce data validity
- **Composite indexes** for multi-column queries
- **JSONB** for flexible nested structures

## Security Considerations

All tables include:
- **Row-level security (RLS)** for multi-tenancy
- **Brand isolation** via brand_id field
- **Timestamp tracking** (created_at, updated_at)
- **Audit logging** for compliance
- **User attribution** (last_modified_by)

## Testing Migrations

After applying a migration:

```sql
-- Test table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'client_settings'
);

-- Test indexes
SELECT * FROM pg_indexes WHERE tablename = 'client_settings';

-- Test RLS policies
SELECT * FROM pg_policies WHERE tablename = 'client_settings';

-- Test data insertion
INSERT INTO client_settings (client_id, brand_id)
VALUES ('test-client', 'test-brand');

-- Verify automatic timestamp
SELECT created_at, updated_at FROM client_settings
WHERE client_id = 'test-client';
```

## Troubleshooting

**"Table already exists" error:**
- Migration includes `IF NOT EXISTS` clause
- Safe to re-run without errors

**"Column type mismatch" error:**
- Check existing schema for type compatibility
- May need to add/modify columns separately

**"RLS policy conflicts" error:**
- Drop existing policies before re-creating
- Ensure policy names are unique

**Performance issues after migration:**
- Verify all indexes were created
- Run `ANALYZE` to update table statistics
- Check query plans with `EXPLAIN ANALYZE`

## Resources

- [Supabase Migrations Documentation](https://supabase.com/docs/guides/migrations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
