/**
 * Dashboard Page
 * Main entry point after authentication
 * Displays role-based content and actions
 */

import { useAuth } from "@/lib/auth";
import { useCan } from "@/lib/auth";
import { useNavigate, Link } from "react-router-dom";
import { analytics } from "@/lib/analytics";
import { useEffect } from "react";
import ActionButtonsHeader from "@/components/dashboard/ActionButtonsHeader";
import DashboardWidgets from "@/components/dashboard/DashboardWidgets";
import AlignedAISummary from "@/components/dashboard/AlignedAISummary";
import SmartDashboard from "@/components/analytics/SmartDashboard";
import { DashboardShell, KpiCard } from "@/components/DashboardSystem";
import { Sparkles, TrendingUp, MessageSquare } from "lucide-react";

// ============================================================================
// Unified Dashboard - Production Version
// ============================================================================

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const canCreateContent = useCan("content:create");
  const canManageBrand = useCan("brand:manage");

  // Track dashboard view
  useEffect(() => {
    analytics.track("dash_view", {
      dashboardId: "main",
      userId: user?.id,
    });
  }, [user?.id]);

  return (
    <DashboardShell
      title="Dashboard"
      subtitle={`Welcome back, ${user?.name}! You're logged in as ${role}`}
      headerActions={
        canCreateContent ? (
          <ActionButtonsHeader
            onCreateContent={() => navigate("/creative-studio")}
            onSchedulePost={() => navigate("/content-queue")}
            onPublishNow={() => {
              /* Handle publish */
            }}
            onBestTimeSuggestions={() => {
              /* Handle suggestions */
            }}
          />
        ) : undefined
      }
    >
      {/* Good News KPI Cards */}
      <KpiCard
        title="Content Created"
        value={5}
        delta={{ value: 25, trend: "up", label: "vs last week" }}
        icon={Sparkles}
        description="New pieces this week"
        className="col-span-1"
      />

      <KpiCard
        title="Impressions"
        value="3.2K"
        delta={{ value: 18, trend: "up", label: "vs last week" }}
        icon={TrendingUp}
        description="This week"
        className="col-span-1"
      />

      <KpiCard
        title="Engagements"
        value={256}
        delta={{ value: 12, trend: "up", label: "vs last week" }}
        icon={MessageSquare}
        description="Total interactions"
        className="col-span-1"
      />

      {/* AI Summary - Full Width */}
      {canCreateContent && (
        <div className="col-span-full">
          <AlignedAISummary />
        </div>
      )}

      {/* Dashboard Widgets - Full Width */}
      <div className="col-span-full">
        <DashboardWidgets
          items={[
            {
              id: "1",
              title: "LinkedIn Post Review",
              status: "pending",
              date: "2025-11-12",
            },
            {
              id: "2",
              title: "Twitter Thread Approval",
              status: "pending",
              date: "2025-11-11",
            },
          ]}
          onApprove={(id) => console.log("Approved:", id)}
          onReject={(id) => console.log("Rejected:", id)}
        />
      </div>

      {/* Analytics Overview - Full Width */}
      <div className="col-span-full">
        <h2 className="text-2xl font-bold mb-4">Analytics Overview</h2>
        <SmartDashboard hasGoals={true} />
      </div>

      {/* Brand Management Section - Admin only */}
      {canManageBrand && (
        <div className="col-span-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-100">
            Brand Management
          </h3>
          <p className="text-blue-700 dark:text-blue-300 mb-4">
            As an administrator, you have access to brand management tools.
          </p>
          <Link
            to="/brand-guide"
            className="inline-block px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            Manage Brand
          </Link>
        </div>
      )}
    </DashboardShell>
  );
}
