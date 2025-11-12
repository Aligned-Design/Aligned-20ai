import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { FirstVisitTooltip } from "@/components/dashboard/FirstVisitTooltip";
import { CreativeStudioTemplateGrid } from "@/components/dashboard/CreativeStudioTemplateGrid";
import { CreativeStudioCanvas } from "@/components/dashboard/CreativeStudioCanvas";
import { CreativeStudioBrandKit } from "@/components/dashboard/CreativeStudioBrandKit";
import { CreativeStudioAdvisor } from "@/components/dashboard/CreativeStudioAdvisor";
import { SmartResizeModal } from "@/components/dashboard/SmartResizeModal";
import { MultiPlatformPreview } from "@/components/dashboard/MultiPlatformPreview";
import { ColorPickerModal } from "@/components/dashboard/ColorPickerModal";
import { ImageSelectorModal } from "@/components/dashboard/ImageSelectorModal";
import { ActionButtonsHeader } from "@/components/dashboard/ActionButtonsHeader";
import { RenameAssetModal } from "@/components/dashboard/RenameAssetModal";
import { PublishConfirmModal } from "@/components/dashboard/PublishConfirmModal";
import { ScheduleModal } from "@/components/dashboard/ScheduleModal";
import { PlatformSelectorModal } from "@/components/dashboard/PlatformSelectorModal";
import { BackgroundPickerModal } from "@/components/dashboard/BackgroundPickerModal";
import { ElementsDrawer } from "@/components/dashboard/ElementsDrawer";
import { Menu, Download, Share2, Send, Calendar, Save, X, Zap, Eye, Layout, Layers, Image as ImageIcon, MessageSquare, History } from "lucide-react";
import {
  Design,
  CanvasItem,
  DesignFormat,
  createInitialDesign,
  pushToHistory,
  undo,
  redo,
  CreativeStudioState,
} from "@/types/creativeStudio";
import { BrandGuide } from "@/types/brandGuide";
import { useToast } from "@/hooks/use-toast";
import { safeGetJSON, safeSetJSON } from "@/lib/safeLocalStorage";
import { useUser } from "@/contexts/UserContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { generateCaptions } from "@/lib/generateCaption";
import { isFeatureEnabled } from "@/lib/featureFlags";
import { ElementSidebar } from "@/components/dashboard/ElementSidebar";

// New Creative Studio Components
import { TabbedRightSidebar } from "@/components/creative-studio/TabbedRightSidebar";
import { CanvasZoomControls } from "@/components/creative-studio/CanvasZoomControls";
import { TextFormattingToolbar } from "@/components/creative-studio/TextFormattingToolbar";
import { ApprovalStatusBadge } from "@/components/creative-studio/ApprovalStatusBadge";
import { RequestApprovalModal } from "@/components/creative-studio/RequestApprovalModal";
import { ApprovalButtons } from "@/components/creative-studio/ApprovalButtons";
import { ApprovalHistoryPanel } from "@/components/creative-studio/ApprovalHistoryPanel";
import { CommentThreadPanel } from "@/components/creative-studio/CommentThreadPanel";
import { VersionHistoryTimeline } from "@/components/creative-studio/VersionHistoryTimeline";
import { LiveEditingIndicators } from "@/components/creative-studio/LiveEditingIndicators";
import { KeyboardShortcutsPanel } from "@/components/creative-studio/KeyboardShortcutsPanel";
import { MobileToolbar } from "@/components/creative-studio/MobileToolbar";

const AUTOSAVE_DELAY = 3000; // 3 seconds

export default function CreativeStudio() {
  // Brand data
  const [brand, setBrand] = useState<BrandGuide | null>(null);
  const { user } = useUser();
  const { currentWorkspace } = useWorkspace();

  // Canvas State
  const [state, setState] = useState<CreativeStudioState>({
    design: null,
    selectedItemId: null,
    startMode: null,
    zoom: 100,
    isDragging: false,
    showBrandKit: true,
    showAdvisor: true,
    history: [],
    historyIndex: -1,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>("");
  const [showSmartResize, setShowSmartResize] = useState(false);
  const [showPlatformPreview, setShowPlatformPreview] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);

  // Action dropdown modals
  const [showRenameAsset, setShowRenameAsset] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPlatformSelector, setShowPlatformSelector] = useState(false);

  // Elements drawer
  const [showElementsDrawer, setShowElementsDrawer] = useState(false);
  const [activeDrawerSection, setActiveDrawerSection] = useState<"elements" | "templates" | "background" | "media">("elements");
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // New features state
  const [showRequestApproval, setShowRequestApproval] = useState(false);
  const [showApprovalHistory, setShowApprovalHistory] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [activeUsers, setActiveUsers] = useState<Array<{ userId: string; userName: string; isEditing: boolean }>>([]);

  const { toast } = useToast();

  // Load brand guide from localStorage (defensive)
  useEffect(() => {
    const parsedBrand = safeGetJSON("brandGuide", null);
    if (parsedBrand) {
      setBrand(parsedBrand);
    }
  }, []);

  // Autosave design to localStorage (use safe setter)
  useEffect(() => {
    if (!state.design) return;

    const timer = setTimeout(() => {
      setIsSaving(true);
      safeSetJSON("creativeStudio_design", state.design);
      setLastSaved(new Date().toLocaleTimeString());
      setIsSaving(false);
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(timer);
  }, [state.design]);

  // Load design from localStorage on mount (defensive)
  useEffect(() => {
    const parsedDesign = safeGetJSON("creativeStudio_design", null);
    if (parsedDesign) {
      setState((prev) => ({
        ...prev,
        design: parsedDesign,
        history: [parsedDesign],
        historyIndex: 0,
      }));
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveToLibrary();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSendToQueue();
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "S") {
        e.preventDefault();
        setShowScheduleModal(true);
      } else if (e.key === "Delete" && state.selectedItemId) {
        e.preventDefault();
        handleDeleteItem();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "r" && state.selectedItemId) {
        e.preventDefault();
        handleRotateItem(45);
      } else if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.design, state.selectedItemId]);

  const handleStartDesign = (mode: "ai" | "template" | "scratch", format: DesignFormat) => {
    const newDesign = createInitialDesign(format, brand?.brandId || "default", "");
    setState((prev) => ({
      ...prev,
      design: newDesign,
      startMode: mode,
      selectedItemId: null,
      history: [newDesign],
      historyIndex: 0,
    }));
  };

  const handleCancel = () => {
    setState((prev) => ({
      ...prev,
      design: null,
      startMode: null,
      selectedItemId: null,
    }));
  };

  const handleSelectItem = (itemId: string | null) => {
    setState((prev) => ({
      ...prev,
      selectedItemId: itemId,
    }));
  };

  const handleUpdateItem = (itemId: string, updates: Partial<CanvasItem>) => {
    setState((prev) => {
      if (!prev.design) return prev;

      const updatedItems = prev.design.items.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      );

      const updatedDesign: Design = {
        ...prev.design,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      };

      return pushToHistory(prev, updatedDesign);
    });
  };

  const handleUpdateDesign = (updates: Partial<Design>) => {
    setState((prev) => {
      if (!prev.design) return prev;

      const updatedDesign: Design = {
        ...prev.design,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      return pushToHistory(prev, updatedDesign);
    });

    // Mark as unsaved if not saving
    if (!updates.savedToLibrary) {
      setHasUnsavedChanges(true);
    }
  };

  const handleAddText = () => {
    setState((prev) => {
      if (!prev.design) return prev;

      const newItem: CanvasItem = {
        id: `text-${Date.now()}`,
        type: "text",
        x: 50,
        y: 50,
        width: 200,
        height: 100,
        rotation: 0,
        zIndex: prev.design.items.length,
        text: "Click to edit text",
        fontSize: 24,
        fontFamily: brand?.fontFamily || "Arial",
        fontColor: brand?.primaryColor || "#000000",
        fontWeight: "normal",
        textAlign: "center",
      };

      const updatedItems = [...prev.design.items, newItem];
      const updatedDesign: Design = {
        ...prev.design,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      };

      return {
        ...pushToHistory(prev, updatedDesign),
        selectedItemId: newItem.id,
      };
    });
  };

  const handleAddImage = () => {
    setShowImageSelector(true);
  };

  const handleAddShape = (shapeType: "rectangle" | "circle") => {
    setState((prev) => {
      if (!prev.design) return prev;

      const newItem: CanvasItem = {
        id: `shape-${Date.now()}`,
        type: "shape",
        x: 50,
        y: 50,
        width: 150,
        height: 150,
        rotation: 0,
        zIndex: prev.design.items.length,
        shapeType,
        fill: brand?.primaryColor || "#3B82F6",
        stroke: "none",
      };

      const updatedItems = [...prev.design.items, newItem];
      const updatedDesign: Design = {
        ...prev.design,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      };

      return {
        ...pushToHistory(prev, updatedDesign),
        selectedItemId: newItem.id,
      };
    });
  };

  const handleColorPicker = () => {
    setShowColorPicker(true);
  };

  const handleSelectColor = (color: string) => {
    if (state.selectedItemId && state.design) {
      const item = state.design.items.find((i) => i.id === state.selectedItemId);
      if (item) {
        const updates: Partial<CanvasItem> = {};
        if (item.type === "text") {
          updates.fontColor = color;
        } else if (item.type === "shape") {
          updates.fill = color;
        } else if (item.type === "background") {
          updates.backgroundColor = color;
        }
        handleUpdateItem(state.selectedItemId, updates);
        toast({
          title: "Color Applied",
          description: "Color applied to selected element",
        });
      }
    } else {
      toast({
        title: "Select an Element",
        description: "Select a shape or text to apply the color",
      });
    }
  };

  const handleSelectImage = (imageUrl: string, imageName: string) => {
    setState((prev) => {
      if (!prev.design) return prev;

      const newItem: CanvasItem = {
        id: `image-${Date.now()}`,
        type: "image",
        x: 50,
        y: 50,
        width: 400,
        height: 400,
        rotation: 0,
        zIndex: prev.design.items.length,
        imageUrl,
        imageName,
      };

      const updatedItems = [...prev.design.items, newItem];
      const updatedDesign: Design = {
        ...prev.design,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      };

      return {
        ...pushToHistory(prev, updatedDesign),
        selectedItemId: newItem.id,
      };
    });

    toast({
    title: "Image Added",
    description: "Click and drag to reposition or resize",
  });
};

const handleAddElement = (elementType: string, defaultProps: Record<string, any>, x: number, y: number) => {
  setState((prev) => {
    if (!prev.design) return prev;

    // Default dimensions based on element type
    const defaultDimensions: Record<string, { width: number; height: number }> = {
      text: { width: 200, height: 100 },
      image: { width: 300, height: 300 },
      logo: { width: 120, height: 120 },
      shape: { width: 150, height: 150 },
      button: { width: 150, height: 50 },
      icon: { width: 100, height: 100 },
    };

    const dimensions = defaultDimensions[elementType] || { width: 150, height: 150 };

    const newItem: CanvasItem = {
      id: `${elementType}-${Date.now()}`,
      type: elementType === "text" ? "text" : elementType === "image" || elementType === "logo" ? "image" : elementType === "shape" ? "shape" : "text",
      x: Math.max(0, x - dimensions.width / 2),
      y: Math.max(0, y - dimensions.height / 2),
      width: dimensions.width,
      height: dimensions.height,
      rotation: 0,
      zIndex: prev.design.items.length,
      ...defaultProps,
    };

    const updatedItems = [...prev.design.items, newItem];
    const updatedDesign: Design = {
      ...prev.design,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    };

    return {
      ...pushToHistory(prev, updatedDesign),
      selectedItemId: newItem.id,
    };
  });

  toast({
    title: "Element Added",
    description: "Click and drag to reposition, or use the toolbar to edit",
  });
};

  // Wrapper for ElementsDrawer which calls (elementType, x, y)
  const handleElementDrag = (elementType: string, x: number, y: number) => {
    handleAddElement(elementType, {}, x, y);
  };

  const handleZoomIn = () => {
    setState((prev) => ({
      ...prev,
      zoom: Math.min(200, prev.zoom + 10),
    }));
  };

  const handleZoomOut = () => {
    setState((prev) => ({
      ...prev,
      zoom: Math.max(50, prev.zoom - 10),
    }));
  };

  const handleUndo = () => {
    setState(undo);
  };

  const handleRedo = () => {
    setState(redo);
  };

  const handleSaveToLibrary = () => {
    if (!state.design) return;

    const libraryAsset = {
      ...state.design,
      id: `asset-${Date.now()}`,
      campaignIds: state.design.campaignId ? [state.design.campaignId] : [],
      brandId: state.design.brandId,
      uploadedAt: new Date().toISOString(),
      uploadedBy: "current-user",
      tags: ["creative-studio"],
    };

    const existingAssets = safeGetJSON("libraryAssets", []) || [];
    existingAssets.push(libraryAsset);
    safeSetJSON("libraryAssets", existingAssets);

    setState((prev) => ({
      ...prev,
      design: prev.design
        ? {
            ...prev.design,
            savedToLibrary: true,
            libraryAssetId: libraryAsset.id,
            lastSaveAction: "saveToLibrary",
          }
        : null,
    }));

    setHasUnsavedChanges(false);
    const tags = [brand?.brandId, state.design.campaignId].filter(Boolean).join(", ");
    toast({
      title: "✅ Saved to Library",
      description: `${state.design.name} · Added tags: ${tags || "creative-studio"}`,
    });

    // Telemetry
    console.log("[telemetry] save_to_library", { designId: state.design.id, timestamp: new Date().toISOString() });
  };

  const handleSaveAsDraft = () => {
    if (!state.design) return;

    const draft = {
      ...state.design,
      id: `draft-${Date.now()}`,
      lastSaveAction: "saveAsDraft" as const,
    };

    const existingDrafts = safeGetJSON("creativeStudio_drafts", []) || [];
    existingDrafts.push(draft);
    safeSetJSON("creativeStudio_drafts", existingDrafts);

    setState((prev) => ({
      ...prev,
      design: prev.design ? { ...prev.design, lastSaveAction: "saveAsDraft" } : null,
    }));

    setHasUnsavedChanges(false);
    toast({
      title: "📝 Saved as Draft",
      description: `${state.design.name} · Ready for editing`,
    });

    console.log("[telemetry] save_as_draft", { designId: state.design.id, timestamp: new Date().toISOString() });
  };

  const handleSaveCreateVariant = () => {
    if (!state.design) return;

    const variant = {
      ...state.design,
      id: `variant-${Date.now()}`,
      name: `${state.design.name} (Variant)`,
      lastSaveAction: "saveCreateVariant" as const,
    };

    setState((prev) => ({
      ...prev,
      design: variant,
      history: [variant],
      historyIndex: 0,
    }));

    toast({
      title: "✨ Variant Created",
      description: `${variant.name} · Based on ${state.design.name}`,
    });

    console.log("[telemetry] save_create_variant", { originalId: state.design.id, variantId: variant.id });
  };

  const handleSendToQueue = () => {
    if (!state.design) return;

    setState((prev) => ({
      ...prev,
      design: prev.design ? { ...prev.design, lastSaveAction: "sendToQueue" } : null,
    }));

    toast({
      title: "📤 Sent to Queue",
      description: `${state.design.name} · In review status · View in Content Queue`,
    });

    console.log("[telemetry] send_to_queue", { designId: state.design.id });
  };

  const handleSendPublishNow = () => {
    if (!state.design) return;

    // Check role permission
    if (user?.role !== "admin" && user?.role !== "manager") {
      toast({
        title: "Permission Denied",
        description: "Only admins and managers can publish",
      });
      return;
    }

    setShowPublishConfirm(true);
  };

  const handleConfirmPublish = () => {
    if (!state.design) return;

    setState((prev) => ({
      ...prev,
      design: prev.design ? { ...prev.design, lastSaveAction: "sendPublishNow" } : null,
    }));

    toast({
      title: "🚀 Published Now",
      description: `${state.design.name} · Live on all platforms · View in Content Queue`,
    });

    console.log("[telemetry] send_publish_now", { designId: state.design.id });
    setShowPublishConfirm(false);
  };

  const handleSendMultiplePlatforms = () => {
    setShowPlatformSelector(true);
  };

  const handleConfirmMultiplePlatforms = (platforms: string[], createVariants: boolean) => {
    if (!state.design) return;

    setState((prev) => ({
      ...prev,
      design: prev.design
        ? {
            ...prev.design,
            scheduledPlatforms: platforms,
            lastSaveAction: "sendMultiplePlatforms",
          }
        : null,
    }));

    toast({
      title: "🌐 Sent to Platforms",
      description: `${state.design.name} → ${platforms.join(", ")}${createVariants ? " (optimized)" : ""}`,
    });

    console.log("[telemetry] send_multiple_platforms", { designId: state.design.id, platforms, createVariants });
  };

  const handleOpenContentQueue = () => {
    // Navigate to content queue page
    window.location.href = "/content-queue";
  };

  const handleSchedule = () => {
    setShowScheduleModal(true);
  };

  const handleConfirmSchedule = (date: string, time: string, autoPublish: boolean, platforms: string[]) => {
    if (!state.design) return;

    setState((prev) => ({
      ...prev,
      design: prev.design
        ? {
            ...prev.design,
            scheduledDate: date,
            scheduledTime: time,
            autoPublish,
            scheduledPlatforms: platforms,
            lastSaveAction: "schedule",
          }
        : null,
    }));

    toast({
      title: "⏰ Scheduled",
      description: `${state.design.name} · ${date} at ${time} → ${platforms.join(", ")}`,
    });

    console.log("[telemetry] schedule", { designId: state.design.id, date, time, platforms });
  };

  const handleViewCalendar = () => {
    // Navigate to calendar with date selected
    const date = state.design?.scheduledDate || new Date().toISOString().split("T")[0];
    window.location.href = `/calendar?date=${date}`;
  };

  const handleBestTimeSuggestions = () => {
    // Show best time suggestions in advisor panel
    setState((prev) => ({ ...prev, showAdvisor: true }));
    toast({
      title: "💡 Best Time Tips",
      description: "Check the Advisor panel on the right for AI-powered timing recommendations",
    });
  };

  const handleRenameAsset = () => {
    setShowRenameAsset(true);
  };

  const handleConfirmRename = (newName: string) => {
    if (!state.design) return;

    setState((prev) => ({
      ...prev,
      design: prev.design ? { ...prev.design, name: newName } : null,
    }));

    toast({
      title: "✏️ Renamed",
      description: `"${state.design.name}" �� "${newName}"`,
    });

    console.log("[telemetry] rename_asset", { designId: state.design.id, newName });
  };

  const handleDownload = () => {
    if (!state.design) return;

    // Mock download functionality
    toast({
      title: "⬇️ Download Started",
      description: `Preparing ${state.design.name}.png for download...`,
    });

    setState((prev) => ({
      ...prev,
      design: prev.design ? { ...prev.design, lastSaveAction: "download" } : null,
    }));

    console.log("[telemetry] download", { designId: state.design.id });
  };

  const handleRotateItem = (angle: number = 45) => {
    if (!state.design || !state.selectedItemId) return;

    const item = state.design.items.find((i) => i.id === state.selectedItemId);
    if (!item) return;

    const newRotation = ((item.rotation || 0) + angle) % 360;
    handleUpdateItem(state.selectedItemId, { rotation: newRotation });

    toast({
      title: "🔄 Rotated",
      description: `${item.type} rotated to ${newRotation}°`,
    });

    console.log("[telemetry] rotate_item", { itemId: state.selectedItemId, rotation: newRotation });
  };

  const handleDeleteItem = () => {
    if (!state.design || !state.selectedItemId) return;

    const item = state.design.items.find((i) => i.id === state.selectedItemId);
    if (!item) return;

    const itemId = state.selectedItemId;
    const itemType = item.type;

    const updatedItems = state.design.items.filter((i) => i.id !== itemId);
    const updatedDesign: Design = {
      ...state.design,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...pushToHistory(prev, updatedDesign),
      selectedItemId: null,
    }));

    toast({
      title: "����️ Deleted",
      description: `${itemType} element removed`,
    });

    console.log("[telemetry] delete_item", { itemId, itemType });
  };

  // Approval workflow handlers
  const handleRequestApproval = async (reviewers: string[], message?: string) => {
    if (!state.design) return;

    handleUpdateDesign({
      approvalStatus: "pending_approval",
      approvalRequestedBy: user?.id,
      approvalRequestedAt: new Date().toISOString(),
    });

    toast({
      title: "�� Approval Requested",
      description: `Sent to ${reviewers.length} reviewer(s)`,
    });

    setShowRequestApproval(false);
    console.log("[telemetry] request_approval", { designId: state.design.id, reviewers });
  };

  const handleApprove = async (notes?: string) => {
    if (!state.design) return;

    handleUpdateDesign({
      approvalStatus: "approved",
      approvedBy: user?.id,
      approvedAt: new Date().toISOString(),
    });

    toast({
      title: "✅ Design Approved",
      description: "Ready to schedule and publish",
    });

    console.log("[telemetry] approve_design", { designId: state.design.id, notes });
  };

  const handleReject = async (reason: string) => {
    if (!state.design) return;

    handleUpdateDesign({
      approvalStatus: "rejected",
      rejectedBy: user?.id,
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason,
    });

    toast({
      title: "Design Rejected",
      description: "Creator will be notified",
    });

    console.log("[telemetry] reject_design", { designId: state.design.id, reason });
  };

  // Comment handlers
  const handleAddComment = (text: string, elementId?: string, parentId?: string) => {
    if (!state.design) return;

    toast({
      title: "💬 Comment Added",
      description: "Your comment has been posted",
    });

    console.log("[telemetry] add_comment", { designId: state.design.id, text, elementId, parentId });
  };

  // Version history handlers
  const handleRestoreVersion = async (versionId: string) => {
    if (!state.design) return;

    toast({
      title: "⏮️ Version Restored",
      description: "Design reverted to previous state",
    });

    console.log("[telemetry] restore_version", { designId: state.design.id, versionId });
  };

  const handlePreviewVersion = (version: any) => {
    toast({
      title: "👁️ Version Preview",
      description: "Viewing previous version",
    });
  };

  // Fit to screen handler
  const handleFitToScreen = () => {
    setState((prev) => ({ ...prev, zoom: 100 }));
  };

  const handleChangeBackground = (backgroundColor: string) => {
    if (!state.design) return;

    const updatedDesign: Design = {
      ...state.design,
      backgroundColor,
      updatedAt: new Date().toISOString(),
    };

    setState((prev) => pushToHistory(prev, updatedDesign));
    setShowBackgroundModal(false);

    toast({
      title: "🎨 Background Changed",
      description: "Canvas background updated",
    });

    console.log("[telemetry] change_background", { backgroundColor });
  };

  const handleOpenTemplateLibrary = () => {
    setShowTemplateModal(true);
  };

  const handleOpenMedia = () => {
    setShowImageSelector(true);
  };

  const handleSelectTemplate = (design: Design) => {
    setState((prev) => ({
      ...prev,
      design,
      startMode: "template",
      selectedItemId: null,
      history: [design],
      historyIndex: 0,
    }));
  };

  // Show template grid if no design is active
  if (!state.design) {
    return (
      <MainLayout>
        <CreativeStudioTemplateGrid
          onSelectTemplate={(template) => {
            // Generate AI captions for the template
            const captions = generateCaptions(brand, null);
            const tpl = template.design || {} as any;
            const format = tpl.format || "social_square";
            const width = tpl.width || 1080;
            const height = tpl.height || 1080;
            const items = tpl.items || [];

            const design: Design = {
              id: `design-${Date.now()}`,
              name: tpl.name || template.name || "Template",
              format,
              width,
              height,
              brandId: brand?.brandId || "default",
              campaignId: "",
              items,
              backgroundColor: tpl.backgroundColor || "#ffffff",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              savedToLibrary: false,
            };
            setState((prev) => ({
              ...prev,
              design,
              startMode: "template",
              selectedItemId: null,
              history: [design],
              historyIndex: 0,
            }));
          }}
          onStartAI={() => {
            toast({
              title: "✨ Coming Soon",
              description: "AI-powered design generation will be available in Phase 1.5",
            });
          }}
          onCancel={() => {
            // Navigate back or close
            console.log("Cancelled template selection");
          }}
        />
      </MainLayout>
    );
  }

  // Show canvas editor
  return (
    <MainLayout>
      <FirstVisitTooltip page="studio">
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-white">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/60">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="text"
                  value={state.design.name}
                  onChange={(e) =>
                    handleUpdateDesign({ name: e.target.value })
                  }
                  className="text-2xl font-black text-slate-900 bg-transparent border-none outline-none"
                />
                {/* Approval Status Badge */}
                <ApprovalStatusBadge
                  status={state.design.approvalStatus || "draft"}
                  showIcon={true}
                />
              </div>
              <div className="text-right">
                {isSaving ? (
                  <p className="text-xs text-amber-600 font-semibold">Saving...</p>
                ) : lastSaved ? (
                  <p className="text-xs text-slate-500">Saved at {lastSaved}</p>
                ) : null}
              </div>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Action Buttons Header */}
            <div className="flex items-center justify-between gap-4">
              <ActionButtonsHeader
                hasUnsavedChanges={hasUnsavedChanges}
                hasCaption={state.design.items.some((item) => item.type === "text")}
                hasMedia={state.design.items.some((item) => item.type === "image")}
                hasSchedule={!!state.design.scheduledDate}
                scheduledTime={state.design.scheduledTime}
                lastSaveAction={state.design.lastSaveAction}
                onSaveToLibrary={handleSaveToLibrary}
                onSaveAsDraft={handleSaveAsDraft}
                onSaveCreateVariant={handleSaveCreateVariant}
                onRenameAsset={handleRenameAsset}
                onDownload={handleDownload}
                onSendToQueue={handleSendToQueue}
                onSendPublishNow={handleSendPublishNow}
                onSendMultiplePlatforms={handleSendMultiplePlatforms}
                onOpenContentQueue={handleOpenContentQueue}
                onSchedule={handleSchedule}
                onScheduleAutoPublish={() => {
                  setShowScheduleModal(true);
                }}
                onViewCalendar={handleViewCalendar}
                onBestTimeSuggestions={handleBestTimeSuggestions}
                userRole={user?.role}
              />


              {/* Utility Buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setShowSmartResize(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-bold hover:bg-purple-200 transition-all"
                >
                  <Zap className="w-4 h-4" />
                  Smart Resize
                </button>
                <button
                  onClick={() => setShowPlatformPreview(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-lg font-bold hover:bg-pink-200 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>

                {/* Request Approval */}
                {state.design.approvalStatus === "draft" && (
                  <button
                    onClick={() => setShowRequestApproval(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold hover:bg-blue-200 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    Request Approval
                  </button>
                )}

                {/* Comments */}
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold hover:bg-green-200 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  Comments {state.design.commentCount ? `(${state.design.commentCount})` : ''}
                </button>

                {/* Version History */}
                <button
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-bold hover:bg-indigo-200 transition-all"
                >
                  <History className="w-4 h-4" />
                  Versions
                </button>

                <button
                  onClick={() =>
                    setState((prev) => ({ ...prev, showBrandKit: !prev.showBrandKit }))
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  {state.showBrandKit ? "Hide Brand Kit" : "Show Brand Kit"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Element Sidebar - Compact Icon Menu with Zoom & Undo/Redo */}
          <ElementSidebar
            onCategoryClick={(categoryId) => {
              setActiveDrawerSection(categoryId as "elements" | "templates" | "background" | "media");
              setShowElementsDrawer(true);
            }}
            activeCategory={showElementsDrawer ? activeDrawerSection : undefined}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={state.historyIndex > 0}
            canRedo={state.historyIndex < state.history.length - 1}
          />

          {/* Canvas */}
          <div className="relative flex-1">
            <CreativeStudioCanvas
              design={state.design}
              selectedItemId={state.selectedItemId}
              zoom={state.zoom}
              onSelectItem={handleSelectItem}
              onUpdateItem={handleUpdateItem}
              onUpdateDesign={handleUpdateDesign}
              onAddElement={handleAddElement}
              onRotateItem={handleRotateItem}
              onDeleteItem={handleDeleteItem}
            />

            {/* Floating Text Toolbar */}
            {state.selectedItemId && (() => {
              const item = state.design?.items.find(i => i.id === state.selectedItemId);
              return item?.type === 'text' ? (
                <TextFormattingToolbar
                  item={item}
                  onUpdate={(updates) => handleUpdateItem(state.selectedItemId!, updates)}
                  position={{ x: item.x + item.width / 2, y: item.y }}
                />
              ) : null;
            })()}

            {/* Canvas Zoom Controls */}
            <CanvasZoomControls
              zoom={state.zoom}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onFitToScreen={handleFitToScreen}
              onReset={() => setState(prev => ({ ...prev, zoom: 100 }))}
              className="absolute bottom-4 right-4"
            />

            {/* Live Editing Indicators */}
            {activeUsers.length > 0 && (
              <LiveEditingIndicators
                activeUsers={activeUsers}
                className="absolute top-4 right-4"
              />
            )}
          </div>

          {/* Right Sidebar Container - New Tabbed Design */}
          {state.showBrandKit && (
            <TabbedRightSidebar
              brand={brand}
              design={state.design}
              onSelectColor={handleSelectColor}
              onSelectFont={(font) => {
                if (state.selectedItemId) {
                  handleUpdateItem(state.selectedItemId, { fontFamily: font });
                }
              }}
              onSelectLogo={() => {
                if (brand?.logoUrl) {
                  handleAddImage();
                }
              }}
              onClose={() => setState((prev) => ({ ...prev, showBrandKit: false }))}
              isCollapsible={true}
            />
          )}
        </div>
      </div>
      </FirstVisitTooltip>

      {/* Smart Resize Modal */}
      {showSmartResize && state.design && (
        <SmartResizeModal
          design={state.design}
          onResize={(newDesign) => {
            setState((prev) => pushToHistory(prev, newDesign));
            setShowSmartResize(false);
          }}
          onClose={() => setShowSmartResize(false)}
        />
      )}

      {/* Multi-Platform Preview Modal */}
      {showPlatformPreview && state.design && (
        <MultiPlatformPreview
          design={state.design}
          onClose={() => setShowPlatformPreview(false)}
        />
      )}

      {/* Color Picker Modal */}
      {showColorPicker && (
        <ColorPickerModal
          brandColors={[brand?.primaryColor, brand?.secondaryColor, ...(brand?.colorPalette || [])].filter(
            Boolean
          ) as string[]}
          onSelectColor={(color) => {
            handleSelectColor(color);
            setShowColorPicker(false);
          }}
          onClose={() => setShowColorPicker(false)}
        />
      )}

      {/* Image Selector Modal */}
      {showImageSelector && (
        <ImageSelectorModal
          onSelectImage={(imageUrl, imageName) => {
            handleSelectImage(imageUrl, imageName);
            setShowImageSelector(false);
          }}
          onClose={() => setShowImageSelector(false)}
        />
      )}

      {/* Rename Asset Modal */}
      {showRenameAsset && state.design && (
        <RenameAssetModal
          currentName={state.design.name}
          onConfirm={handleConfirmRename}
          onClose={() => setShowRenameAsset(false)}
        />
      )}

      {/* Publish Confirm Modal */}
      {showPublishConfirm && state.design && (
        <PublishConfirmModal
          designName={state.design.name}
          platforms={state.design.scheduledPlatforms || ["All"]}
          onConfirm={handleConfirmPublish}
          onCancel={() => setShowPublishConfirm(false)}
        />
      )}

      {/* Schedule Modal */}
      {showScheduleModal && state.design && (
        <ScheduleModal
          currentSchedule={{
            date: state.design.scheduledDate || "",
            time: state.design.scheduledTime || "12:00",
            autoPublish: state.design.autoPublish || false,
          }}
          onConfirm={handleConfirmSchedule}
          onClose={() => setShowScheduleModal(false)}
        />
      )}

      {/* Platform Selector Modal */}
      {showPlatformSelector && state.design && (
        <PlatformSelectorModal
          onConfirm={handleConfirmMultiplePlatforms}
          onClose={() => setShowPlatformSelector(false)}
        />
      )}

      {/* Background Picker Modal */}
      {showBackgroundModal && state.design && (
        <BackgroundPickerModal
          currentColor={state.design.backgroundColor || "#FFFFFF"}
          onConfirm={handleChangeBackground}
          onClose={() => setShowBackgroundModal(false)}
        />
      )}

      {/* Elements Drawer */}
      {state.design && (
        <ElementsDrawer
          isOpen={showElementsDrawer}
          onClose={() => setShowElementsDrawer(false)}
          onElementDrag={handleElementDrag}
          onOpenTemplates={() => {
            setShowElementsDrawer(false);
            // Open template library here if needed
          }}
          onOpenBackground={() => {
            setShowElementsDrawer(false);
            setShowBackgroundModal(true);
          }}
          onOpenMedia={() => {
            setShowElementsDrawer(false);
            setShowImageSelector(true);
          }}
          activeSection={activeDrawerSection}
        />
      )}

      {/* Request Approval Modal */}
      {showRequestApproval && state.design && (
        <RequestApprovalModal
          designName={state.design.name || "Untitled Design"}
          onConfirm={handleRequestApproval}
          onClose={() => setShowRequestApproval(false)}
        />
      )}

      {/* Keyboard Shortcuts Panel */}
      {showKeyboardShortcuts && (
        <KeyboardShortcutsPanel
          onClose={() => setShowKeyboardShortcuts(false)}
        />
      )}

      {/* Mobile Toolbar (shows on mobile devices) */}
      <div className="lg:hidden">
        <MobileToolbar
          onAddText={handleAddText}
          onAddImage={handleAddImage}
          onAddShape={() => handleAddShape("rectangle")}
          onShowColors={() => setShowColorPicker(true)}
          onShowLayers={() => {}}
          onSave={handleSaveToLibrary}
          onShare={() => setShowPlatformPreview(true)}
        />
      </div>
    </MainLayout>
  );
}
