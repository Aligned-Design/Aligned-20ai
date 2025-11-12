import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Eye,
  Heart,
  Users,
  TrendingUp,
  HelpCircle,
  Settings,
  Target,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
  helpText: string;
  priority: "high" | "medium" | "low";
}

interface SmartDashboardProps {
  userRole: "first_time" | "power_user" | "client";
  hasGoals?: boolean;
  className?: string;
}

export function SmartDashboard({
  userRole,
  hasGoals = false,
  className,
}: SmartDashboardProps) {
  const [viewMode, setViewMode] = useState<"simple" | "advanced">(
    userRole === "power_user" ? "advanced" : "simple",
  );

  const allMetrics: MetricCard[] = [
    {
      id: "reach",
      title: "Reach",
      value: "382K",
      change: 13.2,
      icon: <Eye className="h-5 w-5" />,
      color: "text-blue-600 bg-blue-100",
      helpText: "Total number of unique people who saw your content",
      priority: "high",
    },
    {
      id: "engagement",
      title: "Engagement Rate",
      value: "5.4%",
      change: 0.8,
      icon: <Heart className="h-5 w-5" />,
      color: "text-pink-600 bg-pink-100",
      helpText:
        "Percentage of people who interacted with your content (likes, comments, shares)",
      priority: "high",
    },
    {
      id: "followers",
      title: "Follower Growth",
      value: "+1,847",
      change: 3.9,
      icon: <Users className="h-5 w-5" />,
      color: "text-purple-600 bg-purple-100",
      helpText: "New followers gained across all platforms",
      priority: "high",
    },
    {
      id: "clicks",
      title: "Link Clicks",
      value: "3,240",
      change: 15.2,
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-green-600 bg-green-100",
      helpText: "Number of clicks on links in your posts",
      priority: "medium",
    },
    {
      id: "saves",
      title: "Saves",
      value: "1,523",
      change: 8.1,
      icon: <BarChart3 className="h-5 w-5" />,
      color: "text-amber-600 bg-amber-100",
      helpText: "Times your content was saved by users",
      priority: "medium",
    },
    {
      id: "shares",
      title: "Shares",
      value: "892",
      change: 12.4,
      icon: <Target className="h-5 w-5" />,
      color: "text-indigo-600 bg-indigo-100",
      helpText: "Times your content was shared",
      priority: "low",
    },
  ];

  // Filter metrics based on user role
  const getDisplayMetrics = (): MetricCard[] => {
    if (userRole === "first_time") {
      // Show only Big 3 KPIs
      return allMetrics.filter((m) => m.priority === "high");
    } else if (userRole === "client") {
      // Show simplified client-friendly metrics
      return allMetrics.filter((m) => m.priority !== "low");
    } else {
      // Power users see all metrics
      return viewMode === "simple"
        ? allMetrics.filter((m) => m.priority === "high")
        : allMetrics;
    }
  };

  const displayMetrics = getDisplayMetrics();

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">
            Performance Overview
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {userRole === "first_time" && "Your top 3 metrics to track"}
            {userRole === "client" && "Your content performance at a glance"}
            {userRole === "power_user" && "Comprehensive analytics dashboard"}
          </p>
        </div>

        {userRole === "power_user" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setViewMode(viewMode === "simple" ? "advanced" : "simple")
            }
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            {viewMode === "simple" ? "Show All Metrics" : "Simplify View"}
          </Button>
        )}
      </div>

      {/* First-Time User Guidance */}
      {userRole === "first_time" && !hasGoals && (
        <Card className="mb-6 border-indigo-200 bg-indigo-50">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-indigo-900 mb-1">
                  New to Analytics?
                </h3>
                <p className="text-sm text-indigo-800 mb-3">
                  Start by focusing on these 3 key metrics. They'll tell you how
                  many people see your content, how engaged they are, and if
                  your audience is growing.
                </p>
                <Button size="sm" className="gap-2">
                  <Target className="h-4 w-4" />
                  Set Your First Goal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Grid */}
      <div
        className={cn(
          "grid gap-6",
          displayMetrics.length === 3
            ? "grid-cols-1 md:grid-cols-3"
            : displayMetrics.length === 5
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {displayMetrics.map((metric) => (
          <TooltipProvider key={metric.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-help">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn("p-3 rounded-full", metric.color)}>
                        {metric.icon}
                      </div>
                      <Badge
                        variant={metric.change > 0 ? "default" : "destructive"}
                        className="gap-1"
                      >
                        {metric.change > 0 ? "+" : ""}
                        {metric.change}%
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1 flex items-center gap-1">
                        {metric.title}
                        <HelpCircle className="h-3 w-3 text-slate-400" />
                      </p>
                      <p className="text-3xl font-black text-slate-900">
                        {metric.value}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        {userRole === "client" ? "Last 28 days" : "Last 7 days"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{metric.helpText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {/* Client-Friendly Summary */}
      {userRole === "client" && (
        <Card className="mt-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <h3 className="font-bold text-green-900 mb-2 text-lg">
              What This Means
            </h3>
            <p className="text-green-800 text-sm leading-relaxed">
              People loved your content this month! Your posts reached{" "}
              <strong>382K people</strong>, and <strong>5.4%</strong> of them
              engaged (that's great!). You gained{" "}
              <strong>1,847 new followers</strong> who are excited to see more
              from you.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
