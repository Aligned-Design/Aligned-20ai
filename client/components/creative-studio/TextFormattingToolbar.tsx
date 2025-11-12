/**
 * Text Formatting Toolbar
 * Floats above selected text element with formatting controls
 */

import { useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CanvasItem } from "@/types/creativeStudio";

interface TextFormattingToolbarProps {
  item: CanvasItem;
  onUpdate: (updates: Partial<CanvasItem>) => void;
  position: { x: number; y: number };
}

export function TextFormattingToolbar({
  item,
  onUpdate,
  position,
}: TextFormattingToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (item.type !== "text") return null;

  const toggleBold = () => {
    onUpdate({
      fontWeight: item.fontWeight === "bold" ? "normal" : "bold",
    });
  };

  const toggleItalic = () => {
    // Note: Would need to add fontStyle to CanvasItem interface
    // For now, this is a placeholder
  };

  const setAlignment = (align: "left" | "center" | "right") => {
    onUpdate({ textAlign: align });
  };

  const increaseFontSize = () => {
    const currentSize = item.fontSize || 16;
    onUpdate({ fontSize: Math.min(currentSize + 2, 200) });
  };

  const decreaseFontSize = () => {
    const currentSize = item.fontSize || 16;
    onUpdate({ fontSize: Math.max(currentSize - 2, 8) });
  };

  // Quick color palette
  const quickColors = [
    "#000000",
    "#FFFFFF",
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
  ];

  return (
    <div
      className="absolute bg-white border border-slate-300 rounded-lg shadow-xl p-2 flex items-center gap-1 z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y - 60}px`,
        transform: "translateX(-50%)",
      }}
    >
      {/* Font Size */}
      <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={decreaseFontSize}
          className="h-8 w-8 p-0"
          aria-label="Decrease font size"
        >
          <Type className="w-3 h-3" />
        </Button>
        <span className="text-xs font-mono font-bold text-slate-700 w-8 text-center">
          {item.fontSize || 16}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={increaseFontSize}
          className="h-8 w-8 p-0"
          aria-label="Increase font size"
        >
          <Type className="w-4 h-4" />
        </Button>
      </div>

      {/* Bold */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleBold}
        className={`h-8 w-8 p-0 ${item.fontWeight === "bold" ? "bg-slate-200" : ""}`}
        aria-label="Bold"
        title="Bold (Cmd + B)"
      >
        <Bold className="w-4 h-4" />
      </Button>

      {/* Italic (placeholder) */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleItalic}
        className="h-8 w-8 p-0"
        aria-label="Italic"
        title="Italic (Cmd + I)"
      >
        <Italic className="w-4 h-4" />
      </Button>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* Alignment */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setAlignment("left")}
        className={`h-8 w-8 p-0 ${item.textAlign === "left" ? "bg-slate-200" : ""}`}
        aria-label="Align left"
      >
        <AlignLeft className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setAlignment("center")}
        className={`h-8 w-8 p-0 ${item.textAlign === "center" ? "bg-slate-200" : ""}`}
        aria-label="Align center"
      >
        <AlignCenter className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setAlignment("right")}
        className={`h-8 w-8 p-0 ${item.textAlign === "right" ? "bg-slate-200" : ""}`}
        aria-label="Align right"
      >
        <AlignRight className="w-4 h-4" />
      </Button>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* Color Picker */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="h-8 w-8 p-0"
          aria-label="Text color"
        >
          <div className="flex flex-col items-center justify-center">
            <Palette className="w-4 h-4" />
            <div
              className="w-4 h-1 rounded mt-0.5"
              style={{ backgroundColor: item.fontColor || "#000000" }}
            />
          </div>
        </Button>

        {/* Quick Color Palette */}
        {showColorPicker && (
          <div className="absolute top-full mt-2 left-0 bg-white border border-slate-300 rounded-lg shadow-xl p-2 grid grid-cols-4 gap-1 z-50">
            {quickColors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  onUpdate({ fontColor: color });
                  setShowColorPicker(false);
                }}
                className="w-6 h-6 rounded border-2 border-slate-200 hover:border-slate-400 cursor-pointer transition-all hover:scale-110"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
