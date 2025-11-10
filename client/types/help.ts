export type PageKey = "dashboard" | "calendar" | "library" | "studio" | "brand" | "analytics";

export interface TooltipStep {
  id: number;
  title: string;
  description: string;
  emoji: string;
  action?: {
    label: string;
    handler: () => void;
  };
}

export interface PageTip {
  page: PageKey;
  title: string;
  description: string;
  placement: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export interface OnboardingFlags {
  tourCompleted: boolean;
  tipsDismissed: Partial<Record<PageKey, boolean>>;
  helpLastOpen?: boolean;
}

export interface WorkspaceUIState {
  [wsId: string]: OnboardingFlags;
}

// Tour steps for Screen 5 and Help Drawer replay
export const GUIDED_TOUR_STEPS: TooltipStep[] = [
  {
    id: 1,
    emoji: "🧭",
    title: "Dashboard",
    description: "Your mission control. See insights, quick actions, and Advisor tips.",
    action: {
      label: "Try it: Create Draft",
      handler: () => {
        // Show a toast-like notification and auto-advance
        console.log("Demo: Create Draft modal would open here");
      },
    },
  },
  {
    id: 2,
    emoji: "📅",
    title: "Calendar",
    description: "Plan your week. Drag to schedule, switch Weekly/Monthly here.",
    action: {
      label: "Try it: Add Slot",
      handler: () => {
        // Show a toast-like notification and auto-advance
        console.log("Demo: Schedule picker would open here");
      },
    },
  },
  {
    id: 3,
    emoji: "🎨",
    title: "Creative Studio",
    description: "Design in brand. Start with AI, a template, or a blank canvas.",
    action: {
      label: "Try it: Open Template",
      handler: () => {
        // Show a toast-like notification and auto-advance
        console.log("Demo: Templates grid would open here");
      },
    },
  },
  {
    id: 4,
    emoji: "📖",
    title: "Brand Guide",
    description: "Keep tone, visuals, and goals aligned. Update anytime.",
    action: {
      label: "Open Brand Guide",
      handler: () => {
        window.location.href = "/brand-guide";
      },
    },
  },
];

// Page-specific tips for first-time visitors
export const PAGE_TIPS: Record<PageKey, PageTip> = {
  calendar: {
    page: "calendar",
    title: "Schedule with Ease",
    description: "Switch Weekly/Monthly here. Drag posts to reschedule.",
    placement: "top-right",
  },
  library: {
    page: "library",
    title: "Browse and Filter",
    description: "Filter by tags, size, or date. Use the Stock tab for curated images.",
    placement: "top-right",
  },
  studio: {
    page: "studio",
    title: "Start Creating",
    description: "Start with AI, a Template, or Blank. Your Brand Kit is on the right.",
    placement: "top-right",
  },
  brand: {
    page: "brand",
    title: "Define Your Identity",
    description: "Update voice, visuals, and goals anytime. Changes ripple across content.",
    placement: "top-right",
  },
  analytics: {
    page: "analytics",
    title: "Analyze Your Data",
    description: "Choose date range, then see Advisor suggestions below.",
    placement: "top-right",
  },
  dashboard: {
    page: "dashboard",
    title: "Your Control Center",
    description: "See your top metrics, upcoming posts, and Advisor insights here.",
    placement: "top-right",
  },
};

// Help drawer sections
export const HELP_SECTIONS = {
  tips: "Page Tips",
  tutorials: "Mini Tutorials",
  search: "Search Help",
  shortcuts: "Shortcuts",
};
