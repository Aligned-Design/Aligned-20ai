# Dashboard System - QA Checklist

**Version:** 1.0  
**Last Updated:** 2025-11-12

---

## Overview

This document provides comprehensive QA criteria for the unified Dashboard System. Use this checklist when migrating dashboard pages or validating the system.

---

## Visual & Layout

### Grid System

- [ ] **12-column grid** renders correctly on desktop
- [ ] **Responsive breakpoints** work:
  - [ ] Mobile (< 640px): 1 column, stacked
  - [ ] Tablet (640-1023px): 2 columns
  - [ ] Desktop (≥ 1024px): 3 columns
- [ ] **Gutters** match spec:
  - [ ] Desktop: 24px
  - [ ] Tablet: 16px
  - [ ] Mobile: 12px
- [ ] **Card heights** match LayoutTokens (XS/S/M/L/XL)
- [ ] **No layout shift** during loading

### Typography

- [ ] All text uses **design tokens** (no inline font-size/weight)
- [ ] **Font family**: Inter
- [ ] **Heading hierarchy** correct (h1 → h2 → h3)
- [ ] **Text color** uses CSS variables:
  - [ ] `--color-foreground` for body
  - [ ] `--color-muted` for secondary
  - [ ] `--color-subtle` for labels

### Colors & Theming

- [ ] **Light mode** renders correctly
- [ ] **Dark mode** renders correctly
- [ ] **Dark mode toggle** switches instantly (no flicker)
- [ ] **Border colors** use `--color-border`
- [ ] **Background colors** use `--color-surface`
- [ ] **Primary color** (`--color-primary`) consistent everywhere

### Spacing

- [ ] **Card padding**: 24px (var(--spacing-lg))
- [ ] **Section gaps**: 24px
- [ ] **No inconsistent spacing** (e.g., random 15px/20px)

### Card Styling

- [ ] **Border radius**: 12px (var(--radius-xl))
- [ ] **Box shadow**: var(--shadow-base)
- [ ] **Border**: 1px solid var(--color-border)
- [ ] **Hover states** (if applicable)

---

## Functional Testing

### Dashboard Header

- [ ] **Title** renders correctly
- [ ] **Subtitle** renders correctly
- [ ] **Period picker** (Day/Week/Month/Custom):
  - [ ] Clicking changes period
  - [ ] Active period highlighted
  - [ ] Custom date range opens (if implemented)
- [ ] **Brand selector** (if applicable):
  - [ ] Dropdown opens
  - [ ] Selecting brand switches data
  - [ ] Selected brand persists across page refreshes
- [ ] **Filter bar** (if applicable):
  - [ ] Filter chips render
  - [ ] Removing filter chip works
  - [ ] "Clear all" button clears all filters
- [ ] **Actions** (Export, etc.):
  - [ ] Buttons clickable
  - [ ] Actions perform expected behavior

### Data Loading

- [ ] **Loading state** shows skeletons
- [ ] **Loaded state** shows data
- [ ] **Empty state** shows when no data
  - [ ] Icon renders
  - [ ] Message clear
  - [ ] CTA button (if applicable) works
- [ ] **Error state** shows on failure
  - [ ] Error icon renders
  - [ ] Error message clear
  - [ ] "Retry" button works
  - [ ] "Contact Support" link works (if applicable)

### KPI Cards

- [ ] **Value** renders correctly (formatted number/currency)
- [ ] **Title** renders correctly
- [ ] **Delta** (change percentage):
  - [ ] Green for positive trend
  - [ ] Red for negative trend
  - [ ] Correct icon (↑/↓)
  - [ ] Label (e.g., "vs last week") shows
- [ ] **Sparkline** (if present):
  - [ ] Renders mini chart
  - [ ] Data points visible
- [ ] **Icon** (if present) renders

### Chart Cards

- [ ] **Chart type** correct (line/area/bar)
- [ ] **Data** renders correctly
- [ ] **X-axis** labels readable
- [ ] **Y-axis** labels readable
- [ ] **Grid lines** visible (if enabled)
- [ ] **Tooltip** shows on hover
  - [ ] Correct values
  - [ ] Readable formatting
- [ ] **Legend** shows (if enabled)
- [ ] **Responsive**: chart adapts to container width
- [ ] **Loading state**: shows skeleton
- [ ] **Error state**: shows error message + retry

### Table Cards

- [ ] **Headers** render correctly
- [ ] **Data rows** render correctly
- [ ] **Sorting** (if applicable):
  - [ ] Clicking header sorts column
  - [ ] Sort icon shows direction
- [ ] **Pagination** (if applicable):
  - [ ] Next/prev buttons work
  - [ ] Page numbers accurate
  - [ ] Items per page selector works
- [ ] **Loading state**: shows table skeleton
- [ ] **Empty state**: shows "No data" message
- [ ] **Error state**: shows error + retry
- [ ] **Responsive**: horizontal scroll on mobile (if wide table)

### Activity Feed Cards

- [ ] **Timeline** renders correctly
- [ ] **Icons** show for each activity
- [ ] **Timestamps** formatted correctly (e.g., "2 hours ago")
- [ ] **Clicking item** (if applicable) navigates/expands
- [ ] **Loading state**: shows text skeletons
- [ ] **Empty state**: shows "No recent activity"

### Filter Bar

- [ ] **Active filters** render as chips
- [ ] **Removing filter** updates data
- [ ] **Clear all** removes all filters
- [ ] **Filter dropdown** (if present):
  - [ ] Opens on click
  - [ ] Selecting option applies filter
  - [ ] Dropdown closes after selection
- [ ] **Filter persistence**: filters persist across page refreshes (if expected)

### Period Picker

- [ ] **Segmented control** shows Day/Week/Month/Custom
- [ ] **Clicking period** updates data
- [ ] **Active period** highlighted
- [ ] **Custom date range** (if implemented):
  - [ ] Calendar picker opens
  - [ ] Selecting dates applies filter
  - [ ] Date range displays correctly

### Brand Selector

- [ ] **Dropdown** opens
- [ ] **Brand logo** shows (if present)
- [ ] **Brand name** shows
- [ ] **Selecting brand** switches dashboard data
- [ ] **Selected brand** persists across navigation
- [ ] **Search** (if present) filters brands

---

## Accessibility (WCAG AA)

### Keyboard Navigation

- [ ] **Tab order** logical (header → filters → cards → tables)
- [ ] **All interactive elements** reachable via keyboard
- [ ] **No keyboard traps** (can tab in and out of all components)
- [ ] **Focus indicators** visible (2px solid primary, 2px offset)
- [ ] **Enter/Space** activates buttons
- [ ] **Escape** closes modals/dropdowns
- [ ] **Arrow keys** navigate dropdowns (if applicable)

### Screen Readers

- [ ] **Page title** (`<h1>`) announced
- [ ] **Landmarks** (`main`, `header`, `nav`) present
- [ ] **ARIA labels** on icons (e.g., "Export dashboard")
- [ ] **ARIA live regions** for loading/error states
- [ ] **Chart text alternatives**: sr-only text summarizes chart data
- [ ] **Table headers** properly associated (`<th scope="col">`)
- [ ] **Loading announcements**: "Loading data..." announced
- [ ] **Error announcements**: errors announced to screen readers

### Color Contrast

- [ ] **Text on background**: Minimum 4.5:1 ratio
  - [ ] Test with browser DevTools or axe
  - [ ] Verify in light mode
  - [ ] Verify in dark mode
- [ ] **Interactive elements**: Minimum 3:1 ratio
- [ ] **No color-only indicators** (e.g., delta uses icon + color)

### Focus Management

- [ ] **Focus ring** visible on all interactive elements
- [ ] **Focus not lost** when opening/closing modals
- [ ] **Focus trapped** in modals (can't tab out)
- [ ] **Focus returned** to trigger element after closing modal

### Accessibility Testing Tools

Run these tools and fix all violations:

- [ ] **axe DevTools** (Chrome extension): 0 violations
- [ ] **Lighthouse Accessibility**: Score ≥ 95
- [ ] **WAVE** (WebAIM): 0 errors
- [ ] **Screen reader test** (NVDA/JAWS/VoiceOver): Manual verification

---

## Performance

### Load Time

- [ ] **First Contentful Paint (FCP)**: < 1.5s
- [ ] **Largest Contentful Paint (LCP)**: < 2.0s
- [ ] **Time to Interactive (TTI)**: < 3.0s
- [ ] **Cumulative Layout Shift (CLS)**: < 0.1
- [ ] **Interaction to Next Paint (INP)**: < 150ms

**Test with**: Lighthouse (DevTools), throttled 3G Fast

### Bundle Size

- [ ] **DashboardSystem bundle**: < 50KB gzip
- [ ] **Total JS bundle**: No significant increase (compare before/after)
- [ ] **Unused code eliminated**: Tree shaking works

**Test with**: `webpack-bundle-analyzer` or `vite-bundle-visualizer`

### Lazy Loading

- [ ] **Cards below fold** lazy-load on scroll
- [ ] **Heavy charts** lazy-load (React.lazy)
- [ ] **Images** lazy-load (loading="lazy")
- [ ] **No jank** during lazy load

### Data Fetching

- [ ] **React Query caching**: 5-minute stale time
- [ ] **No unnecessary refetches**: refetchOnWindowFocus=false
- [ ] **Loading skeletons** prevent layout shift
- [ ] **Parallel fetches** where applicable (not sequential)

---

## Responsive Design

### Mobile (< 640px)

- [ ] **1-column layout**: All cards stack vertically
- [ ] **Header**: Title + actions stack
- [ ] **Period picker**: Dropdown instead of segmented control (if too wide)
- [ ] **Filter bar**: Collapses into button/drawer
- [ ] **Tables**: Horizontal scroll with sticky first column
- [ ] **Touch targets**: Minimum 44x44px (buttons, dropdowns)
- [ ] **No horizontal scrollbars** on page

### Tablet (640-1023px)

- [ ] **2-column layout**: Cards span 1-2 columns
- [ ] **Header**: Single row with period + brand selector
- [ ] **Tables**: Full width, horizontal scroll if needed

### Desktop (≥ 1024px)

- [ ] **3-column layout**: KPI cards in 3-col grid
- [ ] **Charts**: Span 2 columns
- [ ] **Tables**: Full width (3 columns)
- [ ] **All features visible**: No collapsed UI

### Wide Screens (≥ 1280px)

- [ ] **Max width** (optional): Dashboard doesn't stretch too wide
- [ ] **Spacing scales appropriately**

---

## Variants

### Standard Dashboard

- [ ] **All features enabled**: Filters, actions, edit buttons
- [ ] **Interactivity**: Clicking cards navigates/expands

### Read-Only Dashboard (Client Portal)

- [ ] **No edit actions**: Edit/delete buttons hidden
- [ ] **View-only**: Clicking cards shows detail (no editing)
- [ ] **Pointer events**: Disabled on non-viewable elements
- [ ] **Visual indicator**: Subtle opacity or watermark (optional)

### Demo Dashboard (Marketing)

- [ ] **Sample data**: Realistic but fake data
- [ ] **"Demo Mode" watermark**: Visible in bottom-right
- [ ] **No real actions**: Buttons disabled or show "Coming soon"

---

## Cross-Browser Testing

Test on:

- [ ] **Chrome** (latest)
- [ ] **Firefox** (latest)
- [ ] **Safari** (latest)
- [ ] **Edge** (latest)
- [ ] **Mobile Safari** (iOS)
- [ ] **Chrome Mobile** (Android)

Common issues to check:

- [ ] CSS Grid support
- [ ] CSS custom properties support
- [ ] Flexbox support
- [ ] SVG rendering (charts, icons)

---

## Data Accuracy

### Filters Applied Correctly

- [ ] **Period filter**: Data matches selected period
- [ ] **Brand filter**: Data matches selected brand
- [ ] **Platform filter**: Data filtered by platforms
- [ ] **Status filter**: Data filtered by status

### Visual Parity

Take screenshots and compare:

- [ ] **Light mode** before/after migration
- [ ] **Dark mode** before/after migration
- [ ] **Mobile** before/after
- [ ] **Tablet** before/after
- [ ] **Desktop** before/after

Use Percy or similar for automated visual regression.

### Export Functionality

- [ ] **CSV export**: Correct columns, correct data
- [ ] **PDF export**: Matches on-screen dashboard
- [ ] **Filename**: Descriptive (e.g., `analytics_2025-11-12.csv`)
- [ ] **Encoding**: UTF-8 (no character corruption)

---

## State Management

### URL State

- [ ] **Period in URL**: `/dashboard?period=week`
- [ ] **Filters in URL**: `/dashboard?platform=instagram&status=approved`
- [ ] **Brand in URL** (if applicable): `/dashboard?brand=123`
- [ ] **Sharable links**: Copying URL shares filters

### Local Storage

- [ ] **Filters persist** across page refreshes (if expected)
- [ ] **Brand selection persists**
- [ ] **No stale data**: Old cached data cleared appropriately

### Loading States

- [ ] **Initial load**: Shows skeletons
- [ ] **Filter change**: Shows loading indicator (spinner or skeleton)
- [ ] **Refetch**: Shows subtle loading indicator (not full skeleton)
- [ ] **No flash of wrong data**: Old data doesn't show before new data loads

---

## Error Handling

### API Errors

- [ ] **Network error**: Shows error state with retry
- [ ] **500 error**: Shows error state with support link
- [ ] **401 error**: Redirects to login
- [ ] **403 error**: Shows "Access denied" message

### Empty Data

- [ ] **No KPIs**: Shows empty state with message
- [ ] **No chart data**: Shows empty state in chart card
- [ ] **No table data**: Shows "No results" in table
- [ ] **No activity**: Shows "No recent activity"

### Retry Logic

- [ ] **Retry button** re-fetches data
- [ ] **Retry shows loading** while fetching
- [ ] **Retry success** shows data
- [ ] **Retry failure** shows error again

---

## Integration Testing

### Dashboard Pages

For each migrated page:

- [ ] **URL route** works (`/dashboard`, `/analytics`, etc.)
- [ ] **Role-based access** (viewer, editor, admin):
  - [ ] Correct dashboards visible for each role
  - [ ] Correct actions enabled for each role
- [ ] **Navigation** to/from dashboard works
- [ ] **Breadcrumbs** (if present) accurate

### Client Portal

- [ ] **Token-based auth** works
- [ ] **Client branding** shows (logo, colors)
- [ ] **Read-only mode** enforced
- [ ] **Client cannot access** admin dashboards

### Multi-Brand

- [ ] **Switching brands** updates all dashboard cards
- [ ] **Brand context persists** across navigation
- [ ] **No data leakage** between brands

---

## Telemetry & Analytics

### Events Emitted

- [ ] `dash_view` fires on page load
- [ ] `dash_filter_applied` fires when filter changes
- [ ] `dash_export` fires on export
- [ ] `dash_card_expand` fires when expanding card (if applicable)
- [ ] `dash_error` fires on error state

### Event Payloads

Check that events include:

- [ ] `dashboardId` (e.g., "analytics", "billing")
- [ ] `period` (e.g., "week")
- [ ] `brandId`
- [ ] `userId`
- [ ] `timestamp`

---

## Regression Testing

### Feature Flag

- [ ] **Flag off**: Old dashboard renders
- [ ] **Flag on**: New DashboardSystem renders
- [ ] **Toggling flag**: No crashes, no broken state
- [ ] **Default value**: Correct for environment (prod=off, staging=on)

### A/B Testing

If rolling out gradually:

- [ ] **Metrics tracked**: Page load time, error rate, user engagement
- [ ] **Control group**: Old dashboard works as before
- [ ] **Treatment group**: New dashboard works correctly
- [ ] **No cross-contamination**: Users in control don't see new UI

---

## Final Checklist

Before marking a dashboard as "migrated":

- [ ] All sections of this QA doc passed
- [ ] Storybook story created
- [ ] Visual regression tests pass (Percy)
- [ ] Accessibility audit passed (axe, Lighthouse)
- [ ] Performance metrics meet targets (Lighthouse)
- [ ] Code review approved
- [ ] Product owner sign-off
- [ ] Deployed to staging
- [ ] Staging smoke tests passed
- [ ] Feature flag enabled in staging for 1 week
- [ ] No critical bugs reported
- [ ] Ready for production rollout

---

## Bug Reporting Template

Use this template when filing bugs:

```
**Dashboard**: [e.g., Analytics]
**Environment**: [e.g., Staging]
**Browser**: [e.g., Chrome 120]
**Device**: [e.g., Desktop, iPhone 14]

**Steps to Reproduce**:
1. Go to /analytics
2. Click "Week" period
3. ...

**Expected**: [What should happen]
**Actual**: [What actually happened]
**Screenshots**: [Attach screenshots]
**Console Errors**: [Attach console logs if applicable]

**QA Section**: [Which section of QA checklist?]
**Severity**: [Critical / High / Medium / Low]
```

---

## Resources

- **Design Spec**: `docs/DASHBOARD_SYSTEM_SPEC.md`
- **Migration Map**: `docs/DASHBOARD_DEDUP_MAP.md`
- **Component Library**: `client/components/DashboardSystem/*`
- **Storybook**: `http://localhost:6006`

---

**Last Updated:** 2025-11-12  
**Maintained By:** Platform Team
