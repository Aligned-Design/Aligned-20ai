import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  TrendingUp,
  Zap,
  ArrowRight,
  Plus,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

// Welcome & AI Summary Widget
export function WelcomeWidget({
  userName,
  summary,
  pendingApprovals,
  className,
}: {
  userName: string;
  summary: string;
  pendingApprovals: number;
  className?: string;
}) {
  const navigate = useNavigate();

  return (
    <Card
      className={cn(
        "bg-gradient-to-br from-violet/5 via-azure/5 to-mint/5 border-border/50",
        className,
      )}
    >
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold mb-1">
              Welcome back, {userName} 👋
            </h2>
            <p className="text-lg text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet" />
              {summary}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {pendingApprovals > 0 && (
              <Button
                variant="default"
                className="gap-2"
                onClick={() => navigate("/create-post")}
              >
                <CheckCircle2 className="h-4 w-4" />
                Review ({pendingApprovals})
              </Button>
            )}
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => navigate("/create-post")}
            >
              <Zap className="h-4 w-4" />
              Generate next week
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => navigate("/create-post")}
            >
              <Plus className="h-4 w-4" />
              Create post
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Content Pipeline Widget
interface PipelineStage {
  stage: string;
  count: number;
  change: number;
  color: string;
  status: "draft" | "review" | "approved" | "scheduled" | "published";
}

export function ContentPipelineWidget({
  stages,
  className,
}: {
  stages: PipelineStage[];
  className?: string;
}) {
  const navigate = useNavigate();

  const stageIcons = {
    draft: "📝",
    review: "👀",
    approved: "✅",
    scheduled: "⏰",
    published: "🚀",
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Content Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stages.map((stage) => (
          <div
            key={stage.stage}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/5 transition-colors cursor-pointer group"
            onClick={() => navigate("/calendar")}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stageIcons[stage.status]}</span>
              <div>
                <p className="font-medium">{stage.stage}</p>
                <p className="text-sm text-muted-foreground">
                  {stage.count} {stage.count === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {stage.change !== 0 && (
                <Badge
                  variant={stage.change > 0 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {stage.change > 0 ? "+" : ""}
                  {stage.change}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                View <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Calendar Snapshot Widget
interface UpcomingPost {
  id: string;
  title: string;
  scheduledFor: Date;
  platforms: string[];
  thumbnail?: string;
}

export function CalendarSnapshotWidget({
  posts,
  className,
}: {
  posts: UpcomingPost[];
  className?: string;
}) {
  const navigate = useNavigate();

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Next 7 Days</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => navigate("/calendar")}
        >
          Open Calendar <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No posts scheduled in the next 7 days
          </p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/5 transition-colors cursor-pointer"
              onClick={() => navigate(`/calendar`)}
            >
              {post.thumbnail && (
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{post.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    {post.scheduledFor.toLocaleDateString()} at{" "}
                    {post.scheduledFor.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                {post.platforms.slice(0, 3).map((platform) => (
                  <Badge key={platform} variant="secondary" className="text-xs">
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// Approvals Queue Widget
interface ApprovalItem {
  id: string;
  title: string;
  createdBy: string;
  createdAt: Date;
  bfsScore?: number;
  platform: string[];
}

export function ApprovalsQueueWidget({
  items,
  userRole,
  onApprove,
  onRequestEdits,
  className,
}: {
  items: ApprovalItem[];
  userRole: string;
  onApprove?: (id: string) => void;
  onRequestEdits?: (id: string) => void;
  className?: string;
}) {
  const canApprove = ["admin", "strategy_manager", "approver"].includes(
    userRole,
  );

  if (items.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Approvals Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 mx-auto text-mint mb-3" />
            <p className="text-sm text-muted-foreground">
              All caught up! No approvals pending.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Approvals Queue
          <Badge variant="destructive" className="text-xs">
            {items.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-lg border border-border/50 hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  by {item.createdBy} • {item.createdAt.toLocaleDateString()}
                </p>
              </div>
              {item.bfsScore && (
                <Badge
                  variant={item.bfsScore >= 0.8 ? "default" : "destructive"}
                  className="text-xs"
                >
                  BFS {(item.bfsScore * 100).toFixed(0)}%
                </Badge>
              )}
            </div>
            {canApprove && (
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => onApprove?.(item.id)}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onRequestEdits?.(item.id)}
                >
                  Request Edits
                </Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Advisor Insights Widget
interface Insight {
  id: string;
  title: string;
  description: string;
  impact: string;
  sourcePosts?: string[];
  icon?: string;
}

export function AdvisorInsightsWidget({
  insights,
  className,
}: {
  insights: Insight[];
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet" />
          Advisor Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="p-4 rounded-lg bg-gradient-to-br from-violet/5 to-azure/5 border border-border/50"
          >
            <div className="flex items-start gap-3">
              {insight.icon && <span className="text-2xl">{insight.icon}</span>}
              <div className="flex-1">
                <p className="font-medium mb-1">{insight.title}</p>
                <p className="text-sm text-muted-foreground mb-2">
                  {insight.description}
                </p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-mint" />
                  <span className="text-xs text-mint font-medium">
                    {insight.impact}
                  </span>
                  {insight.sourcePosts && (
                    <button className="text-xs text-muted-foreground hover:text-foreground ml-auto">
                      Why? ({insight.sourcePosts.length} posts)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Connection Health Widget
interface ConnectionStatus {
  platform: string;
  status: "connected" | "expiring" | "expired" | "disconnected";
  expiresIn?: number;
  lastPublish?: Date;
  icon: string;
}

export function ConnectionHealthWidget({
  connections,
  className,
}: {
  connections: ConnectionStatus[];
  className?: string;
}) {
  const navigate = useNavigate();

  const statusConfig = {
    connected: { color: "text-mint", badge: "default" },
    expiring: { color: "text-coral", badge: "destructive" },
    expired: { color: "text-destructive", badge: "destructive" },
    disconnected: { color: "text-muted-foreground", badge: "secondary" },
  };

  const needsAction = connections.filter((c) =>
    ["expiring", "expired", "disconnected"].includes(c.status),
  );

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          Connection Health
          {needsAction.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {needsAction.length} need attention
            </Badge>
          )}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/integrations")}
        >
          Manage
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {connections.map((connection) => {
          const config = statusConfig[connection.status];
          return (
            <div
              key={connection.platform}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{connection.icon}</span>
                <div>
                  <p className="font-medium text-sm">{connection.platform}</p>
                  {connection.status === "expiring" && connection.expiresIn && (
                    <p className="text-xs text-coral">
                      Expires in {connection.expiresIn}d
                    </p>
                  )}
                  {connection.lastPublish &&
                    connection.status === "connected" && (
                      <p className="text-xs text-muted-foreground">
                        Last: {connection.lastPublish.toLocaleDateString()}
                      </p>
                    )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    config.color.replace("text-", "bg-"),
                  )}
                />
                {connection.status !== "connected" && (
                  <Button size="sm" variant="outline" className="text-xs">
                    {connection.status === "disconnected"
                      ? "Connect"
                      : "Reconnect"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// Quick Create Widget
export function QuickCreateWidget({ className }: { className?: string }) {
  const navigate = useNavigate();

  const quickActions = [
    { label: "Social Post", icon: "📱", route: "/create-post" },
    { label: "Blog Article", icon: "📝", route: "/create-post" },
    { label: "Email Campaign", icon: "📧", route: "/emails" },
    { label: "Event", icon: "📆", route: "/events" },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Quick Create</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto flex-col gap-2 p-4 hover:bg-accent/10"
            onClick={() => navigate(action.route)}
          >
            <span className="text-2xl">{action.icon}</span>
            <span className="text-sm font-medium">{action.label}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
