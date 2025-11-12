/**
 * useDashboardData Hook
 *
 * Centralized data fetching for all dashboards.
 * Wraps React Query with standardized keys and provides loading/error/data states.
 *
 * Usage:
 * const { kpis, series, topItems, activity, isLoading, error, refetch } = useDashboardData({
 *   brandId: '123',
 *   period: 'week',
 *   platformFilters: ['instagram', 'twitter']
 * });
 */

import { useQuery } from "@tanstack/react-query";
import { PeriodOption } from "@/components/DashboardSystem";

export interface DashboardFilters {
  brandId?: string;
  period?: PeriodOption;
  platformFilters?: string[];
  statusFilters?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

// Data Contract - Matches spec exactly
export interface DashboardKpi {
  key: string;
  label: string;
  value: number | string;
  delta?: number;
  spark?: number[];
}

export interface DashboardData {
  kpis: Array<{
    key: string;
    label: string;
    value: number | string;
    delta?: number;
    spark?: number[];
  }>;
  series: Record<string, Array<{ x: number | string; y: number }>>;
  topItems: Array<{
    id: string;
    title: string;
    metric: number;
    meta?: Record<string, any>;
  }>;
  activity: Array<{
    id: string;
    ts: string;
    type: string;
    actor?: string;
    target?: string;
    meta?: any;
  }>;
}

async function fetchDashboardData(
  filters: DashboardFilters,
): Promise<DashboardData> {
  // TODO: Replace with actual API call
  // For now, return mock data for development

  const params = new URLSearchParams();
  if (filters.brandId) params.append("brandId", filters.brandId);
  if (filters.period) params.append("period", filters.period);
  if (filters.platformFilters)
    params.append("platforms", filters.platformFilters.join(","));

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock data - Now matches spec exactly
  return {
    kpis: [
      {
        key: "impressions",
        label: "Total Impressions",
        value: "45.2K",
        delta: 12.5,
        spark: [40, 45, 42, 48, 50, 45, 52],
      },
      {
        key: "engagement",
        label: "Engagement Rate",
        value: "12.5%",
        delta: 2.3,
        spark: [10, 11, 11.5, 12, 11.8, 12.2, 12.5],
      },
      {
        key: "posts",
        label: "Posts Published",
        value: 24,
        delta: -8,
      },
      {
        key: "followers",
        label: "New Followers",
        value: 1847,
        delta: 3.9,
      },
    ],
    series: {
      impressions: [
        { x: "Mon", y: 4200 },
        { x: "Tue", y: 5100 },
        { x: "Wed", y: 4800 },
        { x: "Thu", y: 6200 },
        { x: "Fri", y: 7100 },
        { x: "Sat", y: 5900 },
        { x: "Sun", y: 6400 },
      ],
      engagement: [
        { x: "Mon", y: 380 },
        { x: "Tue", y: 420 },
        { x: "Wed", y: 390 },
        { x: "Thu", y: 510 },
        { x: "Fri", y: 580 },
        { x: "Sat", y: 450 },
        { x: "Sun", y: 520 },
      ],
    },
    topItems: [
      {
        id: "1",
        title: "Summer Sale Campaign",
        metric: 12500,
        meta: { platform: "instagram" },
      },
      {
        id: "2",
        title: "Product Launch",
        metric: 9800,
        meta: { platform: "tiktok" },
      },
      {
        id: "3",
        title: "Brand Awareness",
        metric: 7600,
        meta: { platform: "facebook" },
      },
      {
        id: "4",
        title: "Tutorial Video Series",
        metric: 6200,
        meta: { platform: "youtube" },
      },
      {
        id: "5",
        title: "Customer Testimonials",
        metric: 5100,
        meta: { platform: "linkedin" },
      },
    ],
    activity: [
      {
        id: "1",
        ts: "2025-11-12T10:30:00Z",
        type: "post_published",
        actor: "user_123",
        target: "post_456",
        meta: { platform: "instagram", postType: "carousel" },
      },
      {
        id: "2",
        ts: "2025-11-12T08:15:00Z",
        type: "campaign_approved",
        actor: "user_789",
        target: "campaign_101",
        meta: { campaignName: "Summer Sale Campaign" },
      },
      {
        id: "3",
        ts: "2025-11-11T16:45:00Z",
        type: "content_created",
        actor: "user_123",
        target: "draft_789",
        meta: { contentType: "video" },
      },
      {
        id: "4",
        ts: "2025-11-11T14:20:00Z",
        type: "comment_replied",
        actor: "user_456",
        target: "comment_234",
        meta: { platform: "facebook", sentiment: "positive" },
      },
    ],
  };
}

export function useDashboardData(filters: DashboardFilters = {}) {
  // Generate stable query key hash from filters
  const filtersHash = JSON.stringify({
    platforms: filters.platformFilters?.sort(),
    status: filters.statusFilters?.sort(),
    dateRange: filters.dateRange,
  });

  const queryKey = ["dash", filters.brandId, filters.period, filtersHash];

  const { data, isLoading, error, refetch, isFetching } = useQuery<
    DashboardData,
    Error
  >({
    queryKey,
    queryFn: () => fetchDashboardData(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    kpis: data?.kpis || [],
    series: data?.series || {},
    topItems: data?.topItems || [],
    activity: data?.activity || [],
    isLoading,
    isFetching,
    error,
    refetch,
  };
}
