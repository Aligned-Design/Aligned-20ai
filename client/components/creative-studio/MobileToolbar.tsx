/**
 * Mobile Toolbar
 * Touch-optimized toolbar for mobile/tablet devices
 */

import { Type, Image, Square, Palette, Layers, Save, Share2 } from "lucide-react";

interface MobileToolbarProps {
  onAddText: () => void;
  onAddImage: () => void;
  onAddShape: () => void;
  onShowColors: () => void;
  onShowLayers: () => void;
  onSave: () => void;
  onShare: () => void;
}

export function MobileToolbar({
  onAddText,
  onAddImage,
  onAddShape,
  onShowColors,
  onShowLayers,
  onSave,
  onShare,
}: MobileToolbarProps) {
  const tools = [
    { icon: Type, label: "Text", action: onAddText },
    { icon: Image, label: "Image", action: onAddImage },
    { icon: Square, label: "Shape", action: onAddShape },
    { icon: Palette, label: "Colors", action: onShowColors },
    { icon: Layers, label: "Layers", action: onShowLayers },
    { icon: Save, label: "Save", action: onSave },
    { icon: Share2, label: "Share", action: onShare },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-3">
        {tools.map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <button
              key={idx}
              onClick={tool.action}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg active:bg-slate-100 transition-colors touch-manipulation"
              aria-label={tool.label}
            >
              <Icon className="w-5 h-5 text-slate-700" />
              <span className="text-xs font-medium text-slate-600">
                {tool.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
