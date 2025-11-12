# Phase 5 Quick Reference: Domain Separation & SEO

---

## Core Files

### 🌐 Domain Detection
**File:** `client/lib/domain-detection.ts`
- **Purpose:** Detect current domain and provide multi-domain utilities

```typescript
import { getDomainContext, getBaseUrl, getCanonicalUrl, isWhiteLabelMode } from '@/lib/domain-detection';

// Get current domain context
const { context, domain, isProduction, isWhiteLabel } = getDomainContext();
// context: 'public' | 'app' | 'portal'

// Get base URL for current domain
const baseUrl = getBaseUrl();
// Returns: 'https://www.aligned-bydesign.com' or 'https://app.aligned-bydesign.com'

// Get canonical URL for current page
const canonical = getCanonicalUrl('/features');
// Returns: 'https://www.aligned-bydesign.com/features'

// Check if in white-label mode
const isWhiteLabel = isWhiteLabelMode();
// Returns: true for custom domains, false for aligned-bydesign.com
```

---

### 🔍 Enhanced SEO Component
**File:** `client/components/seo/SEOHead.tsx`
- **Purpose:** Manage page meta tags, OpenGraph, and Twitter Cards

```typescript
import { SEOHead } from '@/components/seo';

// Use in App.tsx (already implemented)
<SEOHead />

// Or override specific properties
<SEOHead 
  title="Custom Title"
  description="Custom description"
  noindex={true}
  canonicalUrl="https://example.com/custom"
  ogImage="/custom-og-image.jpg"
/>
```

**Auto-Managed Meta Tags:**
- `<title>` - Page title
- `<meta name="description">` - Page description
- `<meta name="robots">` - index/noindex policy
- `<meta name="viewport">` - Responsive viewport
- `<meta name="theme-color">` - Browser theme (white-label aware)
- `<link rel="canonical">` - Canonical URL
- `<meta property="og:*">` - OpenGraph tags
- `<meta name="twitter:*">` - Twitter Card tags

---

### 🗺️ Sitemap Generator
**File:** `scripts/generate-sitemap.ts`
- **Purpose:** Generate sitemap.xml from route metadata

```bash
# Generate sitemap
npx tsx scripts/generate-sitemap.ts

# Output
✅ Sitemap generated successfully at: public/sitemap.xml
📊 Total URLs: 9
```

**Generated Sitemap Location:** `public/sitemap.xml`

---

## Domain Contexts

### Production Domains

| Domain | Context | Purpose | Example |
|--------|---------|---------|---------|
| `www.aligned-bydesign.com` | `public` | Marketing site | Landing, features, pricing |
| `app.aligned-bydesign.com` | `app` | User dashboard | Dashboard, content queue, analytics |
| `portal.aligned-bydesign.com` | `portal` | Client portal | Token-based client access |
| `custom-domain.com` | `portal` | White-label portal | Custom branded client portal |

### Development
| Domain | Context | Notes |
|--------|---------|-------|
| `localhost:*` | `app` | Default to app context in development |

---

## SEO Meta Tags by Route Type

### Public Routes (`visibility: 'public'`)
```html
<title>Features - AI Content, Scheduling & Analytics | Aligned AI</title>
<meta name="description" content="Explore AI content generation...">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://www.aligned-bydesign.com/features">
<meta property="og:title" content="Features - AI Content...">
<meta property="og:image" content="https://www.aligned-bydesign.com/og-features.jpg">
```

### User Routes (`visibility: 'user'`)
```html
<title>Dashboard | Aligned AI</title>
<meta name="description" content="Your content command center.">
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="https://app.aligned-bydesign.com/dashboard">
<meta property="og:image" content="https://app.aligned-bydesign.com/og-default.jpg">
```

### Client Portal Routes (`visibility: 'client'`)
```html
<title>Client Portal</title>
<meta name="description" content="Review and approve your content.">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="[brand-primary-color]">
<link rel="canonical" href="https://portal.aligned-bydesign.com/client-portal">
```

---

## Sitemap Structure

### Included Routes (9 total)
```
✅ / (priority: 1.0, changefreq: weekly)
✅ /about (priority: 0.8, changefreq: monthly)
✅ /features (priority: 0.9, changefreq: weekly)
✅ /integrations (priority: 0.9, changefreq: weekly)
✅ /help (priority: 0.7, changefreq: monthly)
✅ /contact (priority: 0.8, changefreq: monthly)
✅ /privacy (priority: 0.5, changefreq: yearly)
✅ /terms (priority: 0.5, changefreq: yearly)
✅ /pricing (priority: 0.9, changefreq: monthly)
```

### Excluded Routes (25 total)
```
❌ All user routes (visibility: 'user', noindex: true)
❌ All client portal routes (visibility: 'client', noindex: true)
```

---

## Domain Detection Functions

### getDomainContext()
Returns domain configuration object.

```typescript
interface DomainConfig {
  context: 'public' | 'app' | 'portal';
  domain: string;
  isProduction: boolean;
  isWhiteLabel: boolean;
}

const config = getDomainContext();
console.log(config);
// {
//   context: 'public',
//   domain: 'www.aligned-bydesign.com',
//   isProduction: true,
//   isWhiteLabel: false
// }
```

### getBaseUrl()
Returns appropriate base URL for current domain.

```typescript
const baseUrl = getBaseUrl();
// Production public: 'https://www.aligned-bydesign.com'
// Production app: 'https://app.aligned-bydesign.com'
// Portal/custom: 'https://[custom-domain]'
// Development: 'http://localhost:5173'
```

### getCanonicalUrl(path)
Generates canonical URL for given path.

```typescript
const canonical = getCanonicalUrl('/features');
// Returns: 'https://www.aligned-bydesign.com/features'
```

### isRouteAllowedOnDomain(routePath)
Checks if route is allowed on current domain.

```typescript
const allowed = isRouteAllowedOnDomain('/dashboard');
// public domain: false (marketing pages only)
// app domain: true (all user routes allowed)
// portal domain: false (only /client-portal routes)
```

### isWhiteLabelMode()
Detects if current domain is a custom white-label domain.

```typescript
const isWhiteLabel = isWhiteLabelMode();
// aligned-bydesign.com: false
// custom-domain.com: true
```

### getOgImageUrl(image)
Resolves OG image URL relative to current domain.

```typescript
const ogImage = getOgImageUrl('/og-features.jpg');
// Returns: 'https://www.aligned-bydesign.com/og-features.jpg'

const fullUrl = getOgImageUrl('https://cdn.example.com/image.jpg');
// Returns: 'https://cdn.example.com/image.jpg' (unchanged)
```

---

## Usage Examples

### Example 1: Custom SEO for Specific Page
```typescript
// In MyPage.tsx
import { SEOHead } from '@/components/seo';

function MyPage() {
  return (
    <>
      <SEOHead
        title="My Custom Page | Aligned AI"
        description="Custom page description for better SEO"
        ogImage="/og-my-page.jpg"
      />
      <div>Page content...</div>
    </>
  );
}
```

### Example 2: Detect Domain Context
```typescript
// In Layout.tsx
import { getDomainContext } from '@/lib/domain-detection';

function Layout() {
  const { context, isWhiteLabel } = getDomainContext();

  return (
    <div>
      {context === 'public' && <MarketingHeader />}
      {context === 'app' && <AppHeader />}
      {context === 'portal' && <ClientPortalHeader whiteLabel={isWhiteLabel} />}
    </div>
  );
}
```

### Example 3: Generate Sitemap on Build
```json
// In package.json
{
  "scripts": {
    "build": "npm run generate-sitemap && vite build",
    "generate-sitemap": "tsx scripts/generate-sitemap.ts"
  }
}
```

### Example 4: White-Label Theme Color
```typescript
// SEOHead automatically detects white-label mode
// and uses brand primary color from CSS variables

// In BrandContext.tsx (already implemented)
useEffect(() => {
  if (currentBrand?.primary_color) {
    document.documentElement.style.setProperty(
      '--brand-primary',
      currentBrand.primary_color
    );
  }
}, [currentBrand]);

// SEOHead reads this and applies to theme-color meta tag
```

---

## SEO Best Practices

### ✅ Do's
- Use route metadata for consistent SEO
- Include OpenGraph images for all public pages
- Set appropriate canonical URLs
- Use `noindex` for protected/duplicate pages
- Keep titles under 60 characters
- Keep descriptions under 160 characters

### ❌ Don'ts
- Don't index protected routes
- Don't duplicate content across domains
- Don't use same OG image for all pages
- Don't forget to update sitemap after adding routes
- Don't hardcode meta tags in components

---

## OpenGraph Image Guidelines

### Recommended Sizes
- **OG Image:** 1200×630 pixels
- **Twitter Card:** 1200×675 pixels (16:9 ratio)
- **File Format:** JPG or PNG
- **File Size:** < 1MB

### Image Locations
```
public/
  og-home.jpg          (Homepage)
  og-features.jpg      (Features page)
  og-pricing.jpg       (Pricing page)
  og-default.jpg       (Fallback)
```

### Route Metadata Configuration
```typescript
'/features': {
  path: '/features',
  visibility: 'public',
  title: 'Features - AI Content, Scheduling & Analytics | Aligned AI',
  description: 'Explore AI content generation...',
  noindex: false,
  ogImage: '/og-features.jpg', // ← Add OG image here
}
```

---

## Troubleshooting

### Meta tags not updating?
1. Check route metadata in `route-metadata.ts`
2. Verify SEOHead is rendered in App.tsx
3. Check browser DevTools for meta tags
4. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### Sitemap not including new route?
1. Check route has `visibility: 'public'`
2. Check route has `noindex: false`
3. Run `npx tsx scripts/generate-sitemap.ts`
4. Verify route added to ROUTE_METADATA

### Wrong domain context detected?
1. Check window.location.hostname in console
2. Verify domain detection logic in `domain-detection.ts`
3. Check if domain matches expected patterns
4. In development, context defaults to 'app'

### OG images not showing in social preview?
1. Verify image exists in `public/` folder
2. Check image path in route metadata
3. Test with Facebook Sharing Debugger
4. Test with Twitter Card Validator
5. Ensure image is < 1MB and proper dimensions

---

## Testing

### Test SEO Meta Tags
```typescript
// In browser console
Array.from(document.querySelectorAll('meta')).map(m => ({
  name: m.getAttribute('name') || m.getAttribute('property'),
  content: m.content
}));
```

### Test Domain Detection
```typescript
// In browser console
import { getDomainContext } from '@/lib/domain-detection';
console.log(getDomainContext());
```

### Validate Sitemap
```bash
# Check sitemap is valid XML
cat public/sitemap.xml

# Validate with online tools
# https://www.xml-sitemaps.com/validate-xml-sitemap.html
```

---

## Next Steps

### Phase 6: Analytics & Monitoring
- Track SEO performance metrics
- Monitor sitemap crawl status
- Validate OpenGraph tags automatically
- A/B test meta descriptions

### Advanced Features
- Multi-domain redirects
- Domain-specific navigation filtering
- CNAME configuration UI
- Custom OG image upload per brand

---

**Phase:** 5 of 6  
**Status:** ✅ Complete  
**Next Phase:** Analytics & Monitoring
