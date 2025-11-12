/**
 * Domain Detection Utility
 * Detects current domain and determines app context (public, app, portal)
 */

export type DomainContext = 'public' | 'app' | 'portal';

export interface DomainConfig {
  context: DomainContext;
  domain: string;
  isProduction: boolean;
  isWhiteLabel: boolean;
}

/**
 * Get current domain context
 */
export function getDomainContext(): DomainConfig {
  const hostname = window.location.hostname;
  const isProduction = !hostname.includes('localhost') && !hostname.includes('127.0.0.1');

  // Production domain detection
  if (isProduction) {
    // Public marketing site
    if (hostname === 'www.aligned-bydesign.com' || hostname === 'aligned-bydesign.com') {
      return {
        context: 'public',
        domain: hostname,
        isProduction: true,
        isWhiteLabel: false,
      };
    }

    // App subdomain
    if (hostname === 'app.aligned-bydesign.com') {
      return {
        context: 'app',
        domain: hostname,
        isProduction: true,
        isWhiteLabel: false,
      };
    }

    // Client portal subdomains or custom domains
    if (hostname.includes('portal.aligned-bydesign.com') || isCustomDomain(hostname)) {
      return {
        context: 'portal',
        domain: hostname,
        isProduction: true,
        isWhiteLabel: isCustomDomain(hostname),
      };
    }
  }

  // Development/localhost - default to app context
  return {
    context: 'app',
    domain: hostname,
    isProduction: false,
    isWhiteLabel: false,
  };
}

/**
 * Check if domain is a custom white-label domain
 */
function isCustomDomain(hostname: string): boolean {
  // Custom domains are anything NOT aligned-bydesign.com
  return !hostname.includes('aligned-bydesign.com');
}

/**
 * Get base URL for current domain context
 */
export function getBaseUrl(): string {
  const config = getDomainContext();
  
  if (!config.isProduction) {
    return window.location.origin;
  }

  switch (config.context) {
    case 'public':
      return 'https://www.aligned-bydesign.com';
    case 'app':
      return 'https://app.aligned-bydesign.com';
    case 'portal':
      return `https://${config.domain}`;
    default:
      return window.location.origin;
  }
}

/**
 * Check if current route is allowed on current domain
 */
export function isRouteAllowedOnDomain(routePath: string): boolean {
  const { context } = getDomainContext();

  // Import route metadata to check visibility
  // This is a simple check - can be enhanced with route metadata
  
  // Public domain: only show public routes
  if (context === 'public') {
    const publicRoutes = ['/', '/about', '/features', '/integrations', '/help', '/contact', '/privacy', '/terms', '/pricing'];
    return publicRoutes.includes(routePath);
  }

  // App domain: show all user routes (but not public marketing)
  if (context === 'app') {
    const publicRoutes = ['/', '/about', '/features', '/integrations', '/help', '/contact', '/privacy', '/terms', '/pricing'];
    // Allow all routes except standalone public pages on app domain
    // Users on app domain should see the app, not marketing pages
    return !publicRoutes.includes(routePath) || routePath === '/';
  }

  // Portal domain: only show client portal routes
  if (context === 'portal') {
    return routePath.startsWith('/client-portal');
  }

  return true;
}

/**
 * Get canonical URL for current page
 */
export function getCanonicalUrl(path: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path}`;
}

/**
 * Check if we're in white-label mode
 */
export function isWhiteLabelMode(): boolean {
  return getDomainContext().isWhiteLabel;
}

/**
 * Get appropriate OG image URL based on domain
 */
export function getOgImageUrl(image?: string): string {
  const baseUrl = getBaseUrl();
  
  if (!image) {
    return `${baseUrl}/og-default.jpg`;
  }

  // If image is already a full URL, use it
  if (image.startsWith('http')) {
    return image;
  }

  // Otherwise, prepend base URL
  return `${baseUrl}${image}`;
}
