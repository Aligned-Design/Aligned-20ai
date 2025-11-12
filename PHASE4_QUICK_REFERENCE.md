# Phase 4 Quick Reference: Route Visibility & Navigation

---

## Core Files

### 📋 Route Metadata

**File:** `client/lib/route-metadata.ts`

- **Purpose:** Single source of truth for all route configurations
- **Usage:** Import `ROUTE_METADATA` to access route visibility, SEO, and white-label settings

```typescript
import { ROUTE_METADATA, getRouteMetadata } from "@/lib/route-metadata";

// Get metadata for a specific route
const metadata = getRouteMetadata("/dashboard");
console.log(metadata.visibility); // 'user'
console.log(metadata.noindex); // true
```

---

### 🧭 Navigation Helpers

**File:** `client/lib/navigation-helpers.ts`

- **Purpose:** Utilities for filtering and displaying navigation based on visibility and permissions

```typescript
import { getContextualNavItems, getNavItems } from "@/lib/navigation-helpers";

// Get navigation for current user context
const navItems = getContextualNavItems({
  isAuthenticated: !!user,
  isClient: role === "CLIENT",
  canCheck: (scope) => useCan(scope),
});

// Get navigation for specific visibility level
const publicNav = getNavItems("public");
const userNav = getNavItems("user");
const clientNav = getNavItems("client");
```

---

## Route Visibility Labels

### Public Routes (9 total)

**Visibility:** `public` | **SEO:** Indexable | **Auth:** Optional

```
/                  - Homepage
/about             - About page
/features          - Features page
/integrations      - Integrations page
/help              - Help center
/contact           - Contact page
/privacy           - Privacy policy
/terms             - Terms of service
/pricing           - Pricing page
```

### User Routes (23 total)

**Visibility:** `user` | **SEO:** Noindex | **Auth:** Required

```
/dashboard         - Main dashboard
/onboarding        - User onboarding
/calendar          - Content calendar
/content-queue     - Content queue
/approvals         - Approvals page
/creative-studio   - Creative studio
/content-generator - Content generator
/campaigns         - Campaigns
/brands            - Brand management
/brand-intake      - Brand intake form
/brand-guide       - Brand guide
/brand-snapshot    - Brand snapshot
/brand-intelligence - Brand intelligence
/analytics         - Analytics
/reporting         - Reporting
/paid-ads          - Paid ads
/library           - Media library
/events            - Events
/reviews           - Reviews
/linked-accounts   - Linked accounts
/settings          - Settings
/client-settings   - Client settings
/billing           - Billing
```

### Client Routes (2 total)

**Visibility:** `client` | **SEO:** Noindex | **Auth:** Token-based

```
/client-portal         - Client portal overview
/client-portal/:token  - Token-based access
```

---

## Navigation Configurations

### Public Navigation (SiteHeader)

```typescript
[
  { path: "/", label: "Home" },
  { path: "/features", label: "Features" },
  { path: "/integrations", label: "Integrations" },
  { path: "/pricing", label: "Pricing" },
  { path: "/help", label: "Help" },
  { path: "/contact", label: "Contact" },
];
```

### User Navigation (MainNavigation - Agency)

```typescript
[
  { path: "/dashboard", label: "Dashboard", icon: "📊" },
  {
    path: "/creative-studio",
    label: "Creative Studio",
    icon: "✨",
    requiredScope: "content:create",
  },
  {
    path: "/content-queue",
    label: "Content Queue",
    icon: "📝",
    requiredScope: "content:view",
  },
  {
    path: "/approvals",
    label: "Approvals",
    icon: "✓",
    requiredScope: "approval:view",
  },
  {
    path: "/campaigns",
    label: "Campaigns",
    icon: "📢",
    requiredScope: "campaign:view",
  },
  {
    path: "/analytics",
    label: "Analytics",
    icon: "📈",
    requiredScope: "analytics:view",
  },
  {
    path: "/calendar",
    label: "Calendar",
    icon: "📅",
    requiredScope: "content:view",
  },
  {
    path: "/brand-guide",
    label: "Brand Guide",
    icon: "🎨",
    requiredScope: "brand:view",
  },
  {
    path: "/library",
    label: "Library",
    icon: "📚",
    requiredScope: "media:view",
  },
  {
    path: "/brands",
    label: "Brands",
    icon: "🏢",
    requiredScope: "brand:manage",
  },
  {
    path: "/reporting",
    label: "Reporting",
    icon: "📋",
    requiredScope: "analytics:view",
  },
  {
    path: "/linked-accounts",
    label: "Linked Accounts",
    icon: "🔗",
    requiredScope: "integration:manage",
  },
  { path: "/settings", label: "Settings", icon: "⚙️" },
];
```

### Client Navigation (MainNavigation - Client)

```typescript
[{ path: "/client-portal", label: "Overview", icon: "📊" }];
```

---

## Helper Functions

### getNavItems(visibility)

Get navigation items for a specific visibility level.

```typescript
const publicNav = getNavItems("public");
const userNav = getNavItems("user");
const clientNav = getNavItems("client");
```

### filterNavByPermissions(items, canCheck)

Filter navigation items based on user permissions.

```typescript
const filteredNav = filterNavByPermissions(userNav, (scope) => useCan(scope));
```

### getContextualNavItems(options)

Get appropriate navigation based on user context.

```typescript
const navItems = getContextualNavItems({
  isAuthenticated: !!user,
  isClient: role === "CLIENT",
  canCheck: (scope) => useCan(scope),
});
```

### isRouteAccessible(path, isAuthenticated, isClient)

Check if a route is accessible based on auth state.

```typescript
const canAccess = isRouteAccessible("/dashboard", true, false);
```

---

## Permission Scopes Used in Navigation

| Scope                | Routes That Require It  |
| -------------------- | ----------------------- |
| `content:create`     | Creative Studio         |
| `content:view`       | Content Queue, Calendar |
| `approval:view`      | Approvals               |
| `campaign:view`      | Campaigns               |
| `analytics:view`     | Analytics, Reporting    |
| `brand:view`         | Brand Guide             |
| `brand:manage`       | Brands                  |
| `media:view`         | Library                 |
| `integration:manage` | Linked Accounts         |

---

## Usage Examples

### Example 1: Add New Public Page

```typescript
// 1. Add to route-metadata.ts
'/blog': {
  path: '/blog',
  visibility: 'public',
  title: 'Blog | Aligned AI',
  description: 'Latest updates and insights',
  noindex: false,
}

// 2. Add to navigation-helpers.ts
public: [
  // ... existing items
  { path: '/blog', label: 'Blog' },
]

// SiteHeader will automatically show it!
```

### Example 2: Add New User Page with Permission

```typescript
// 1. Add to route-metadata.ts
'/workflows': {
  path: '/workflows',
  visibility: 'user',
  title: 'Workflows | Aligned AI',
  description: 'Manage your workflows',
  noindex: true,
}

// 2. Add to navigation-helpers.ts
user: [
  // ... existing items
  {
    path: '/workflows',
    label: 'Workflows',
    icon: '⚙️',
    requiredScope: 'workflow:manage'
  },
]

// MainNavigation will automatically filter based on permission!
```

### Example 3: Check Route Access

```typescript
import { isRouteAccessible } from "@/lib/navigation-helpers";

const canAccessDashboard = isRouteAccessible(
  "/dashboard",
  !!user, // isAuthenticated
  false, // isClient
);

if (!canAccessDashboard) {
  navigate("/");
}
```

---

## Key Concepts

### Visibility Levels

- **public**: Marketing and legal pages (indexable, no auth required)
- **user**: Authenticated app pages (noindex, auth required)
- **client**: White-label client portal (noindex, token auth)

### SEO Policy

- **public routes**: `noindex: false` (indexable)
- **user routes**: `noindex: true` (not indexable)
- **client routes**: `noindex: true` (not indexable)

### White-Label Flag

- **client routes**: `whiteLabel: true` (supports custom branding)
- **other routes**: `whiteLabel: false` or undefined

---

## Next Steps (Phase 5)

1. **Domain Separation**: Implement domain detection and routing
2. **SEO Component**: Create `<SEO />` component for dynamic meta tags
3. **Client Portal Auth**: Implement token-based authentication
4. **OpenGraph Tags**: Add social sharing meta tags

---

## Troubleshooting

### Navigation item not showing?

1. Check visibility label in `route-metadata.ts`
2. Check nav config in `navigation-helpers.ts`
3. Check `requiredScope` - user may not have permission
4. Check `isClient` flag - client users see limited nav

### Route not accessible?

1. Check `visibility` label
2. Check auth guard in `App.tsx`
3. Check user authentication status
4. Check user role (CLIENT vs other roles)

---

**Phase:** 4 of 6  
**Status:** ✅ Complete  
**Next Phase:** Domain Separation & SEO Enhancement
