/**
 * Route Metadata System
 * Centralized configuration for route visibility, SEO, and access control
 */

export type RouteVisibility = 'public' | 'user' | 'client';

export interface RouteMetadata {
  path: string;
  visibility: RouteVisibility;
  title: string;
  description: string;
  noindex?: boolean;
  whiteLabel?: boolean;
  canonicalUrl?: string;
  ogImage?: string;
}

/**
 * Route metadata registry
 * Single source of truth for all route configurations
 */
export const ROUTE_METADATA: Record<string, RouteMetadata> = {
  // ========================================
  // PUBLIC ROUTES (Marketing & Legal)
  // Visibility: public | SEO: Indexable
  // ========================================
  '/': {
    path: '/',
    visibility: 'public',
    title: 'Aligned AI - AI-Powered Content Creation for Agencies & Brands',
    description: 'Transform your content workflow with AI. Aligned AI handles planning, writing, scheduling, and reporting so you can focus on what matters.',
    noindex: false,
  },
  '/about': {
    path: '/about',
    visibility: 'public',
    title: 'About Aligned AI - Built by Marketers, for Marketers',
    description: 'Learn about our mission to make content creation feel less like a grind and more like a superpower.',
    noindex: false,
  },
  '/features': {
    path: '/features',
    visibility: 'public',
    title: 'Features - AI Content, Scheduling & Analytics | Aligned AI',
    description: 'Explore AI content generation, smart scheduling, real-time analytics, collaboration tools, and more.',
    noindex: false,
  },
  '/integrations': {
    path: '/integrations',
    visibility: 'public',
    title: 'Integrations - Connect All Your Channels | Aligned AI',
    description: 'Integrate with Facebook, Instagram, LinkedIn, Twitter, TikTok, Google Business Profile, and more.',
    noindex: false,
  },
  '/help': {
    path: '/help',
    visibility: 'public',
    title: 'Help Center - Support & FAQs | Aligned AI',
    description: 'Find answers, explore resources, and get the most out of Aligned AI.',
    noindex: false,
  },
  '/contact': {
    path: '/contact',
    visibility: 'public',
    title: 'Contact Us - Get in Touch | Aligned AI',
    description: 'Have questions? Want a demo? We\'re here to help you get Aligned.',
    noindex: false,
  },
  '/privacy': {
    path: '/privacy',
    visibility: 'public',
    title: 'Privacy Policy | Aligned AI',
    description: 'Learn how we protect and handle your data at Aligned AI.',
    noindex: false,
  },
  '/terms': {
    path: '/terms',
    visibility: 'public',
    title: 'Terms of Service | Aligned AI',
    description: 'Read our terms of service and usage agreement.',
    noindex: false,
  },
  '/pricing': {
    path: '/pricing',
    visibility: 'public',
    title: 'Pricing - Simple, Scalable Plans | Aligned AI',
    description: 'Start at $199/mo per brand. Scale smarter with agency pricing. No hidden fees.',
    noindex: false,
  },

  // ========================================
  // USER ROUTES (Authenticated Internal App)
  // Visibility: user | SEO: No Index
  // ========================================
  '/onboarding': {
    path: '/onboarding',
    visibility: 'user',
    title: 'Onboarding - Get Started | Aligned AI',
    description: 'Set up your workspace and brand profile.',
    noindex: true,
  },
  '/dashboard': {
    path: '/dashboard',
    visibility: 'user',
    title: 'Dashboard | Aligned AI',
    description: 'Your content command center.',
    noindex: true,
  },
  '/calendar': {
    path: '/calendar',
    visibility: 'user',
    title: 'Content Calendar | Aligned AI',
    description: 'Plan and schedule your content.',
    noindex: true,
  },
  '/content-queue': {
    path: '/content-queue',
    visibility: 'user',
    title: 'Content Queue | Aligned AI',
    description: 'Manage pending and scheduled posts.',
    noindex: true,
  },
  '/approvals': {
    path: '/approvals',
    visibility: 'user',
    title: 'Approvals | Aligned AI',
    description: 'Review and approve content.',
    noindex: true,
  },
  '/creative-studio': {
    path: '/creative-studio',
    visibility: 'user',
    title: 'Creative Studio | Aligned AI',
    description: 'Design and edit your content.',
    noindex: true,
  },
  '/content-generator': {
    path: '/content-generator',
    visibility: 'user',
    title: 'Content Generator | Aligned AI',
    description: 'AI-powered content creation.',
    noindex: true,
  },
  '/campaigns': {
    path: '/campaigns',
    visibility: 'user',
    title: 'Campaigns | Aligned AI',
    description: 'Manage your marketing campaigns.',
    noindex: true,
  },
  '/brands': {
    path: '/brands',
    visibility: 'user',
    title: 'Brands | Aligned AI',
    description: 'Manage multiple brands.',
    noindex: true,
  },
  '/brand-intake': {
    path: '/brand-intake',
    visibility: 'user',
    title: 'Brand Intake | Aligned AI',
    description: 'Complete your brand profile.',
    noindex: true,
  },
  '/brand-guide': {
    path: '/brand-guide',
    visibility: 'user',
    title: 'Brand Guide | Aligned AI',
    description: 'Your brand voice and guidelines.',
    noindex: true,
  },
  '/brand-snapshot': {
    path: '/brand-snapshot',
    visibility: 'user',
    title: 'Brand Snapshot | Aligned AI',
    description: 'Brand overview and analysis.',
    noindex: true,
  },
  '/brand-intelligence': {
    path: '/brand-intelligence',
    visibility: 'user',
    title: 'Brand Intelligence | Aligned AI',
    description: 'AI positioning and brand score.',
    noindex: true,
  },
  '/analytics': {
    path: '/analytics',
    visibility: 'user',
    title: 'Analytics | Aligned AI',
    description: 'Performance insights and metrics.',
    noindex: true,
  },
  '/reporting': {
    path: '/reporting',
    visibility: 'user',
    title: 'Reporting | Aligned AI',
    description: 'Generate and export reports.',
    noindex: true,
  },
  '/paid-ads': {
    path: '/paid-ads',
    visibility: 'user',
    title: 'Paid Ads | Aligned AI',
    description: 'Manage your paid advertising.',
    noindex: true,
  },
  '/library': {
    path: '/library',
    visibility: 'user',
    title: 'Media Library | Aligned AI',
    description: 'Manage your assets and media.',
    noindex: true,
  },
  '/events': {
    path: '/events',
    visibility: 'user',
    title: 'Events | Aligned AI',
    description: 'Track content dates and events.',
    noindex: true,
  },
  '/reviews': {
    path: '/reviews',
    visibility: 'user',
    title: 'Reviews | Aligned AI',
    description: 'Manage customer reviews.',
    noindex: true,
  },
  '/linked-accounts': {
    path: '/linked-accounts',
    visibility: 'user',
    title: 'Linked Accounts | Aligned AI',
    description: 'Connect your social media accounts.',
    noindex: true,
  },
  '/settings': {
    path: '/settings',
    visibility: 'user',
    title: 'Settings | Aligned AI',
    description: 'Team, account, and preferences.',
    noindex: true,
  },
  '/client-settings': {
    path: '/client-settings',
    visibility: 'user',
    title: 'Client Settings | Aligned AI',
    description: 'Client access and preferences.',
    noindex: true,
  },
  '/billing': {
    path: '/billing',
    visibility: 'user',
    title: 'Billing | Aligned AI',
    description: 'Subscription and payments.',
    noindex: true,
  },

  // ========================================
  // CLIENT ROUTES (White-Label Portal)
  // Visibility: client | SEO: No Index
  // Token-based authentication required
  // ========================================
  '/client-portal': {
    path: '/client-portal',
    visibility: 'client',
    title: 'Client Portal',
    description: 'Review and approve your content.',
    noindex: true,
    whiteLabel: true,
  },
  '/client-portal/:token': {
    path: '/client-portal/:token',
    visibility: 'client',
    title: 'Client Portal Access',
    description: 'Accessing your client portal...',
    noindex: true,
    whiteLabel: true,
  },
};

/**
 * Get metadata for a given path
 */
export function getRouteMetadata(path: string): RouteMetadata | undefined {
  return ROUTE_METADATA[path];
}

/**
 * Get all routes by visibility
 */
export function getRoutesByVisibility(visibility: RouteVisibility): RouteMetadata[] {
  return Object.values(ROUTE_METADATA).filter(
    (route) => route.visibility === visibility
  );
}

/**
 * Get public routes for sitemap generation
 */
export function getPublicRoutes(): RouteMetadata[] {
  return getRoutesByVisibility('public');
}

/**
 * Check if a route should be indexed
 */
export function shouldIndexRoute(path: string): boolean {
  const metadata = getRouteMetadata(path);
  return metadata ? !metadata.noindex : false;
}
