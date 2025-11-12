/**
 * Keyboard Shortcuts Panel
 * Shows all available keyboard shortcuts
 */

import { X, Command, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KeyboardShortcutsPanelProps {
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  category: "General" | "Editing" | "Navigation" | "Actions";
}

const SHORTCUTS: Shortcut[] = [
  // General
  { keys: ["⌘", "/"], description: "Show this help", category: "General" },
  { keys: ["⌘", "S"], description: "Save to library", category: "General" },
  { keys: ["⌘", "Z"], description: "Undo", category: "General" },
  { keys: ["⌘", "Shift", "Z"], description: "Redo", category: "General" },
  { keys: ["Esc"], description: "Cancel/Deselect", category: "General" },

  // Editing
  { keys: ["⌘", "B"], description: "Bold text", category: "Editing" },
  { keys: ["⌘", "I"], description: "Italic text", category: "Editing" },
  { keys: ["Delete"], description: "Delete selected", category: "Editing" },
  { keys: ["⌘", "R"], description: "Rotate 45°", category: "Editing" },
  { keys: ["⌘", "D"], description: "Duplicate", category: "Editing" },

  // Navigation
  { keys: ["Tab"], description: "Next element", category: "Navigation" },
  { keys: ["Shift", "Tab"], description: "Previous element", category: "Navigation" },
  { keys: ["↑", "↓", "←", "→"], description: "Move element 1px", category: "Navigation" },
  { keys: ["Shift", "↑"], description: "Move element 10px", category: "Navigation" },

  // Zoom
  { keys: ["⌘", "+"], description: "Zoom in", category: "Navigation" },
  { keys: ["⌘", "-"], description: "Zoom out", category: "Navigation" },
  { keys: ["⌘", "0"], description: "Fit to screen", category: "Navigation" },
  { keys: ["⌘", "Shift", "0"], description: "Reset zoom 100%", category: "Navigation" },

  // Actions
  { keys: ["⌘", "Enter"], description: "Send to queue", category: "Actions" },
  { keys: ["⌘", "Shift", "S"], description: "Schedule post", category: "Actions" },
  { keys: ["⌘", "Shift", "P"], description: "Publish now", category: "Actions" },
];

export function KeyboardShortcutsPanel({ onClose }: KeyboardShortcutsPanelProps) {
  const categories = ["General", "Editing", "Navigation", "Actions"] as const;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-slate-600">
                Speed up your workflow with these shortcuts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-purple-600 rounded" />
                  {category}
                </h3>
                <div className="space-y-2">
                  {SHORTCUTS.filter((s) => s.category === category).map(
                    (shortcut, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <span className="text-sm text-slate-700">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, keyIdx) => (
                            <span key={keyIdx} className="flex items-center gap-1">
                              <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono font-bold text-slate-700 shadow-sm">
                                {key === "⌘" ? <Command className="w-3 h-3" /> : key}
                              </kbd>
                              {keyIdx < shortcut.keys.length - 1 && (
                                <span className="text-slate-400">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-600 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">/</kbd> anytime to show this panel
          </p>
        </div>
      </div>
    </div>
  );
}
