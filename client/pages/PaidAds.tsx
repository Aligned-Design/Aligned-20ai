import { MainLayout } from "@/components/layout/MainLayout";
import { AnalyticsPanel } from "@/components/dashboard/AnalyticsPanel";
import { InsightsFeed } from "@/components/dashboard/InsightsFeed";
import { Zap } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export default function PaidAds() {
  const { currentWorkspace } = useWorkspace();
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-indigo-50/30 via-white to-blue-50/20">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Page Header */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-1 sm:mb-2">
              Paid Ads
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">
              {currentWorkspace?.logo} {currentWorkspace?.name} — Manage and optimize campaigns across Meta, Google, and LinkedIn.
            </p>
          </div>

          {/* ZONE 1: Campaign Overview */}
          <div className="mb-12 bg-white/50 backdrop-blur-xl rounded-2xl p-6 border border-white/60 hover:bg-white/70 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-200/50 to-blue-200/40 flex items-center justify-center border border-indigo-200/30">
                <Zap className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Active Campaigns</h2>
                <p className="text-xs text-slate-600 font-medium">5 running • $2,450 spend this week</p>
              </div>
            </div>
            <p className="text-slate-600 text-sm">Connect Meta, Google, and LinkedIn accounts to manage campaigns directly from this dashboard.</p>
          </div>

          {/* ZONE 2: Campaign Performance & Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="bg-white/50 backdrop-blur-xl rounded-2xl p-6 border border-white/60 hover:bg-white/70 transition-all duration-300">
                <h3 className="text-lg font-black text-slate-900 mb-4">Campaign Performance</h3>
                <p className="text-slate-600 text-sm">Campaign metrics will appear here once ads are connected.</p>
              </div>
            </div>
            <div className="lg:sticky lg:top-20 lg:h-fit">
              <InsightsFeed />
            </div>
          </div>

          {/* ZONE 3: Detailed Analytics */}
          <div>
            <AnalyticsPanel />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
