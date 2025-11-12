import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { FirstVisitTooltip } from "@/components/dashboard/FirstVisitTooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SmartDashboard,
  ActionableInsights,
  GoalContentBridge,
  RootCauseAnalysis,
  SmartRefreshSettings,
  mockMetricChanges,
} from "@/components/analytics";
import { PlatformMetricsCarousel } from "@/components/dashboard/PlatformMetricsCarousel";
import { ReportingMenu } from "@/components/dashboard/ReportingMenu";
import { ReportSettingsModal } from "@/components/dashboard/ReportSettingsModal";
import { EmailReportDialog } from "@/components/dashboard/EmailReportDialog";
import { PlatformMetrics, DATE_RANGES } from "@/types/analytics";
import { Calendar, Settings as SettingsIcon, TrendingUp } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export default function AnalyticsEnhanced() {
  const { currentWorkspace } = useWorkspace();
  const [dateRange, setDateRange] = useState(DATE_RANGES[0]);
  const [showReportSettings, setShowReportSettings] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showRefreshSettings, setShowRefreshSettings] = useState(false);
  const [userRole] = useState<"first_time" | "power_user" | "client">(
    "first_time",
  );
  const [showRootCause, setShowRootCause] = useState(true);

  // Mock platform metrics data
  const platformMetrics: PlatformMetrics[] = [
    {
      platform: "instagram",
      icon: "📸",
      color: "from-pink-500 to-purple-600",
      period: "Nov 8 - Nov 14, 2024",
      metrics: {
        reach: 67850,
        engagement: 4120,
        engagementRate: 6.1,
        followers: 18920,
        followerGrowth: 4.5,
        topContent: [
          {
            title: "Reel: AI Tips & Tricks",
            type: "reel",
            engagement: 52,
            reach: 12400,
            icon: "🎞️",
          },
          {
            title: "Carousel: Content Calendar Breakdown",
            type: "post",
            engagement: 41,
            reach: 9800,
            icon: "📱",
          },
        ],
      },
      comparison: {
        reachChange: 18,
        engagementChange: 15,
        followerChange: 3.8,
        period: "previous week",
      },
    },
    // Add more platforms as needed
  ];

  const handleReportSettings = () => {
    setShowReportSettings(true);
  };

  const handleRunReport = () => {
    alert("Generating report...");
  };

  const handleEmailReport = () => {
    setShowEmailDialog(true);
  };

  const handleRefresh = async () => {
    // Implement refresh logic
    console.log("Refreshing analytics data...");
  };

  return (
    <MainLayout>
      <FirstVisitTooltip page="analytics">
        <div className="min-h-screen bg-gradient-to-b from-indigo-50/30 via-white to-blue-50/20">
          <div className="p-4 sm:p-6 md:p-8">
            {/* Page Header */}
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
                  Analytics
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm font-medium">
                  {currentWorkspace?.logo} {currentWorkspace?.name} — Smart,
                  actionable insights
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRefreshSettings(!showRefreshSettings)}
                  className="gap-2"
                >
                  <SettingsIcon className="h-4 w-4" />
                  Refresh Settings
                </Button>
                <ReportingMenu
                  onSettings={handleReportSettings}
                  onRun={handleRunReport}
                  onEmail={handleEmailReport}
                  dateRangeLabel={dateRange.label}
                />
              </div>
            </div>

            {/* Refresh Settings (Collapsible) */}
            {showRefreshSettings && (
              <div className="mb-8">
                <SmartRefreshSettings
                  onRefresh={handleRefresh}
                  className="max-w-2xl"
                />
              </div>
            )}

            {/* Date Range Selector */}
            <div className="mb-8 flex flex-wrap gap-2 sm:gap-3">
              {DATE_RANGES.map((range) => (
                <button
                  key={range.label}
                  onClick={() => setDateRange(range)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                    dateRange.label === range.label
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "bg-white/50 border border-white/60 text-slate-700 hover:border-indigo-300/50 hover:bg-white/70"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  {range.label}
                </button>
              ))}
            </div>

            {/* Root Cause Analysis (if metrics changed significantly) */}
            {showRootCause && (
              <div className="mb-8">
                <RootCauseAnalysis
                  changes={mockMetricChanges}
                  onDismiss={(metric) => {
                    console.log("Dismissed:", metric);
                    setShowRootCause(false);
                  }}
                />
              </div>
            )}

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="goals">Goals</TabsTrigger>
                <TabsTrigger value="platforms">Platforms</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-8">
                {/* Smart Dashboard - Contextual based on user role */}
                <SmartDashboard userRole={userRole} hasGoals={true} />

                {/* Platform Summaries */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                      <TrendingUp className="h-6 w-6 text-indigo-600" />
                      Platform Highlights
                    </h2>
                    <Button variant="outline" size="sm">
                      View All Platforms
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {platformMetrics.map((platform) => (
                      <div
                        key={platform.platform}
                        className="bg-white/50 backdrop-blur-xl rounded-2xl p-6 border border-white/60 hover:bg-white/70 hover:shadow-md transition-all duration-300"
                      >
                        <PlatformMetricsCarousel platform={platform} />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Insights Tab */}
              <TabsContent value="insights" className="space-y-8">
                <ActionableInsights />
              </TabsContent>

              {/* Goals Tab */}
              <TabsContent value="goals" className="space-y-8">
                <GoalContentBridge />
              </TabsContent>

              {/* Platforms Tab */}
              <TabsContent value="platforms" className="space-y-8">
                <div className="grid grid-cols-1 gap-6">
                  {platformMetrics.map((platform) => (
                    <div
                      key={platform.platform}
                      className="bg-white/50 backdrop-blur-xl rounded-2xl p-6 border border-white/60 hover:bg-white/70 hover:shadow-md transition-all duration-300"
                    >
                      <PlatformMetricsCarousel platform={platform} />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </FirstVisitTooltip>

      {/* Modals */}
      <ReportSettingsModal
        isOpen={showReportSettings}
        onClose={() => setShowReportSettings(false)}
        onSave={(settings) => {
          alert(`Report settings saved: ${settings.name}`);
          setShowReportSettings(false);
        }}
      />

      <EmailReportDialog
        isOpen={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
        onSend={(emails) => {
          alert(
            `Report sent to: ${emails.join(", ")}\nDate Range: ${dateRange.label}`,
          );
          setShowEmailDialog(false);
        }}
        dateRangeLabel={dateRange.label}
      />
    </MainLayout>
  );
}
