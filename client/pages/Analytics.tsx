import { useBrand } from '@/contexts/BrandContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, TrendingDown, Eye, Heart, Share2, MessageCircle } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { DashboardSkeleton } from '@/components/ui/skeletons';

export default function Analytics() {
  const { currentBrand, loading } = useBrand();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!currentBrand) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <EmptyState
          icon={BarChart3}
          title="No brand selected"
          description="Select a brand from the sidebar to view analytics, performance metrics, and AI-powered insights."
        />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Insights</h1>
          <p className="text-muted-foreground mt-1">
            Performance metrics for {currentBrand.name}
          </p>
        </div>
        <Button variant="outline">Export Report</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Reach"
          value="12.4K"
          change="+18%"
          trend="up"
          icon={<Eye className="h-5 w-5" />}
        />
        <MetricCard
          title="Engagement"
          value="3.2K"
          change="+24%"
          trend="up"
          icon={<Heart className="h-5 w-5" />}
        />
        <MetricCard
          title="Shares"
          value="842"
          change="+12%"
          trend="up"
          icon={<Share2 className="h-5 w-5" />}
        />
        <MetricCard
          title="Comments"
          value="1.1K"
          change="-5%"
          trend="down"
          icon={<MessageCircle className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Top Performing Content</h3>
          <div className="space-y-3">
            <PerformanceItem
              title="5 Ways to Boost Productivity"
              platform="LinkedIn"
              engagement={2847}
              reach={8234}
            />
            <PerformanceItem
              title="Product Launch Announcement"
              platform="Instagram"
              engagement={1923}
              reach={6821}
            />
            <PerformanceItem
              title="Weekly Newsletter - March 2024"
              platform="Email"
              engagement={1456}
              reach={4923}
            />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Advisor Agent Recommendations</h3>
          <div className="space-y-4">
            <RecommendationItem
              priority="high"
              title="Optimal posting time"
              description="Posts published between 2-4 PM get 32% more engagement"
            />
            <RecommendationItem
              priority="medium"
              title="Content format"
              description="Carousel posts are performing 24% better than single images"
            />
            <RecommendationItem
              priority="low"
              title="Hashtag strategy"
              description="Consider adding #TechInnovation and #FutureOfWork"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Platform Performance</h3>
          <Badge variant="outline">Last 30 days</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <PlatformCard platform="Instagram" posts={12} engagement={2847} growth="+18%" />
          <PlatformCard platform="LinkedIn" posts={8} engagement={1923} growth="+24%" />
          <PlatformCard platform="Facebook" posts={10} engagement={1456} growth="+12%" />
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  trend,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}) {
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  const trendColor = trend === 'up' ? 'text-green-600' : 'text-red-600';

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center gap-1 mt-1">
        <TrendIcon className={`h-4 w-4 ${trendColor}`} />
        <span className={`text-sm font-medium ${trendColor}`}>{change}</span>
        <span className="text-xs text-muted-foreground ml-1">vs last month</span>
      </div>
    </div>
  );
}

function PerformanceItem({
  title,
  platform,
  engagement,
  reach,
}: {
  title: string;
  platform: string;
  engagement: number;
  reach: number;
}) {
  return (
    <div className="flex items-start justify-between p-3 rounded-lg border bg-accent/20">
      <div className="flex-1">
        <p className="font-medium text-sm mb-1">{title}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{platform}</span>
          <span>•</span>
          <span>{engagement.toLocaleString()} engagements</span>
          <span>•</span>
          <span>{reach.toLocaleString()} reach</span>
        </div>
      </div>
    </div>
  );
}

function RecommendationItem({
  priority,
  title,
  description,
}: {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}) {
  const priorityConfig = {
    high: { color: 'bg-red-500', label: 'High' },
    medium: { color: 'bg-yellow-500', label: 'Medium' },
    low: { color: 'bg-blue-500', label: 'Low' },
  };

  const config = priorityConfig[priority];

  return (
    <div className="flex gap-3">
      <div className={`mt-1 h-2 w-2 rounded-full ${config.color}`} />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-sm">{title}</p>
          <Badge variant="outline" className="text-xs">
            {config.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function PlatformCard({
  platform,
  posts,
  engagement,
  growth,
}: {
  platform: string;
  posts: number;
  engagement: number;
  growth: string;
}) {
  return (
    <div className="p-4 rounded-lg border bg-accent/20">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">{platform}</h4>
        <span className="text-xs text-green-600 font-medium">{growth}</span>
      </div>
      <div className="space-y-1 text-sm text-muted-foreground">
        <p>{posts} posts published</p>
        <p>{engagement.toLocaleString()} total engagements</p>
      </div>
    </div>
  );
}
