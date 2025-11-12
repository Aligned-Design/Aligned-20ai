# Dashboard System Specification

**Version:** 1.0  
**Last Updated:** 2025-11-12  
**Status:** ✅ Implemented

---

## Overview

The **DashboardSystem** is the canonical UI framework for all dashboard pages across the Aligned platform. It provides a consistent, accessible, and performant experience for internal tools, user-facing dashboards, client portals, and marketing demos.

### Core Principles

1. **Single Source of Truth** - All dashboards use `DashboardSystem/*` components
2. **Design Token Enforcement** - No inline styles; all styling uses CSS custom properties
3. **Consistent IA** - Same layout, spacing, breakpoints, and behavior everywhere
4. **Accessibility First** - WCAG AA compliance; keyboard navigation; screen reader support
5. **Performance** - First paint < 2s; interactions < 150ms; lazy loading below fold

---

## Grid System

### 12-Column Responsive Grid

```
Desktop (≥1024px):  12 columns, 24px gutters
Tablet (768-1023px): 12 columns, 16px gutters
Mobile (<768px):     12 columns, 12px gutters
```

### Grid Implementation

```tsx
// Main content area
<main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
  {/* Cards span columns based on content */}
</main>
```

### Column Spanning Rules

- **KPI Cards**: 1 column (mobile: full width)
- **Chart Cards**: 2 columns (mobile: full width)
- **Table Cards**: Full width (3 columns)
- **Activity Feed**: 1 column

---

## Card Heights

Standard card heights for consistent visual rhythm:

| Size | Height | Use Case                            |
| ---- | ------ | ----------------------------------- |
| XS   | 120px  | Compact KPI, status indicator       |
| S    | 180px  | Standard KPI with sparkline         |
| M    | 280px  | Charts, small tables                |
| L    | 360px  | Large charts, medium tables         |
| XL   | 480px  | Complex visualizations, full tables |

---

## Header Anatomy

Every dashboard follows this header structure:

```
┌─────────────────────────────────────────────────────────────┐
│ Title                    [Period] [Brand] [Filter] [Actions] │
│ Subtitle                                                      │
├──────────────────────────────────────────��──────────────────┤
│ [Active Filters: Tag × Tag × Tag]  [Clear All]              │
└─────────────────────────────────────────────────────────────┘
```

### Header Components

1. **Title** (h1, 32px, bold)
2. **Subtitle** (p, 14px, muted)
3. **Period Picker** (SegmentedControl: Day/Week/Month/Custom)
4. **Brand Selector** (Dropdown with logo)
5. **Filter Bar** (Platform, status, tags)
6. **Actions** (Export, Settings, etc.)

### Header Height

- **Standard**: 64px (single row)
- **With Filters**: 112px (two rows)

---

## Design Tokens

All components consume tokens from `client/styles/tokens.css`:

### Colors

```css
--color-primary: #3d0fd6 /* Purple */ --color-surface: #f9fafb
  /* Background (light) */ --color-foreground: #111827 /* Text (light) */
  --color-border: #e5e7eb /* Borders */ --color-muted: #6b7280
  /* Secondary text */;
```

### Spacing (4px base unit)

```css
--spacing-xs: 4px --spacing-sm: 8px --spacing-md: 16px --spacing-lg: 24px
  --spacing-xl: 32px --spacing-2xl: 40px --spacing-3xl: 48px --spacing-4xl: 64px;
```

### Typography

```css
--font-family:
  Inter,
  sans-serif --font-size-h1: 32px /* Page titles */ --font-size-h2: 24px
    /* Section headers */ --font-size-h3: 20px /* Card titles */
    --font-size-body: 14px /* Body text */ --font-size-body-sm: 12px
    /* Labels, meta */;
```

### Radius & Shadows

```css
--radius-xl: 12px /* Card corners */ --shadow-base: 0 4px 6px rgba...
  /* Card elevation */;
```

---

## Dashboard Variants

### 1. Standard (Default)

- **Use Case**: Authenticated users
- **Features**: Full interactivity, all CTAs enabled
- **Example**: `/dashboard`, `/analytics`

### 2. Read-Only

- **Use Case**: Client portal, external stakeholders
- **Features**: View-only; no edit/delete actions
- **Styling**: Pointer events disabled, slight opacity
- **Example**: `/client-portal/:token`

### 3. Demo

- **Use Case**: Marketing pages, public previews
- **Features**: Sample data, "Demo Mode" watermark
- **Example**: Landing page dashboard preview

---

## Component Library

### Core Components

| Component          | Purpose        | Props                                 |
| ------------------ | -------------- | ------------------------------------- |
| `DashboardShell`   | Main container | title, period, brandSelector, filters |
| `DashboardHeader`  | Top bar        | title, subtitle, period, actions      |
| `KpiCard`          | Metric display | value, delta, sparkline               |
| `ChartCard`        | Chart wrapper  | type, data, loading, error            |
| `TableCard`        | Table wrapper  | data, columns, loading, error         |
| `ActivityFeedCard` | Timeline       | items, loading, error                 |
| `SegmentedControl` | Period picker  | Day/Week/Month/Custom                 |
| `FilterBar`        | Filter chips   | activeFilters, onRemove, onClearAll   |
| `LoadingSkeleton`  | Loading state  | variant, count, height                |
| `EmptyState`       | No data        | icon, title, description, action      |
| `ErrorState`       | Error          | title, message, onRetry, onSupport    |

### Shared Utilities

| Utility            | Purpose                                 |
| ------------------ | --------------------------------------- |
| `useDashboardData` | Centralized data fetching (React Query) |
| `ChartWrapper`     | Recharts wrapper with tokens            |
| `PeriodPicker`     | Enhanced date range picker              |
| `BrandSelector`    | Brand/workspace switcher                |

---

## Layout Example

```tsx
import {
  DashboardShell,
  KpiCard,
  ChartCard,
  TableCard,
} from "@/components/DashboardSystem";
import { useDashboardData } from "@/lib/useDashboardData";

export default function MyDashboard() {
  const { kpis, series, isLoading, error } = useDashboardData({
    period: "week",
  });

  return (
    <DashboardShell
      title="Analytics"
      subtitle="Track your performance metrics"
      period="week"
      onPeriodChange={(p) => setPeriod(p)}
    >
      {/* KPI Row */}
      {kpis.map((kpi) => (
        <KpiCard key={kpi.id} {...kpi} />
      ))}

      {/* Chart */}
      <ChartCard
        title="Impressions Over Time"
        isLoading={isLoading}
        error={error}
      >
        <ChartWrapper type="line" data={series} />
      </ChartCard>

      {/* Table */}
      <TableCard title="Top Posts" isLoading={isLoading} error={error}>
        <MyTable />
      </TableCard>
    </DashboardShell>
  );
}
```

---

## Accessibility Requirements

### Keyboard Navigation

- **Tab Order**: Header → Filters → Cards → Tables
- **Focus Rings**: 2px solid primary color, 2px offset
- **Shortcuts**: Cmd+K (search), Cmd+/ (help)

### Screen Readers

- **ARIA Labels**: All icons, charts, and interactive elements
- **Live Regions**: aria-live="polite" for loading/error states
- **Text Alternatives**: `sr-only` text summaries for charts

### Color Contrast

- **Text on Background**: Minimum 4.5:1 (WCAG AA)
- **Interactive Elements**: Minimum 3:1
- **Dark Mode**: Full parity with light mode

---

## Performance Targets

| Metric                          | Target      | Measured With           |
| ------------------------------- | ----------- | ----------------------- |
| First Contentful Paint (FCP)    | < 1.5s      | Lighthouse              |
| Largest Contentful Paint (LCP)  | < 2.0s      | Lighthouse              |
| Time to Interactive (TTI)       | < 3.0s      | Lighthouse              |
| Interaction to Next Paint (INP) | < 150ms     | DevTools                |
| Bundle Size (DashboardSystem)   | < 50KB gzip | webpack-bundle-analyzer |

### Optimization Strategies

1. **Lazy Loading**: Cards below fold render on scroll
2. **Skeleton States**: Above-fold skeletons prevent layout shift
3. **Data Caching**: React Query caches for 5 minutes
4. **Code Splitting**: `React.lazy()` for heavy charts

---

## Responsive Breakpoints

```ts
mobile:  < 640px  (1 column, stacked)
tablet:  640-1023px (2 columns)
desktop: ≥ 1024px (3 columns, full features)
wide:    ≥ 1280px (3-4 columns, more spacing)
```

### Mobile Behavior

- **Header**: Stacks vertically; period picker moves to dropdown
- **Filters**: Collapse into modal/drawer
- **Cards**: Full width, reduced padding
- **Tables**: Horizontal scroll with sticky columns

---

## Testing Requirements

### Unit Tests

- All components have Storybook stories (light/dark variants)
- Loading/error/empty states covered
- Accessibility (axe-core)

### Integration Tests

- Filter changes update all cards
- Brand switch syncs across dashboard
- Period change triggers data refetch
- Export functionality

### Visual Regression

- Percy snapshots for each route
- Light/dark mode parity
- Mobile/tablet/desktop breakpoints

---

## Migration Checklist

When converting a page to DashboardSystem:

- [ ] Replace page wrapper with `<DashboardShell>`
- [ ] Swap bespoke cards with `<KpiCard>`, `<ChartCard>`, `<TableCard>`
- [ ] Use `useDashboardData` for data fetching
- [ ] Add loading/error/empty states
- [ ] Remove inline styles; use design tokens
- [ ] Add ARIA labels
- [ ] Test keyboard navigation
- [ ] Verify responsive layout
- [ ] Add to Storybook
- [ ] Run accessibility audit (axe)

---

## Resources

- **Component Library**: `client/components/DashboardSystem/*`
- **Documentation**: `docs/DASHBOARD_SYSTEM_SPEC.md` (this file)
- **Migration Map**: `docs/DASHBOARD_DEDUP_MAP.md`
- **QA Checklist**: `docs/DASHBOARD_QA.md`
- **Design Tokens**: `client/styles/tokens.css`

---

**Questions?** Contact the platform team or open a GitHub issue.
