import { useState } from "react";
import { SaveDropdown } from "./SaveDropdown";
import { SendToQueueDropdown } from "./SendToQueueDropdown";
import { ScheduleDropdown } from "./ScheduleDropdown";
import { MoreVertical } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ActionButtonsHeaderProps {
  hasUnsavedChanges: boolean;
  hasCaption: boolean;
  hasMedia: boolean;
  hasSchedule: boolean;
  scheduledTime?: string;
  lastSaveAction?: string;
  onSaveToLibrary: () => void;
  onSaveAsDraft: () => void;
  onSaveCreateVariant: () => void;
  onRenameAsset: () => void;
  onDownload: () => void;
  onSendToQueue: () => void;
  onSendPublishNow: () => void;
  onSendMultiplePlatforms: () => void;
  onOpenContentQueue: () => void;
  onSchedule: () => void;
  onScheduleAutoPublish: () => void;
  onViewCalendar: () => void;
  onBestTimeSuggestions: () => void;
  userRole?: "admin" | "manager" | "client";
}

export function ActionButtonsHeader({
  hasUnsavedChanges,
  hasCaption,
  hasMedia,
  hasSchedule,
  scheduledTime,
  lastSaveAction,
  onSaveToLibrary,
  onSaveAsDraft,
  onSaveCreateVariant,
  onRenameAsset,
  onDownload,
  onSendToQueue,
  onSendPublishNow,
  onSendMultiplePlatforms,
  onOpenContentQueue,
  onSchedule,
  onScheduleAutoPublish,
  onViewCalendar,
  onBestTimeSuggestions,
  userRole = "admin",
}: ActionButtonsHeaderProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const isMobile = useIsMobile();

  // Determine primary action context
  const isPrimarySave = hasUnsavedChanges;
  const isPrimaryQueue = !isPrimarySave && !hasSchedule;
  const isPrimarySchedule = !isPrimarySave && hasSchedule;

  // Check if Send to Queue is disabled
  const isSendToQueueDisabled = !hasCaption || !hasMedia;
  const sendToQueueDisabledReason = !hasCaption
    ? "Add caption/media to queue"
    : !hasMedia
      ? "Add media to queue"
      : undefined;

  // Check if Schedule is disabled (no platforms linked)
  const isScheduleDisabled = false; // Would check linked platforms
  const scheduleDisabledReason = undefined;

  // Check if user can publish
  const canPublish = userRole === "admin" || userRole === "manager";

  // Desktop layout: three buttons in a row
  if (!isMobile) {
    return (
      <div className="flex gap-2 flex-wrap items-center">
        <SaveDropdown
          isPrimary={isPrimarySave}
          hasUnsavedChanges={hasUnsavedChanges}
          lastAction={lastSaveAction}
          onSaveToLibrary={onSaveToLibrary}
          onSaveAsDraft={onSaveAsDraft}
          onSaveCreateVariant={onSaveCreateVariant}
          onRenameAsset={onRenameAsset}
          onDownload={onDownload}
        />

        <SendToQueueDropdown
          isPrimary={isPrimaryQueue}
          isDisabled={isSendToQueueDisabled}
          disabledReason={sendToQueueDisabledReason}
          lastAction={lastSaveAction}
          onSendToQueue={onSendToQueue}
          onSendPublishNow={canPublish ? onSendPublishNow : () => {}}
          onSendMultiplePlatforms={onSendMultiplePlatforms}
          onOpenContentQueue={onOpenContentQueue}
        />

        <ScheduleDropdown
          isPrimary={isPrimarySchedule}
          isDisabled={isScheduleDisabled}
          disabledReason={scheduleDisabledReason}
          hasSchedule={hasSchedule}
          lastAction={lastSaveAction}
          onSchedule={onSchedule}
          onScheduleAutoPublish={onScheduleAutoPublish}
          onViewCalendar={onViewCalendar}
          onBestTimeSuggestions={onBestTimeSuggestions}
        />
      </div>
    );
  }

  // Mobile layout: single primary button + More menu
  // Determine which action should be primary on mobile
  let primaryLabel = "Save";
  let primaryAction = onSaveToLibrary;

  if (isPrimarySave) {
    primaryLabel = "Save";
    primaryAction = onSaveToLibrary;
  } else if (isPrimaryQueue) {
    primaryLabel = "Send to Queue";
    primaryAction = onSendToQueue;
  } else if (isPrimarySchedule) {
    primaryLabel = "Update Schedule";
    primaryAction = onSchedule;
  }

  return (
    <div className="flex gap-2 items-center">
      {/* Primary Action Button */}
      <button
        onClick={primaryAction}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-lime-400 text-indigo-950 rounded-lg font-bold hover:bg-lime-500 transition-all text-sm"
      >
        <span>{primaryLabel}</span>
      </button>

      {/* More Menu */}
      <div className="relative">
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-all"
        >
          <MoreVertical className="w-4 h-4" />
          More
        </button>

        {/* More Menu Dropdown */}
        {showMoreMenu && (
          <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-white/60 z-50 overflow-hidden">
            {/* Save Section */}
            <div className="p-2 border-b border-slate-100">
              <p className="px-2 py-1 text-xs font-bold text-slate-500 uppercase">Save</p>
              <button
                onClick={() => {
                  onSaveToLibrary();
                  setShowMoreMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 rounded transition-colors"
              >
                Save to Library
              </button>
              <button
                onClick={() => {
                  onSaveAsDraft();
                  setShowMoreMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 rounded transition-colors"
              >
                Save as Draft
              </button>
              <button
                onClick={() => {
                  onSaveCreateVariant();
                  setShowMoreMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 rounded transition-colors"
              >
                Save & Create Variant
              </button>
            </div>

            {/* Queue Section */}
            <div className="p-2 border-b border-slate-100">
              <p className="px-2 py-1 text-xs font-bold text-slate-500 uppercase">Queue</p>
              <button
                onClick={() => {
                  if (!isSendToQueueDisabled) {
                    onSendToQueue();
                    setShowMoreMenu(false);
                  }
                }}
                disabled={isSendToQueueDisabled}
                className={`w-full px-3 py-2 text-left text-sm rounded transition-colors ${isSendToQueueDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50"}`}
                title={sendToQueueDisabledReason}
              >
                Send to Queue
              </button>
              {canPublish && (
                <button
                  onClick={() => {
                    onSendPublishNow();
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-rose-50 text-rose-700 rounded transition-colors"
                >
                  Send & Publish Now
                </button>
              )}
            </div>

            {/* Schedule Section */}
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-bold text-slate-500 uppercase">Schedule</p>
              <button
                onClick={() => {
                  onSchedule();
                  setShowMoreMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 rounded transition-colors"
              >
                {hasSchedule ? "Update Schedule" : "Schedule"}
              </button>
              <button
                onClick={() => {
                  onViewCalendar();
                  setShowMoreMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 rounded transition-colors"
              >
                View in Calendar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
