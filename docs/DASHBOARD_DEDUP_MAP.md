# Dashboard Deduplication & Migration Map

**Version:** 1.0  
**Last Updated:** 2025-11-12  
**Status:** 🔄 In Progress

---

## Executive Summary

This document maps all existing dashboard pages and components to the new **DashboardSystem**, identifies duplicates, and provides a migration plan.

### Key Findings

- **9 dashboard-like pages** identified (6 full dashboards, 3 specialized)
- **3 analytics dashboard components** with overlapping functionality
- **15+ dashboard widget components** across different folders
- **Recommended consolidation**: 80% of custom dashboard code can be replaced with DashboardSystem primitives

---

## Dashboard Pages Inventory

### Full Dashboards (User-Facing)

| Page | Route | Type | Current Components | Migration Status |
|------|-------|------|-------------------|------------------|
| `Dashboard.tsx` | `/dashboard` | Main user dashboard | ActionButtonsHeader, DashboardWidgets, SmartDashboard | 🔴 Needs migration |
| `DashboardEnhanced.tsx` | N/A (unused?) | Enhanced variant | ActionButtonsHeader, GoodNews, Retention components | ⚠️ Candidate for removal |
| `Analytics.tsx` | `/analytics` | Analytics overview | SmartDashboard, PlatformMetricsCarousel, AnalyticsAdvisor | 🔴 Needs migration |
| `AnalyticsEnhanced.tsx` | N/A (unused?) | Power-user analytics | SmartDashboard, ActionableInsights, RootCauseAnalysis | ⚠️ Candidate for removal |
| `ClientPortal.tsx` | `/client-portal/:token` | Client-facing | ClientAnalyticsDashboard, CollaborativeApprovalFlow | 🟡 Partial migration |
| `AdminBilling.tsx` | `/billing` (admin) | Admin billing | Custom KPI cards, tables | 🔴 Needs migration |

### Specialized Dashboards

| Page | Route | Type | Notes |
|------|-------|------|-------|
| `Reporting.tsx` | `/reporting` | Report management | Not a full dashboard; uses reporting UI |
| `InsightsROI.tsx` | `/insights-roi` | ROI metrics | Uses ROIDashboard component |
| `BrandSnapshot.tsx` | `/brand-snapshot` | Brand metrics | Specialized view; low priority |

---

## Component Duplication Matrix

### Analytics Dashboard Components

| Component | Location | Used By | Overlaps With | Recommendation |
|-----------|----------|---------|---------------|----------------|
| **SmartDashboard** | `components/analytics/` | Dashboard.tsx, Analytics.tsx, AnalyticsEnhanced.tsx | DashboardSystem KpiCard/ChartCard | ✅ **Keep** but refactor to use DashboardSystem primitives internally |
| **ClientAnalyticsDashboard** | `components/analytics/` | ClientPortal.tsx | SmartDashboard | ✅ **Keep** but refactor to use DashboardSystem primitives |
| **ROIDashboard** | `components/retention/` | InsightsROI.tsx | SmartDashboard (different metrics) | ✅ **Keep** (domain-specific) |

### Dashboard Widget Components

| Component | Location | Used By | Replace With |
|-----------|----------|---------|--------------|
| **DashboardWidgets** | `components/dashboard/` | Dashboard.tsx | ActivityFeedCard, custom widgets |
| **AnalyticsPanel** | `components/dashboard/` | Multiple | KpiCard grid |
| **HeroMetricCard** | `components/dashboard/` | Analytics | KpiCard (large variant) |
| **PlatformMetricsCarousel** | `components/dashboard/` | Analytics, AnalyticsEnhanced | ChartCard with carousel wrapper |
| **AnalyticsCharts** | `components/dashboard/` | Multiple | ChartWrapper |

### Admin/Specialized Dashboards

| Component | Location | Purpose | Action |
|-----------|----------|---------|--------|
| **AIMetricsDashboard** | `components/admin/` | Admin AI metrics | Migrate to DashboardSystem |
| **MultiClientApprovalDashboard** | `components/collaboration/` | Agency approvals | Migrate to DashboardSystem |

---

## Migration Plan

### Phase 1: Foundation (Week 1)

**Goal**: Set up DashboardSystem infrastructure

- [x] Create DashboardSystem component library
- [x] Create shared utilities (useDashboardData, ChartWrapper, PeriodPicker, BrandSelector)
- [x] Add feature flag: `VITE_FEATURE_UNIFIED_DASH`
- [ ] Create migration examples/Storybook stories
- [ ] Set up visual regression tests

### Phase 2: Migrate Core Dashboards (Week 2)

**Priority Order**:

1. **AdminBilling.tsx** (simplest)
   - **Before**: Custom KPI cards + table
   - **After**: `DashboardShell` + `KpiCard` + `TableCard`
   - **Estimated Effort**: 2-4 hours
   - **Code Reduction**: ~150 lines → ~80 lines

2. **Dashboard.tsx** (main user dashboard)
   - **Before**: ActionButtonsHeader + DashboardWidgets + SmartDashboard
   - **After**: `DashboardShell` + `KpiCard` + `ActivityFeedCard` + SmartDashboard (refactored)
   - **Estimated Effort**: 6-8 hours
   - **Dependencies**: Refactor SmartDashboard first

3. **Analytics.tsx**
   - **Before**: PlatformMetricsCarousel + SmartDashboard + custom charts
   - **After**: `DashboardShell` + `ChartCard` + SmartDashboard (refactored)
   - **Estimated Effort**: 6-8 hours

### Phase 3: Refactor Shared Components (Week 3)

**Goal**: Update SmartDashboard and ClientAnalyticsDashboard to use DashboardSystem primitives internally

1. **SmartDashboard.tsx**
   - Replace inline KPI rendering with `<KpiCard>`
   - Replace custom charts with `<ChartWrapper>`
   - Keep role-aware logic
   - **Impact**: All pages using SmartDashboard get consistent UI

2. **ClientAnalyticsDashboard.tsx**
   - Same as SmartDashboard
   - Maintain client-portal branding
   - Add read-only variant

### Phase 4: Consolidation (Week 4)

**Goal**: Remove duplicate pages and components

1. **Evaluate Enhanced Variants**
   - [ ] Check if `DashboardEnhanced.tsx` is in use (check routes, analytics)
   - [ ] Check if `AnalyticsEnhanced.tsx` is in use
   - **If unused**: Delete both files
   - **If used**: Merge features into standard Dashboard/Analytics pages

2. **Delete Replaced Components**
   - [ ] `HeroMetricCard.tsx` → replaced by `KpiCard`
   - [ ] `AnalyticsPanel.tsx` → replaced by `KpiCard` grid
   - [ ] Custom chart components → replaced by `ChartWrapper`

### Phase 5: Polish & Deploy (Week 5)

- [ ] Add dark mode support to all dashboards
- [ ] Run accessibility audits (axe)
- [ ] Performance optimization (lazy loading)
- [ ] Enable feature flag in staging
- [ ] Monitor telemetry for 2 weeks
- [ ] Enable feature flag in production
- [ ] Remove flag; make DashboardSystem default
- [ ] Delete old code

---

## Before/After Code Comparison

### Example: AdminBilling.tsx

#### Before (Custom Implementation)

```tsx
// AdminBilling.tsx (150 lines)
export default function AdminBilling() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Custom KPI cards
  return (
    <div className="p-6 bg-slate-50">
      <h1 className="text-3xl font-bold mb-6">Billing Dashboard</h1>
      
      <div className="grid grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-sm text-green-600">+12.5% vs last month</p>
          </CardContent>
        </Card>
        {/* Repeat for 2 more KPIs... */}
      </div>

      <Card>
        <CardHeader><CardTitle>User Accounts</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <LoadingSpinner /> : <UserTable users={users} />}
        </CardContent>
      </Card>
    </div>
  );
}
```

#### After (DashboardSystem)

```tsx
// AdminBilling.tsx (80 lines)
import { DashboardShell, KpiCard, TableCard } from "@/components/DashboardSystem";
import { useDashboardData } from "@/lib/useDashboardData";

export default function AdminBilling() {
  const { kpis, topItems, isLoading, error } = useDashboardData({
    brandId: "admin",
    period: "month",
  });

  return (
    <DashboardShell
      title="Billing Dashboard"
      subtitle="Manage user accounts and billing"
      period="month"
      onPeriodChange={(p) => setPeriod(p)}
    >
      {/* KPIs */}
      {kpis.map((kpi) => (
        <KpiCard key={kpi.id} {...kpi} />
      ))}

      {/* User Table */}
      <TableCard
        title="User Accounts"
        isLoading={isLoading}
        error={error}
        isEmpty={topItems.length === 0}
      >
        <UserTable users={topItems} />
      </TableCard>
    </DashboardShell>
  );
}
```

**Benefits**:
- ✅ **70 lines removed** (~47% code reduction)
- ✅ **Consistent layout** with all other dashboards
- ✅ **Built-in loading/error states**
- ✅ **Responsive** out of the box
- ✅ **Accessible** (ARIA labels, keyboard nav)
- ✅ **Dark mode** support

---

## Migration Checklist (Per Page)

Use this checklist for each dashboard page migration:

### Pre-Migration

- [ ] Review current page implementation
- [ ] Identify all KPIs, charts, tables
- [ ] Check data fetching logic (API calls, React Query)
- [ ] Note any custom features (filters, exports, etc.)
- [ ] Create Storybook story for current state (baseline)

### During Migration

- [ ] Replace page wrapper with `<DashboardShell>`
- [ ] Replace custom KPI cards with `<KpiCard>`
- [ ] Replace custom charts with `<ChartCard>` + `<ChartWrapper>`
- [ ] Replace custom tables with `<TableCard>`
- [ ] Move data fetching to `useDashboardData` (if applicable)
- [ ] Add loading/error/empty states
- [ ] Remove inline styles; use design tokens
- [ ] Add ARIA labels and screen reader text
- [ ] Test keyboard navigation

### Post-Migration

- [ ] Create Storybook story for new implementation
- [ ] Run visual regression test (Percy)
- [ ] Run accessibility audit (axe-core)
- [ ] Test on mobile/tablet/desktop
- [ ] Test light/dark mode
- [ ] Verify feature flag works (old vs new)
- [ ] Monitor bundle size change
- [ ] Update documentation

---

## Deleted Files (Post-Migration)

**To Be Removed After Phase 4**:

### Pages

- [ ] `client/pages/DashboardEnhanced.tsx` (if unused/merged)
- [ ] `client/pages/AnalyticsEnhanced.tsx` (if unused/merged)

### Components

- [ ] `client/components/dashboard/HeroMetricCard.tsx` → replaced by `KpiCard`
- [ ] `client/components/dashboard/AnalyticsPanel.tsx` → replaced by `KpiCard` grid
- [ ] `client/components/dashboard/AnalyticsCharts.tsx` → replaced by `ChartWrapper`
- [ ] Any other custom dashboard components identified during migration

### Tests/Stories

- [ ] Storybook stories for deleted components
- [ ] Unit tests for deleted components

**Estimated Code Reduction**: ~2,000-3,000 lines of code

---

## Rollout Strategy

### Feature Flag Gating

```ts
// .env
VITE_FEATURE_UNIFIED_DASH=false  // Prod: disabled by default
VITE_FEATURE_UNIFIED_DASH=true   // Staging: enabled for testing
```

### Incremental Rollout

1. **Week 1-2**: Development/testing (flag off everywhere)
2. **Week 3**: Enable for internal team (flag on for specific users)
3. **Week 4**: Enable in staging (flag on for all staging traffic)
4. **Week 5**: Monitor staging telemetry
5. **Week 6**: Enable for 10% of production users
6. **Week 7**: 50% rollout
7. **Week 8**: 100% rollout
8. **Week 9**: Remove flag; delete old code

### Telemetry Events

Monitor these events during rollout:

```ts
dash_view              // Dashboard page load
dash_filter_applied    // User applied filter
dash_export            // User exported data
dash_card_expand       // User expanded chart
dash_error             // Error state rendered
dash_load_time         // Page load duration
```

### Success Metrics

| Metric | Baseline | Target |
|--------|----------|--------|
| Page Load Time (P95) | 3.2s | < 2.0s |
| Time to Interactive | 4.5s | < 3.0s |
| Interaction Latency | 200ms | < 150ms |
| Accessibility Score | 85 | 95+ |
| Code Lines (all dashboards) | ~8,000 | ~5,000 |

---

## Risk Mitigation

### High-Risk Migrations

1. **Dashboard.tsx** (main user entry point)
   - **Risk**: Breaking primary workflow
   - **Mitigation**: Feature flag + canary rollout + rollback plan

2. **ClientPortal.tsx** (client-facing)
   - **Risk**: Client confusion, broken branding
   - **Mitigation**: Extra QA; client-preview link; gradual rollout by tenant

3. **Analytics.tsx** (heavy data visualization)
   - **Risk**: Performance regression
   - **Mitigation**: Performance testing; lazy loading; bundle analysis

### Rollback Plan

If metrics degrade or critical bugs found:

1. **Immediate**: Disable feature flag (< 5 minutes)
2. **Short-term**: Fix bug or revert PR
3. **Long-term**: Re-test in staging before re-enabling

---

## Questions & Support

- **Migration Questions**: Ask in #platform-team Slack
- **Bug Reports**: GitHub issues with label `dashboard-system`
- **Design Questions**: Review `docs/DASHBOARD_SYSTEM_SPEC.md`

---

## Appendix: Full Component Map

### DashboardSystem Components (New)

- `DashboardShell` - Main container
- `DashboardHeader` - Top bar
- `KpiCard` - Metric card
- `ChartCard` - Chart wrapper
- `TableCard` - Table wrapper
- `ActivityFeedCard` - Timeline
- `SegmentedControl` - Period picker
- `FilterBar` - Filters
- `LoadingSkeleton` - Loading states
- `EmptyState` - No data
- `ErrorState` - Error handling

### Legacy Components (To Replace/Remove)

- `DashboardWidgets` → `ActivityFeedCard`
- `HeroMetricCard` → `KpiCard`
- `AnalyticsPanel` → `KpiCard` grid
- `PlatformMetricsCarousel` → `ChartCard` with carousel
- `AnalyticsCharts` → `ChartWrapper`

### Components to Refactor (Keep but Update)

- `SmartDashboard` - Use DashboardSystem primitives internally
- `ClientAnalyticsDashboard` - Use DashboardSystem primitives internally
- `ROIDashboard` - Use DashboardSystem primitives internally

---

**Last Updated:** 2025-11-12  
**Maintained By:** Platform Team
