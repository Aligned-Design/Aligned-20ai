/**
 * DashboardSystem - Unified Dashboard Components
 *
 * Single source of truth for all dashboard UI across the application.
 * Enforces consistent layout, spacing, and behavior.
 */

export { DashboardShell } from "./DashboardShell";
export { DashboardHeader } from "./DashboardHeader";
export { KpiCard } from "./KpiCard";
export { ChartCard } from "./ChartCard";
export { TableCard } from "./TableCard";
export { ActivityFeedCard } from "./ActivityFeedCard";
export { SegmentedControl } from "./SegmentedControl";
export { FilterBar } from "./FilterBar";
export { EmptyState } from "./EmptyState";
export { ErrorState } from "./ErrorState";
export { LoadingSkeleton } from "./LoadingSkeleton";
export { LayoutTokens } from "./LayoutTokens";

export type { KpiCardProps } from "./KpiCard";
export type { ActivityItem } from "./ActivityFeedCard";
export type { PeriodOption } from "./SegmentedControl";
export type { FilterOption, ActiveFilter } from "./FilterBar";
export type { DashboardVariant, CardHeight } from "./LayoutTokens";
