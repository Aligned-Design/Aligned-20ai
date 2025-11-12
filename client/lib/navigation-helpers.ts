/**
 * Navigation Helpers
 * Utilities for filtering and displaying routes based on visibility and permissions
 */

import type { RouteVisibility } from './route-metadata';
import { ROUTE_METADATA } from './route-metadata';

export interface NavItem {
  path: string;
  label: string;
  icon?: string;
  description?: string;
  requiredScope?: string;
}

/**
 * Navigation configuration for different visibility contexts
 */
export const NAV_CONFIGS: Record<RouteVisibility, NavItem[]> = {
  public: [
    { path: '/', label: 'Home' },
    { path: '/features', label: 'Features' },
    { path: '/integrations', label: 'Integrations' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/help', label: 'Help' },
    { path: '/contact', label: 'Contact' },
  ],
  user: [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/creative-studio', label: 'Creative Studio', icon: '✨', requiredScope: 'content:create' },
    { path: '/content-queue', label: 'Content Queue', icon: '📝', requiredScope: 'content:view' },
    { path: '/approvals', label: 'Approvals', icon: '✓', requiredScope: 'approval:view' },
    { path: '/campaigns', label: 'Campaigns', icon: '📢', requiredScope: 'campaign:view' },
    { path: '/analytics', label: 'Analytics', icon: '📈', requiredScope: 'analytics:view' },
    { path: '/calendar', label: 'Calendar', icon: '📅', requiredScope: 'content:view' },
    { path: '/brand-guide', label: 'Brand Guide', icon: '🎨', requiredScope: 'brand:view' },
    { path: '/library', label: 'Library', icon: '📚', requiredScope: 'media:view' },
    { path: '/brands', label: 'Brands', icon: '🏢', requiredScope: 'brand:manage' },
    { path: '/reporting', label: 'Reporting', icon: '📋', requiredScope: 'analytics:view' },
    { path: '/linked-accounts', label: 'Linked Accounts', icon: '🔗', requiredScope: 'integration:manage' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ],
  client: [
    { path: '/client-portal', label: 'Overview', icon: '📊' },
  ],
};

/**
 * Get navigation items for a specific visibility level
 */
export function getNavItems(visibility: RouteVisibility): NavItem[] {
  return NAV_CONFIGS[visibility];
}

/**
 * Filter navigation items by user permissions
 * @param items - Navigation items to filter
 * @param canCheck - Permission checker function from useCan()
 */
export function filterNavByPermissions(
  items: NavItem[],
  canCheck: (scope: string) => boolean
): NavItem[] {
  return items.filter((item) => {
    if (!item.requiredScope) return true;
    return canCheck(item.requiredScope);
  });
}

/**
 * Get all routes for a specific visibility level from metadata
 */
export function getRoutesByVisibility(visibility: RouteVisibility) {
  return Object.values(ROUTE_METADATA).filter(
    (route) => route.visibility === visibility
  );
}

/**
 * Check if a route is accessible based on visibility and auth status
 */
export function isRouteAccessible(
  path: string,
  isAuthenticated: boolean,
  isClient: boolean = false
): boolean {
  const metadata = ROUTE_METADATA[path];
  if (!metadata) return false;

  switch (metadata.visibility) {
    case 'public':
      return true;
    case 'user':
      return isAuthenticated && !isClient;
    case 'client':
      return isAuthenticated && isClient;
    default:
      return false;
  }
}

/**
 * Get appropriate navigation items based on user context
 */
export function getContextualNavItems(options: {
  isAuthenticated: boolean;
  isClient: boolean;
  canCheck?: (scope: string) => boolean;
}): NavItem[] {
  const { isAuthenticated, isClient, canCheck } = options;

  if (!isAuthenticated) {
    return getNavItems('public');
  }

  if (isClient) {
    return getNavItems('client');
  }

  const userItems = getNavItems('user');
  if (canCheck) {
    return filterNavByPermissions(userItems, canCheck);
  }

  return userItems;
}
