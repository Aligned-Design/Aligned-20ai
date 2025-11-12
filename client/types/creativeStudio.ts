export type CanvasItemType = "text" | "image" | "shape" | "background";
export type ShapeType = "rectangle" | "circle";
export type StartMode = "ai" | "template" | "scratch";
export type DesignFormat = "social_square" | "story_portrait" | "blog_featured" | "email_header" | "custom";

export interface CanvasItem {
  id: string;
  type: CanvasItemType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  locked?: boolean;

  // Text properties
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontColor?: string;
  fontWeight?: "normal" | "bold" | "900";
  textAlign?: "left" | "center" | "right";

  // Image properties
  imageUrl?: string;
  imageName?: string;

  // Shape properties
  shapeType?: ShapeType;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;

  // Background properties
  backgroundType?: "solid" | "gradient";
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientAngle?: number;
}

export interface Design {
  id: string;
  name?: string;
  format: DesignFormat;
  width: number;
  height: number;
  brandId: string;
  campaignId?: string;
  items: CanvasItem[];
  backgroundColor?: string;
  createdAt: string;
  updatedAt: string;
  savedToLibrary: boolean;
  libraryAssetId?: string;
  // Scheduling and publishing
  scheduledDate?: string;
  scheduledTime?: string;
  scheduledPlatforms?: string[];
  autoPublish?: boolean;
  lastSaveAction?: "saveToLibrary" | "saveAsDraft" | "saveCreateVariant" | "sendToQueue" | "sendPublishNow" | "sendMultiplePlatforms" | "schedule" | "scheduleAutoPublish" | "viewCalendar" | "download";
  // Approval workflow
  approvalStatus?: "draft" | "pending_approval" | "approved" | "rejected" | "scheduled";
  approvalRequestedBy?: string;
  approvalRequestedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  // Comments and collaboration
  commentCount?: number;
  versionNumber?: number;
}

export interface CreativeStudioState {
  design: Design | null;
  selectedItemId: string | null;
  startMode: StartMode | null;
  zoom: number;
  isDragging: boolean;
  showBrandKit: boolean;
  showAdvisor: boolean;
  history: Design[];
  historyIndex: number;
}

export interface DesignAsset {
  id: string;
  type: "logo" | "color" | "font" | "image";
  name?: string;
  value: string | { color: string; name: string } | { fontFamily: string; fontUrl?: string };
  brandId: string;
  category?: string;
}

// Format presets
export const FORMAT_PRESETS: Record<DesignFormat, { name: string; width: number; height: number; icon: string }> = {
  social_square: { name: "Social Square", width: 1080, height: 1080, icon: "🟦" },
  story_portrait: { name: "Story/Portrait", width: 1080, height: 1920, icon: "📱" },
  blog_featured: { name: "Blog Featured", width: 1200, height: 675, icon: "📝" },
  email_header: { name: "Email Header", width: 800, height: 300, icon: "📧" },
  custom: { name: "Custom", width: 1200, height: 800, icon: "🖼️" },
};

// Start mode options
export const START_MODE_OPTIONS = [
  { id: "ai", label: "Start from AI", description: "Let AI generate designs based on your brand", icon: "✨" },
  { id: "template", label: "Start from Template", description: "Choose from pre-designed templates", icon: "📋" },
  { id: "scratch", label: "Start from Scratch", description: "Create a design from a blank canvas", icon: "⚪" },
] as const;

// Initial design template
export const createInitialDesign = (format: DesignFormat, brandId: string, campaignId?: string): Design => {
  const preset = FORMAT_PRESETS[format];
  return {
    id: `design-${Date.now()}`,
    name: `Untitled Design`,
    format,
    width: preset.width,
    height: preset.height,
    brandId,
    campaignId,
    items: [
      {
        id: "bg-1",
        type: "background",
        x: 0,
        y: 0,
        width: preset.width,
        height: preset.height,
        rotation: 0,
        zIndex: 0,
        backgroundType: "solid",
        backgroundColor: "#ffffff",
      },
    ],
    backgroundColor: "#ffffff",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    savedToLibrary: false,
  };
};

// Undo/Redo helpers
export const pushToHistory = (state: CreativeStudioState, design: Design): CreativeStudioState => {
  return {
    ...state,
    history: [...state.history.slice(0, state.historyIndex + 1), design],
    historyIndex: state.historyIndex + 1,
    design,
  };
};

export const undo = (state: CreativeStudioState): CreativeStudioState => {
  if (state.historyIndex <= 0) return state;
  const newIndex = state.historyIndex - 1;
  return {
    ...state,
    historyIndex: newIndex,
    design: state.history[newIndex],
  };
};

export const redo = (state: CreativeStudioState): CreativeStudioState => {
  if (state.historyIndex >= state.history.length - 1) return state;
  const newIndex = state.historyIndex + 1;
  return {
    ...state,
    historyIndex: newIndex,
    design: state.history[newIndex],
  };
};
