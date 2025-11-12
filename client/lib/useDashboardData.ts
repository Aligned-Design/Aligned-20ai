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

export interface DashboardKpi {
  id: string;
  title: string;
  value: string | number;
  delta?: {
    value: number;
    trend: "up" | "down" | "neutral";
    label?: string;
  };
  sparkline?: number[];
}

export interface DashboardSeries {
  id: string;
  name: string;
  data: Array<{ x: string; y: number }>;
}

export interface DashboardTopItem {
  id: string;
  name: string;
  value: number;
  metadata?: Record<string, any>;
}

export interface DashboardActivity {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DashboardData {
  kpis: DashboardKpi[];
  series: DashboardSeries[];
  topItems: DashboardTopItem[];
  activity: DashboardActivity[];
}

async function fetchDashboardData(filters: DashboardFilters): Promise<DashboardData> {
  // TODO: Replace with actual API call
  // For now, return mock data for development
  
  const params = new URLSearchParams();
  if (filters.brandId) params.append("brandId", filters.brandId);
  if (filters.period) params.append("period", filters.period);
  if (filters.platformFilters) params.append("platforms", filters.platformFilters.join(","));
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock data
  return {
    kpis: [
      {
        id: "impressions",
        title: "Total Impressions",
        value: "45.2K",
        delta: { value: 12.5, trend: "up", label: "vs last week" },
        sparkline: [40, 45, 42, 48, 50, 45, 52],
      },
      {
        id: "engagement",
        title: "Engagement Rate",
        value: "12.5%",
        delta: { value: 2.3, trend: "up", label: "vs last week" },
        sparkline: [10, 11, 11.5, 12, 11.8, 12.2, 12.5],
      },
      {
        id: "posts",
        title: "Posts Published",
        value: 24,
        delta: { value: -8, trend: "down", label: "vs last week" },
      },
    ],
    series: [
      {
        id: "impressions_series",
        name: "Impressions",
        data: [
          { x: "Mon", y: 4200 },
          { x: "Tue", y: 5100 },
          { x: "Wed", y: 4800 },
          { x: "Thu", y: 6200 },
          { x: "Fri", y: 7100 },
          { x: "Sat", y: 5900 },
          { x: "Sun", y: 6400 },
        ],
      },
    ],
    topItems: [
      { id: "1", name: "Summer Sale Campaign", value: 12500 },
      { id: "2", name: "Product Launch", value: 9800 },
      { id: "3", name: "Brand Awareness", value: 7600 },
    ],
    activity: [
      {
        id: "1",
        title: "Post published",
        description: "Instagram carousel went live",
        timestamp: "2 hours ago",
      },
      {
        id: "2",
        title: "Campaign approved",
        description: "Summer Sale Campaign ready to launch",
        timestamp: "5 hours ago",
      },
    ],
  };
}

export function useDashboardData(filters: DashboardFilters = {}) {
  const queryKey = ["dashboard", filters.brandId, filters.period, filters.platformFilters, filters.statusFilters, filters.dateRange];
  
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery<DashboardData, Error>({
    queryKey,
    queryFn: () => fetchDashboardData(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    kpis: data?.kpis || [],
    series: data?.series || [],
    topItems: data?.topItems || [],
    activity: data?.activity || [],
    isLoading,
    isFetching,
    error,
    refetch,
  };
}
