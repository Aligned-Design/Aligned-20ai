import { MainLayout } from "@/components/layout/MainLayout";
import { GoodNews } from "@/components/dashboard/GoodNews";
import { CalendarAccordion } from "@/components/dashboard/CalendarAccordion";
import { InsightsFeed } from "@/components/dashboard/InsightsFeed";
import { AnalyticsPanel } from "@/components/dashboard/AnalyticsPanel";
import { FirstVisitTooltip } from "@/components/dashboard/FirstVisitTooltip";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export default function Dashboard() {
  const { currentWorkspace } = useWorkspace();

  return (
    <MainLayout>
      <FirstVisitTooltip page="dashboard">
        <div className="min-h-screen bg-gradient-to-b from-indigo-50/30 via-white to-blue-50/20">
          <div className="p-4 sm:p-6 md:p-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 sm:mb-6 pb-4 border-b border-slate-200">
            <div className="min-w-0">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-1 sm:mb-2">Dashboard</h1>
              <p className="text-slate-600 text-xs sm:text-sm font-medium">
                {currentWorkspace?.logo} {currentWorkspace?.name} — Your daily command center
              </p>
            </div>
            <Button className="bg-lime-400 hover:bg-lime-300 text-indigo-950 font-black gap-2 shadow-lg shadow-lime-400/30 hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap flex-shrink-0">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Content</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>

          {/* ZONE 1: STRATEGIC OVERVIEW - "Today's Pulse" */}
          <div className="mb-10 sm:mb-14">
            <GoodNews />
          </div>

          {/* ZONE 2: OPERATIONAL WORKFLOW - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-14">
            {/* Left: Calendar Accordion (2/3 width) */}
            <div className="lg:col-span-2">
              <CalendarAccordion />
            </div>

            {/* Right: Insights Feed (1/3 width, sticky on desktop) */}
            <div className="lg:sticky lg:top-20 lg:h-fit">
              <InsightsFeed />
            </div>
          </div>

          {/* ZONE 3: INTELLIGENCE & DATA */}
          <div>
            <AnalyticsPanel />
          </div>
          </div>
        </div>
      </FirstVisitTooltip>
    </MainLayout>
  );
}
