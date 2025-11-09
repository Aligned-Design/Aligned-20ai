import React, { useState, useEffect } from "react";
import { useBrand } from "@/contexts/BrandContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { DashboardSkeleton } from "@/components/ui/skeletons";
import { EmptyState } from "@/components/ui/empty-state";
import { LayoutDashboard, TrendingUp, Users, FileText } from "lucide-react";
import {
  WelcomeWidget,
  ContentPipelineWidget,
  CalendarSnapshotWidget,
  ApprovalsQueueWidget,
  AdvisorInsightsWidget,
  ConnectionHealthWidget,
  QuickCreateWidget,
} from "@/components/dashboard/DashboardWidgets";
import {
  MetricCard,
  TrendAreaChart,
  ChannelDonutChart,
  PipelineBarChart,
} from "@/components/dashboard/AnalyticsCharts";
import type {
  UserRole,
  DashboardMetrics,
  ConnectionHealth,
} from "@/types/dashboard";

export default function NewDashboard() {
  const { currentBrand, loading: brandLoading } = useBrand();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>("viewer");
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [summary, setSummary] = useState({
    reach: 0,
    reachChange: 0,
    engagement: 0,
    engagementChange: 0,
    posts: 0,
    postsChange: 0,
  });

  useEffect(() => {
    if (currentBrand?.id) {
      loadDashboardData();
    }
  }, [currentBrand?.id]);

  const loadDashboardData = async () => {
    if (!currentBrand?.id) return;

    try {
      setLoading(true);

      // Get user role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("brand_id", currentBrand.id)
        .single();

      if (roleData) {
        setUserRole(roleData.role as UserRole);
      }

      // Get latest metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from("dashboard_metrics")
        .select("*")
        .eq("brand_id", currentBrand.id)
        .order("metric_date", { ascending: false })
        .limit(7);

      if (metricsError) throw metricsError;

      if (metricsData && metricsData.length > 0) {
        const latest = metricsData[0];
        setMetrics(latest);

        // Calculate changes
        const previous = metricsData[1];
        if (previous) {
          setSummary({
            reach: latest.reach,
            reachChange: calculateChange(latest.reach, previous.reach),
            engagement: latest.engagement,
            engagementChange: calculateChange(
              latest.engagement,
              previous.engagement,
            ),
            posts: latest.posts_published,
            postsChange: latest.posts_published - previous.posts_published,
          });
        } else {
          setSummary({
            reach: latest.reach,
            reachChange: 0,
            engagement: latest.engagement,
            engagementChange: 0,
            posts: latest.posts_published,
            postsChange: 0,
          });
        }
      }
    } catch (err: unknown) {
      console.error("Error loading dashboard:", err);
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Error loading dashboard",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleApprove = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("social_posts")
        .update({ status: "approved" })
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Post Approved",
        description: "The post has been approved successfully",
      });
      loadDashboardData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleRequestEdits = (__postId: string) => {
    toast({
      title: "Request Edits",
      description: "Opening edit request dialog...",
    });
  };

  if (brandLoading || loading) {
    return <DashboardSkeleton />;
  }

  if (!currentBrand) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <EmptyState
          icon={LayoutDashboard}
          title="No brand selected"
          description="Select a brand to view your dashboard"
        />
      </div>
    );
  }

  // Mock data for demo
  const pipelineStages = [
    {
      stage: "Draft",
      count: 5,
      change: 2,
      color: "#9ca3af",
      status: "draft" as const,
    },
    {
      stage: "In Review",
      count: 3,
      change: 0,
      color: "#3b82f6",
      status: "review" as const,
    },
    {
      stage: "Approved",
      count: 8,
      change: 4,
      color: "#10b981",
      status: "approved" as const,
    },
    {
      stage: "Scheduled",
      count: 12,
      change: -2,
      color: "#f59e0b",
      status: "scheduled" as const,
    },
    {
      stage: "Published",
      count: 45,
      change: 15,
      color: "#8b5cf6",
      status: "published" as const,
    },
  ];

  const upcomingPosts = [
    {
      id: "1",
      title: "New product launch announcement",
      scheduledFor: new Date(Date.now() + 86400000),
      platforms: ["Instagram", "Facebook", "Twitter"],
      thumbnail:
        "https://images.unsplash.com/photo-1560472355-536de3962603?w=100&h=100&fit=crop",
    },
    {
      id: "2",
      title: "Customer testimonial highlight",
      scheduledFor: new Date(Date.now() + 172800000),
      platforms: ["LinkedIn"],
      thumbnail:
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop",
    },
  ];

  const approvalItems = [
    {
      id: "1",
      title: "Summer sale campaign post",
      createdBy: "Sarah Johnson",
      createdAt: new Date(Date.now() - 3600000),
      bfsScore: 0.85,
      platform: ["Instagram", "Facebook"],
    },
    {
      id: "2",
      title: "Behind-the-scenes content",
      createdBy: "Mike Chen",
      createdAt: new Date(Date.now() - 7200000),
      bfsScore: 0.92,
      platform: ["TikTok"],
    },
  ];

  const insights: unknown[] = [
    {
      id: "1",
      title: "Try Reels Thu 3–5 PM",
      description: "Reels posted Thursday afternoons get 28% more engagement",
      impact: "↑28% engagement",
      sourcePosts: ["post1", "post2", "post3"],
      icon: "📹",
    },
    {
      id: "2",
      title: "Client stories perform best",
      description: "Testimonial posts outperform product posts by 31%",
      impact: "↑31% vs average",
      sourcePosts: ["post4", "post5"],
      icon: "💬",
    },
    {
      id: "3",
      title: "Carousel posts drive saves",
      description: "Multi-image posts get 2.4x more saves than single images",
      impact: "↑140% saves",
      sourcePosts: ["post6", "post7", "post8"],
      icon: "📸",
    },
  ];

  const connections: ConnectionHealth[] = [
    {
      platform: "Instagram",
      status: "connected",
      lastPublish: new Date(Date.now() - 86400000),
      icon: "📷",
      color: "#E4405F",
    },
    {
      platform: "Facebook",
      status: "expiring",
      expiresIn: 5,
      lastPublish: new Date(Date.now() - 172800000),
      icon: "👥",
      color: "#1877F2",
    },
    {
      platform: "LinkedIn",
      status: "connected",
      lastPublish: new Date(Date.now() - 259200000),
      icon: "💼",
      color: "#0A66C2",
    },
  ];

  const reachTrendData = [
    { date: "Mon", value: 4200 },
    { date: "Tue", value: 5100 },
    { date: "Wed", value: 4800 },
    { date: "Thu", value: 6200 },
    { date: "Fri", value: 7500 },
    { date: "Sat", value: 8100 },
    { date: "Sun", value: 6800 },
  ];

  const channelData = [
    { platform: "Instagram", percentage: 45, color: "#E4405F" },
    { platform: "Facebook", percentage: 25, color: "#1877F2" },
    { platform: "LinkedIn", percentage: 20, color: "#0A66C2" },
    { platform: "Twitter", percentage: 10, color: "#1DA1F2" },
  ];

  const pipelineBarData = pipelineStages.map((stage) => ({
    stage: stage.stage,
    count: stage.count,
    color: stage.color,
  }));

  const aiSummary =
    summary.reachChange > 0
      ? `Reach up +${summary.reachChange}% this week. ${approvalItems.length} posts await approval.`
      : `${approvalItems.length} posts await approval. Keep up the great work!`;

  return (
    <div className="p-10 space-y-6">
      {/* Welcome & Summary */}
      <WelcomeWidget
        userName="Lauren"
        summary={aiSummary}
        pendingApprovals={approvalItems.length}
      />

      {/* Primary Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Reach"
          value={formatNumber(summary.reach || 24500)}
          change={`${summary.reachChange > 0 ? "+" : ""}${summary.reachChange}%`}
          trend={
            summary.reachChange > 0
              ? "up"
              : summary.reachChange < 0
                ? "down"
                : "neutral"
          }
          icon={<TrendingUp className="h-5 w-5" />}
          sparklineData={[4200, 5100, 4800, 6200, 7500, 8100, 6800]}
        />
        <MetricCard
          title="Engagement Rate"
          value={`${metrics?.engagement_rate || 4.2}%`}
          change={`${summary.engagementChange > 0 ? "+" : ""}${summary.engagementChange}%`}
          trend={summary.engagementChange > 0 ? "up" : "neutral"}
          icon={<Users className="h-5 w-5" />}
          sparklineData={[3.8, 4.1, 3.9, 4.5, 4.7, 4.3, 4.2]}
        />
        <MetricCard
          title="Posts Published"
          value={summary.posts || 45}
          change={
            summary.postsChange !== 0
              ? `${summary.postsChange > 0 ? "+" : ""}${summary.postsChange} this week`
              : undefined
          }
          icon={<FileText className="h-5 w-5" />}
        />
        <MetricCard
          title="Followers Gained"
          value={`+${formatNumber(metrics?.followers_gained || 287)}`}
          change="+12% vs last week"
          trend="up"
          icon={<Users className="h-5 w-5" />}
          sparklineData={[35, 42, 38, 45, 52, 48, 41]}
        />
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reach Trend */}
          <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold mb-4">Reach Trend (7 days)</h3>
            <TrendAreaChart data={reachTrendData} color="#8b5cf6" />
          </div>

          {/* Pipeline Bar Chart */}
          <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold mb-4">Content Pipeline</h3>
            <PipelineBarChart data={pipelineBarData} />
          </div>

          {/* Calendar Snapshot */}
          <CalendarSnapshotWidget posts={upcomingPosts} />
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-6">
          {/* Content Pipeline Cards */}
          <ContentPipelineWidget stages={pipelineStages} />

          {/* Approvals Queue */}
          {["admin", "strategy_manager", "approver"].includes(userRole) && (
            <ApprovalsQueueWidget
              items={approvalItems}
              userRole={userRole}
              onApprove={handleApprove}
              onRequestEdits={handleRequestEdits}
            />
          )}

          {/* Connection Health */}
          <ConnectionHealthWidget connections={connections} />

          {/* Quick Create */}
          {["admin", "strategy_manager", "brand_manager"].includes(
            userRole,
          ) && <QuickCreateWidget />}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Advisor Insights */}
        <AdvisorInsightsWidget insights={insights} />

        {/* Channel Mix */}
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-soft">
          <h3 className="text-lg font-semibold mb-4">Channel Mix</h3>
          <ChannelDonutChart data={channelData} />
          <div className="mt-4 space-y-2">
            {channelData.map((channel) => (
              <div
                key={channel.platform}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: channel.color }}
                  />
                  <span>{channel.platform}</span>
                </div>
                <span className="font-medium">{channel.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
