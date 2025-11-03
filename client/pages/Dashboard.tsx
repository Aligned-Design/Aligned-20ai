import { useBrand } from '@/contexts/BrandContext';
import { Button } from '@/components/ui/button';
import { FileText, Image, TrendingUp, Calendar, ArrowRight, Sparkles, Plus } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { DashboardSkeleton } from '@/components/ui/skeletons';
import { useNavigate } from 'react-router-dom';
import { HelpTooltip } from '@/components/ui/help-tooltip';

export default function Dashboard() {
  const { currentBrand, loading } = useBrand();
  const navigate = useNavigate();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!currentBrand) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <EmptyState
          icon={Sparkles}
          title="No brand selected"
          description="Create or select a brand to get started with Aligned AI and unlock intelligent content automation."
          action={{
            label: "Create Your First Brand",
            onClick: () => navigate('/brands'),
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-10 space-y-10">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-semibold tracking-tight">Dashboard</h1>
          <HelpTooltip content="Your dashboard shows a real-time overview of content performance, AI agent activity, and upcoming posts. All metrics update automatically." />
        </div>
        <p className="text-muted-foreground text-lg">
          Welcome back! Here's what's happening with {currentBrand.name}.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Content Items"
          value="24"
          subtitle="12 scheduled"
          icon={<FileText className="h-5 w-5" />}
          trend="+8%"
        />
        <StatCard
          title="Assets"
          value="156"
          subtitle="82 images, 74 docs"
          icon={<Image className="h-5 w-5" />}
          trend="+12"
        />
        <StatCard
          title="Engagement"
          value="3.2k"
          subtitle="This month"
          icon={<TrendingUp className="h-5 w-5" />}
          trend="+24%"
        />
        <StatCard
          title="Next Publish"
          value="Today"
          subtitle="3 posts at 2:00 PM"
          icon={<Calendar className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-soft">
          <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
          <div className="space-y-5">
            <ActivityItem
              agent="Doc Agent"
              action="Generated 3 blog post drafts"
              time="2 hours ago"
            />
            <ActivityItem
              agent="Design Agent"
              action="Created Instagram carousel template"
              time="5 hours ago"
            />
            <ActivityItem
              agent="Advisor Agent"
              action="Recommended new posting schedule"
              time="1 day ago"
            />
            <ActivityItem
              agent="Manual"
              action="New asset uploaded: brand-logo-2024.png"
              time="2 days ago"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-soft">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-semibold">AI Agent Status</h3>
            <HelpTooltip content="Three specialized AI agents work together: Doc Agent writes content, Design Agent creates visuals, and Advisor Agent provides data-driven recommendations." />
          </div>
          <div className="space-y-6">
            <AgentStatus
              name="Doc Agent"
              subtitle="Aligned Words"
              status="active"
              description="Ready to generate content"
            />
            <AgentStatus
              name="Design Agent"
              subtitle="Aligned Creative"
              status="active"
              description="Templates synced"
            />
            <AgentStatus
              name="Advisor Agent"
              subtitle="Aligned Insights"
              status="analyzing"
              description="Analyzing last month's performance"
            />
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-violet/5 via-azure/5 to-mint/5 p-8 shadow-soft">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet/10 blur-3xl" />
        <div className="relative flex items-start justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Monthly Content Engine</h3>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-lg">
              Next month's content will be automatically generated by the 10th. Review and approve
              drafts in the Calendar.
            </p>
          </div>
          <Button variant="outline" className="gap-2 shrink-0">
            View Calendar <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend?: string;
}) {
  return (
    <div className="group rounded-2xl border border-border/50 bg-card p-7 shadow-soft transition-all hover:shadow-md hover:border-border">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className="text-muted-foreground transition-colors group-hover:text-violet">{icon}</div>
      </div>
      <div className="text-3xl font-semibold tracking-tight">{value}</div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        {trend && <span className="text-sm text-mint font-medium">{trend}</span>}
      </div>
    </div>
  );
}

function ActivityItem({ agent, action, time }: { agent: string; action: string; time: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1.5 h-2 w-2 rounded-full bg-violet shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{agent}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{action}</p>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{time}</span>
    </div>
  );
}

function AgentStatus({
  name,
  subtitle,
  status,
  description,
}: {
  name: string;
  subtitle: string;
  status: 'active' | 'analyzing' | 'idle';
  description: string;
}) {
  const statusColors = {
    active: 'bg-mint',
    analyzing: 'bg-coral',
    idle: 'bg-muted-foreground',
  };

  return (
    <div className="flex items-start gap-4">
      <div className={`mt-1.5 h-2.5 w-2.5 rounded-full ${statusColors[status]} shrink-0`} />
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <p className="font-medium">{name}</p>
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
