/**
 * Tabbed Right Sidebar for Creative Studio
 * Combines Brand Kit and Advisor into single clean panel
 */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreativeStudioBrandKit } from "@/components/dashboard/CreativeStudioBrandKit";
import { CreativeStudioAdvisor } from "@/components/dashboard/CreativeStudioAdvisor";
import { BrandGuide } from "@/types/brandGuide";
import { Design } from "@/types/creativeStudio";
import { Palette, Bot, X } from "lucide-react";

interface TabbedRightSidebarProps {
  brand: BrandGuide | null;
  design: Design | null;
  onSelectColor: (color: string) => void;
  onSelectFont: (fontFamily: string) => void;
  onSelectLogo: () => void;
  onClose?: () => void;
  isCollapsible?: boolean;
}

export function TabbedRightSidebar({
  brand,
  design,
  onSelectColor,
  onSelectFont,
  onSelectLogo,
  onClose,
  isCollapsible = false,
}: TabbedRightSidebarProps) {
  const [activeTab, setActiveTab] = useState<"brand-kit" | "advisor">("brand-kit");

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full">
      {/* Header with optional close button */}
      {isCollapsible && onClose && (
        <div className="flex items-center justify-between p-3 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900">Sidebar</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      )}

      {/* Tabbed Interface */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "brand-kit" | "advisor")}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-slate-200 bg-slate-50 p-0 h-12">
          <TabsTrigger
            value="brand-kit"
            className="rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-700 font-semibold flex items-center gap-2"
          >
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Brand Kit</span>
          </TabsTrigger>
          <TabsTrigger
            value="advisor"
            className="rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-700 font-semibold flex items-center gap-2"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">Advisor</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="brand-kit"
          className="flex-1 overflow-y-auto m-0 p-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <div className="p-4">
            <CreativeStudioBrandKit
              brand={brand}
              onSelectColor={onSelectColor}
              onSelectFont={onSelectFont}
              onSelectLogo={onSelectLogo}
            />
          </div>
        </TabsContent>

        <TabsContent
          value="advisor"
          className="flex-1 overflow-y-auto m-0 p-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <CreativeStudioAdvisor brand={brand} design={design} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
