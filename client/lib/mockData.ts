/**
 * Mock Data Provider for Demo Mode
 * Bypasses Supabase auth failures to enable immediate demo/testing
 * Toggle via VITE_DEMO_MODE=true
 */

import type { Brand, ContentItem } from './supabase';

export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export const mockUser = {
  id: 'demo-user-123',
  email: 'demo@aligned-by-design.com',
  name: 'Demo User',
  role: 'admin' as const,
  created_at: '2025-01-01T00:00:00Z',
};

export const mockBrands: Brand[] = [
  {
    id: 'brand-1',
    name: 'Acme Corp',
    slug: 'acme-corp',
    logo_url: 'https://via.placeholder.com/150',
    primary_color: '#3B82F6',
    website_url: 'https://acme.example.com',
    industry: 'Technology',
    description: 'Leading technology solutions provider',
    tone_keywords: ['professional', 'innovative', 'trustworthy'],
    compliance_rules: 'Follow brand guidelines',
    brand_kit: {
      toneKeywords: ['professional', 'innovative'],
      brandPersonality: 'Modern and approachable',
      writingStyle: 'Clear and concise',
      primaryAudience: 'B2B technology buyers',
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      fontFamily: 'Inter',
      fontWeights: ['400', '600', '700'],
      platformsUsed: ['LinkedIn', 'Twitter', 'Instagram'],
      postFrequency: 'Daily',
      preferredContentTypes: ['Blog posts', 'Case studies', 'Infographics'],
      approvalWorkflow: 'Manager → Director → Publish',
      wordsToAvoid: ['cheap', 'best', 'revolutionary'],
      socialHandles: {
        twitter: '@acmecorp',
        linkedin: 'acme-corp',
        instagram: '@acmecorp'
      }
    },
    voice_summary: {
      tone: 'Professional yet approachable',
      style: 'Clear, concise, action-oriented'
    },
    visual_summary: {
      colors: ['#3B82F6', '#10B981', '#F59E0B'],
      fonts: ['Inter']
    },
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'brand-2',
    name: 'GreenLeaf Organics',
    slug: 'greenleaf-organics',
    logo_url: 'https://via.placeholder.com/150',
    primary_color: '#10B981',
    website_url: 'https://greenleaf.example.com',
    industry: 'Organic Food & Wellness',
    description: 'Sustainable organic products',
    tone_keywords: ['natural', 'authentic', 'sustainable'],
    compliance_rules: 'Organic certification language',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

export const mockContent: ContentItem[] = [
  {
    id: 'content-1',
    brand_id: 'brand-1',
    title: '5 Ways AI is Transforming Business',
    content_type: 'post',
    platform: 'LinkedIn',
    body: 'Discover how artificial intelligence is revolutionizing the way businesses operate...',
    media_urls: ['https://via.placeholder.com/600x400'],
    scheduled_for: '2025-11-15T10:00:00Z',
    status: 'pending_review',
    generated_by_agent: 'ai-content-gen-v1',
    created_by: 'demo-user-123',
    approved_by: null,
    published_at: null,
    created_at: '2025-11-12T08:00:00Z',
    updated_at: '2025-11-12T08:00:00Z',
  },
  {
    id: 'content-2',
    brand_id: 'brand-1',
    title: 'Customer Success Story: Acme & TechCo',
    content_type: 'blog',
    platform: null,
    body: 'Learn how TechCo increased productivity by 300% using our solutions...',
    media_urls: [],
    scheduled_for: '2025-11-16T14:00:00Z',
    status: 'approved',
    generated_by_agent: null,
    created_by: 'demo-user-123',
    approved_by: 'approver-456',
    published_at: null,
    created_at: '2025-11-10T10:00:00Z',
    updated_at: '2025-11-12T09:00:00Z',
  },
  {
    id: 'content-3',
    brand_id: 'brand-2',
    title: 'Organic Farming Tips for Beginners',
    content_type: 'post',
    platform: 'Instagram',
    body: '🌱 Start your organic garden today! Here are our top tips...',
    media_urls: ['https://via.placeholder.com/600x600'],
    scheduled_for: null,
    status: 'draft',
    generated_by_agent: null,
    created_by: 'demo-user-123',
    approved_by: null,
    published_at: null,
    created_at: '2025-11-12T11:00:00Z',
    updated_at: '2025-11-12T11:00:00Z',
  },
];

export const mockAnalytics = {
  impressions: 45200,
  reach: 32400,
  engagements: 3840,
  clicks: 1280,
  shares: 245,
  comments: 89,
  likes: 2106,
};

export const mockDashboardData = {
  postsPublished: 24,
  pendingApprovals: 7,
  totalImpressions: 45200,
  engagementRate: 8.5,
  activeUsers: 12450,
  pastDueUsers: 3,
  archivedUsers: 127,
  totalRevenue: 187600,
  lostRevenue: 4200,
};

// Mock API responses
export async function mockFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  console.log('[DEMO MODE] Mocking fetch:', endpoint);
  
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  
  if (endpoint.includes('/brands')) {
    return new Response(JSON.stringify({ data: mockBrands, error: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  if (endpoint.includes('/content')) {
    return new Response(JSON.stringify({ data: mockContent, error: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  if (endpoint.includes('/analytics')) {
    return new Response(JSON.stringify({ data: mockAnalytics, error: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // Default mock response
  return new Response(JSON.stringify({ data: {}, error: null }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function isDemoMode(): boolean {
  return DEMO_MODE;
}
