import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Brand = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  website_url: string | null;
  industry: string | null;
  description: string | null;
  tone_keywords: string[] | null;
  compliance_rules: string | null;
  brand_kit?: any;
  voice_summary?: any;
  visual_summary?: any;
  created_at: string;
  updated_at: string;
};

export type BrandMember = {
  id: string;
  brand_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'manager' | 'creator' | 'approver' | 'viewer';
  created_at: string;
};

export type ContentItem = {
  id: string;
  brand_id: string;
  title: string;
  content_type: 'post' | 'blog' | 'email' | 'caption';
  platform: string | null;
  body: string | null;
  media_urls: string[] | null;
  scheduled_for: string | null;
  status: 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected';
  generated_by_agent: string | null;
  created_by: string | null;
  approved_by: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ApprovalThread = {
  id: string;
  content_item_id: string;
  user_id: string | null;
  comment: string;
  action: 'comment' | 'request_changes' | 'approve' | 'reject' | null;
  created_at: string;
};

export type Asset = {
  id: string;
  brand_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size_bytes: number | null;
  tags: string[] | null;
  uploaded_by: string | null;
  created_at: string;
};

export type AnalyticsMetric = {
  id: string;
  content_item_id: string;
  platform: string;
  impressions: number;
  reach: number;
  engagements: number;
  clicks: number;
  shares: number;
  comments: number;
  likes: number;
  recorded_at: string;
};
