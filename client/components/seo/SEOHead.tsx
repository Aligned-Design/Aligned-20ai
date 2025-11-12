/**
 * SEO Head Component
 * Dynamically manages page titles, meta descriptions, and SEO tags
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getRouteMetadata } from '@/lib/route-metadata';

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
  ogImage = '/og-default.jpg',
  ogType = 'website',
}: SEOHeadProps) {
  const location = useLocation();
  const routeMetadata = getRouteMetadata(location.pathname);

  // Use props or fall back to route metadata
  const finalTitle = title || routeMetadata?.title || 'Aligned AI';
  const finalDescription =
    description ||
    routeMetadata?.description ||
    'AI-powered content creation platform';
  const finalNoindex = noindex ?? routeMetadata?.noindex ?? false;
  const finalCanonical =
    canonicalUrl ||
    routeMetadata?.canonicalUrl ||
    `https://www.aligned-bydesign.com${location.pathname}`;
  const finalOgImage = ogImage;

  useEffect(() => {
    // Update page title
    document.title = finalTitle;

    // Update or create meta tags
    updateMetaTag('description', finalDescription);
    updateMetaTag('robots', finalNoindex ? 'noindex, nofollow' : 'index, follow');

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
  }, [
    finalTitle,
    finalDescription,
    finalNoindex,
    finalCanonical,
    finalOgImage,
    ogType,
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
