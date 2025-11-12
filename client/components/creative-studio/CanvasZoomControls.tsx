/**
 * Canvas Zoom Controls
 * Always-visible zoom widget in bottom-right corner
 */

import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CanvasZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  onReset: () => void;
  className?: string;
}

export function CanvasZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onReset,
  className = "",
}: CanvasZoomControlsProps) {
  return (
    <div
      className={`flex items-center gap-2 bg-white border border-slate-200 rounded-lg shadow-lg p-2 ${className}`}
    >
      {/* Zoom Out */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onZoomOut}
        disabled={zoom <= 25}
        className="h-8 w-8 p-0"
        aria-label="Zoom out"
        title="Zoom out (Cmd + -)"
      >
        <ZoomOut className="w-4 h-4" />
      </Button>

      {/* Zoom Percentage */}
      <div className="flex items-center gap-2 px-2 min-w-[80px]">
        <input
          type="range"
          min="25"
          max="200"
          step="5"
          value={zoom}
          onChange={(e) => {
            const newZoom = parseInt(e.target.value);
            if (newZoom > zoom) {
              onZoomIn();
            } else {
              onZoomOut();
            }
          }}
          className="w-12 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          aria-label="Zoom level"
        />
        <span className="text-xs font-mono font-bold text-slate-700 w-10 text-right">
          {zoom}%
        </span>
      </div>

      {/* Zoom In */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onZoomIn}
        disabled={zoom >= 200}
        className="h-8 w-8 p-0"
        aria-label="Zoom in"
        title="Zoom in (Cmd + +)"
      >
        <ZoomIn className="w-4 h-4" />
      </Button>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-200" />

      {/* Fit to Screen */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onFitToScreen}
        className="h-8 w-8 p-0"
        aria-label="Fit to screen"
        title="Fit to screen (Cmd + 0)"
      >
        <Maximize2 className="w-4 h-4" />
      </Button>

      {/* Reset Zoom */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onReset}
        className="h-8 px-2"
        aria-label="Reset zoom to 100%"
        title="Reset zoom (Cmd + Shift + 0)"
      >
        <RotateCcw className="w-3 h-3 mr-1" />
        <span className="text-xs font-bold">100%</span>
      </Button>
    </div>
  );
}
