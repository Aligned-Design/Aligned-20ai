/**
 * SEO Head Component
 * Dynamically manages page titles, meta descriptions, and SEO tags
 * Integrates with route metadata and domain detection
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getRouteMetadata } from '@/lib/route-metadata';
import { getCanonicalUrl, getOgImageUrl, getDomainContext } from '@/lib/domain-detection';

interface SEOHeadProps {
  title?: string;
  description?: string;
  noindex?: boolean;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
}

export function SEOHead({
  title,
  description,
  noindex,
  canonicalUrl,
  ogImage,
  ogType = 'website',
}: SEOHeadProps) {
  const location = useLocation();
  const routeMetadata = getRouteMetadata(location.pathname);
  const domainContext = getDomainContext();

  // Use props or fall back to route metadata
  const finalTitle = title || routeMetadata?.title || 'Aligned AI';
  const finalDescription =
    description ||
    routeMetadata?.description ||
    'AI-powered content creation platform for agencies and brands';
  
  // Noindex logic: use prop, or route metadata, or auto-detect based on visibility
  const shouldNoindex = noindex ?? routeMetadata?.noindex ?? (routeMetadata?.visibility !== 'public');
  
  const finalCanonical =
    canonicalUrl ||
    routeMetadata?.canonicalUrl ||
    getCanonicalUrl(location.pathname);
  
  const finalOgImage = getOgImageUrl(
    ogImage || routeMetadata?.ogImage || '/og-default.jpg'
  );

  useEffect(() => {
    // Update page title
    document.title = finalTitle;

    // Update or create meta tags
    updateMetaTag('description', finalDescription);
    updateMetaTag('robots', shouldNoindex ? 'noindex, nofollow' : 'index, follow');

    // Update canonical link
    updateCanonicalLink(finalCanonical);

    // Update OpenGraph tags
    updateMetaProperty('og:title', finalTitle);
    updateMetaProperty('og:description', finalDescription);
    updateMetaProperty('og:type', ogType);
    updateMetaProperty('og:url', finalCanonical);
    updateMetaProperty('og:image', finalOgImage);
    updateMetaProperty('og:site_name', 'Aligned AI');

    // Update Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', 'name');
    updateMetaTag('twitter:title', finalTitle, 'name');
    updateMetaTag('twitter:description', finalDescription, 'name');
    updateMetaTag('twitter:image', finalOgImage, 'name');

    // Add viewport meta tag for responsive design
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0', 'name');

    // Add theme color based on context
    const themeColor = domainContext.isWhiteLabel 
      ? getComputedStyle(document.documentElement).getPropertyValue('--brand-primary') || '#8B5CF6'
      : '#8B5CF6';
    updateMetaTag('theme-color', themeColor, 'name');
  }, [
    finalTitle,
    finalDescription,
    shouldNoindex,
    finalCanonical,
    finalOgImage,
    ogType,
    domainContext.isWhiteLabel,
  ]);

  return null; // This component only manages head tags
}

/**
 * Update or create a meta tag
 */
function updateMetaTag(
  nameOrProperty: string,
  content: string,
  attribute: 'name' | 'property' = 'name'
): void {
  let meta = document.querySelector(
    `meta[${attribute}="${nameOrProperty}"]`
  ) as HTMLMetaElement;

  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, nameOrProperty);
    document.head.appendChild(meta);
  }

  meta.content = content;
}

/**
 * Update OpenGraph property tags
 */
function updateMetaProperty(property: string, content: string): void {
  updateMetaTag(property, content, 'property');
}

/**
 * Update canonical link
 */
function updateCanonicalLink(url: string): void {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }

  link.href = url;
}
