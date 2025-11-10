import { useState } from "react";
import { Sparkles, Square, Plus } from "lucide-react";
import { Design, DesignFormat } from "@/types/creativeStudio";

// Template definitions for Phase 1
export interface StarterTemplate {
  id: string;
  name: string;
  category: "quote" | "product" | "testimonial" | "event" | "educational" | "blank";
  description: string;
  formats: DesignFormat[];
  preview: string;
  icon: string;
  design: Partial<Design> | null; // Will be completed on selection
}

const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: "template-quote-post",
    name: "Social Quote Post",
    category: "quote",
    description: "Centered quote with gradient background and logo",
    formats: ["social_square"],
    preview: "💬",
    icon: "💭",
    design: {
      name: "Quote Post",
      format: "social_square",
      width: 1080,
      height: 1080,
      items: [
        {
          id: "bg-1",
          type: "background",
          x: 0,
          y: 0,
          width: 1080,
          height: 1080,
          rotation: 0,
          zIndex: 0,
          backgroundType: "gradient",
          gradientFrom: "#6366F1",
          gradientTo: "#8B5CF6",
          gradientAngle: 135,
        },
        {
          id: "quote-text",
          type: "text",
          x: 108,
          y: 400,
          width: 864,
          height: 300,
          rotation: 0,
          zIndex: 2,
          text: '"Your inspirational quote goes here"',
          fontSize: 48,
          fontFamily: "Arial",
          fontColor: "#FFFFFF",
          fontWeight: "bold",
          textAlign: "center",
        },
      ],
      backgroundColor: "#6366F1",
      savedToLibrary: false,
    },
  },
  {
    id: "template-product-spotlight",
    name: "Product Spotlight",
    category: "product",
    description: "Image left, text right with CTA button",
    formats: ["social_square"],
    preview: "🎁",
    icon: "🎯",
    design: {
      name: "Product Post",
      format: "social_square",
      width: 1080,
      height: 1080,
      items: [
        {
          id: "bg-1",
          type: "background",
          x: 0,
          y: 0,
          width: 1080,
          height: 1080,
          rotation: 0,
          zIndex: 0,
          backgroundType: "solid",
          backgroundColor: "#F8FAFC",
        },
        {
          id: "text-title",
          type: "text",
          x: 54,
          y: 200,
          width: 972,
          height: 150,
          rotation: 0,
          zIndex: 1,
          text: "Product Name",
          fontSize: 48,
          fontFamily: "Arial",
          fontColor: "#1F2937",
          fontWeight: "900",
          textAlign: "center",
        },
        {
          id: "text-desc",
          type: "text",
          x: 54,
          y: 450,
          width: 972,
          height: 200,
          rotation: 0,
          zIndex: 1,
          text: "Describe your amazing product and why customers love it.",
          fontSize: 24,
          fontFamily: "Arial",
          fontColor: "#4B5563",
          fontWeight: "normal",
          textAlign: "center",
        },
      ],
      backgroundColor: "#F8FAFC",
      savedToLibrary: false,
    },
  },
  {
    id: "template-testimonial",
    name: "Client Testimonial",
    category: "testimonial",
    description: "Portrait photo with quote and gradient background",
    formats: ["social_square"],
    preview: "⭐",
    icon: "👤",
    design: {
      name: "Testimonial Post",
      format: "social_square",
      width: 1080,
      height: 1080,
      items: [
        {
          id: "bg-1",
          type: "background",
          x: 0,
          y: 0,
          width: 1080,
          height: 1080,
          rotation: 0,
          zIndex: 0,
          backgroundType: "solid",
          backgroundColor: "#FFFFFF",
        },
        {
          id: "stars",
          type: "text",
          x: 54,
          y: 150,
          width: 972,
          height: 80,
          rotation: 0,
          zIndex: 1,
          text: "★★★★★",
          fontSize: 56,
          fontFamily: "Arial",
          fontColor: "#FBBF24",
          fontWeight: "bold",
          textAlign: "center",
        },
        {
          id: "quote-text",
          type: "text",
          x: 108,
          y: 300,
          width: 864,
          height: 250,
          rotation: 0,
          zIndex: 1,
          text: '"This product changed my life!"',
          fontSize: 32,
          fontFamily: "Arial",
          fontColor: "#1F2937",
          fontWeight: "bold",
          textAlign: "center",
        },
        {
          id: "author-name",
          type: "text",
          x: 108,
          y: 650,
          width: 864,
          height: 100,
          rotation: 0,
          zIndex: 1,
          text: "Sarah Johnson, Happy Customer",
          fontSize: 24,
          fontFamily: "Arial",
          fontColor: "#1F2937",
          fontWeight: "bold",
          textAlign: "center",
        },
      ],
      backgroundColor: "#FFFFFF",
      savedToLibrary: false,
    },
  },
  {
    id: "template-event",
    name: "Event Announcement",
    category: "event",
    description: "Hero image with overlay text, date, and CTA",
    formats: ["social_square", "blog_featured"],
    preview: "📅",
    icon: "🎉",
    design: {
      name: "Event Post",
      format: "social_square",
      width: 1080,
      height: 1080,
      items: [
        {
          id: "bg-1",
          type: "background",
          x: 0,
          y: 0,
          width: 1080,
          height: 1080,
          rotation: 0,
          zIndex: 0,
          backgroundType: "solid",
          backgroundColor: "#DC2626",
        },
        {
          id: "headline",
          type: "text",
          x: 108,
          y: 350,
          width: 864,
          height: 250,
          rotation: 0,
          zIndex: 1,
          text: "Event Name: Join us soon!",
          fontSize: 56,
          fontFamily: "Arial",
          fontColor: "#FFFFFF",
          fontWeight: "900",
          textAlign: "center",
        },
        {
          id: "date-info",
          type: "text",
          x: 108,
          y: 650,
          width: 864,
          height: 100,
          rotation: 0,
          zIndex: 1,
          text: "Date & Time • Location",
          fontSize: 28,
          fontFamily: "Arial",
          fontColor: "#FEE2E2",
          fontWeight: "normal",
          textAlign: "center",
        },
      ],
      backgroundColor: "#DC2626",
      savedToLibrary: false,
    },
  },
  {
    id: "template-educational",
    name: "Educational Tip",
    category: "educational",
    description: "Header with numbered bullets and accent bar",
    formats: ["social_square", "story_portrait"],
    preview: "📚",
    icon: "💡",
    design: {
      name: "Educational Tip",
      format: "social_square",
      width: 1080,
      height: 1080,
      items: [
        {
          id: "bg-1",
          type: "background",
          x: 0,
          y: 0,
          width: 1080,
          height: 1080,
          rotation: 0,
          zIndex: 0,
          backgroundType: "solid",
          backgroundColor: "#FFFFFF",
        },
        {
          id: "header",
          type: "text",
          x: 54,
          y: 80,
          width: 972,
          height: 150,
          rotation: 0,
          zIndex: 1,
          text: "5 Tips for Success 💡",
          fontSize: 48,
          fontFamily: "Arial",
          fontColor: "#1F2937",
          fontWeight: "900",
          textAlign: "center",
        },
        {
          id: "accent-bar",
          type: "shape",
          x: 400,
          y: 250,
          width: 280,
          height: 8,
          rotation: 0,
          zIndex: 1,
          shapeType: "rectangle",
          fill: "#3B82F6",
        },
        {
          id: "content",
          type: "text",
          x: 108,
          y: 350,
          width: 864,
          height: 500,
          rotation: 0,
          zIndex: 1,
          text: "1. Start with a clear goal\n2. Build consistent habits\n3. Track your progress\n4. Stay accountable\n5. Celebrate wins",
          fontSize: 28,
          fontFamily: "Arial",
          fontColor: "#4B5563",
          fontWeight: "normal",
          textAlign: "left",
        },
      ],
      backgroundColor: "#FFFFFF",
      savedToLibrary: false,
    },
  },
  {
    id: "template-blank",
    name: "Blank Canvas",
    category: "blank",
    description: "Start with a blank canvas and full creative freedom",
    formats: ["social_square", "story_portrait", "blog_featured", "email_header"],
    preview: "⚪",
    icon: "🎨",
    design: {
      name: "Blank Design",
      format: "social_square",
      width: 1080,
      height: 1080,
      items: [
        {
          id: "bg-1",
          type: "background",
          x: 0,
          y: 0,
          width: 1080,
          height: 1080,
          rotation: 0,
          zIndex: 0,
          backgroundType: "solid",
          backgroundColor: "#FFFFFF",
        },
      ],
      backgroundColor: "#FFFFFF",
      savedToLibrary: false,
    },
  },
];

interface CreativeStudioTemplateGridProps {
  onSelectTemplate: (template: StarterTemplate) => void;
  onStartAI: () => void;
  onCancel: () => void;
}

export function CreativeStudioTemplateGrid({
  onSelectTemplate,
  onStartAI,
  onCancel,
}: CreativeStudioTemplateGridProps) {
  const [activeTab, setActiveTab] = useState<"ai" | "templates" | "blank">("templates");
  const [selectedFormat, setSelectedFormat] = useState<DesignFormat>("social_square");

  const getTemplatesForTab = () => {
    if (activeTab === "ai") {
      return [];
    }
    if (activeTab === "blank") {
      return STARTER_TEMPLATES.filter((t) => t.category === "blank");
    }
    return STARTER_TEMPLATES.filter((t) => t.category !== "blank");
  };

  const templates = getTemplatesForTab();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-blue-50/20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/60 p-6 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-lime-400" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Creative Studio</h1>
              <p className="text-sm text-slate-600 mt-1">Start creating on-brand designs in seconds</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab("ai")}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === "ai"
                  ? "bg-lime-400 text-indigo-950"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              ✨ Start from AI
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === "templates"
                  ? "bg-lime-400 text-indigo-950"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              📋 Template Library
            </button>
            <button
              onClick={() => setActiveTab("blank")}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === "blank"
                  ? "bg-lime-400 text-indigo-950"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              ⚪ Blank Canvas
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto p-6 sm:p-8">
        {/* AI Tab */}
        {activeTab === "ai" && (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-900 mb-3">AI-Powered Design</h2>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Describe what you want to create, and AI will generate a custom design based on your brand guide.
            </p>
            <button
              onClick={onStartAI}
              className="px-8 py-3 bg-lime-400 text-indigo-950 font-bold rounded-lg hover:shadow-lg hover:shadow-lime-200 transition-all"
            >
              Start with AI
            </button>
          </div>
        )}

        {/* Template Library Tab */}
        {activeTab === "templates" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-4">Professional Templates</h2>
              <p className="text-slate-600 mb-6">
                Choose a template and customize it with your brand colors, fonts, and copy.
              </p>

              {/* Template Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={() => onSelectTemplate(template)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Blank Canvas Tab */}
        {activeTab === "blank" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-4">Blank Canvas</h2>
              <p className="text-slate-600 mb-6">
                Start fresh with a blank canvas. Choose your format and start creating.
              </p>

              {/* Format Selection */}
              <div className="mb-8">
                <p className="text-sm font-bold text-slate-700 mb-4">Select Format</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(
                    [
                      { id: "social_square", name: "Square (1:1)", icon: "🟦" },
                      { id: "story_portrait", name: "Portrait (9:16)", icon: "📱" },
                      { id: "blog_featured", name: "Blog (16:9)", icon: "📝" },
                      { id: "email_header", name: "Email (3:1)", icon: "📧" },
                    ] as const
                  ).map((format) => (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id as DesignFormat)}
                      className={`p-4 rounded-lg border-2 transition-all text-center ${
                        selectedFormat === format.id
                          ? "border-lime-400 bg-lime-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="text-2xl mb-2">{format.icon}</div>
                      <p className="text-xs font-bold text-slate-700">{format.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Blank Canvas Card */}
              <button
                onClick={() => {
                  const blankTemplate = STARTER_TEMPLATES.find((t) => t.category === "blank");
                  if (blankTemplate) {
                    onSelectTemplate(blankTemplate);
                  }
                }}
                className="w-full bg-white border-2 border-slate-200 rounded-2xl p-12 hover:border-lime-400 hover:shadow-lg transition-all text-center group"
              >
                <div className="text-6xl mb-4 opacity-50 group-hover:opacity-75 transition-opacity">
                  ⚪
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Blank Canvas</h3>
                <p className="text-slate-600 mb-6">
                  Full creative freedom. Add your own text, images, and shapes.
                </p>
                <div className="inline-block px-6 py-2 bg-lime-400 text-indigo-950 font-bold rounded-lg group-hover:shadow-lg group-hover:shadow-lime-200 transition-all">
                  Start with Blank
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: StarterTemplate;
  onSelect: () => void;
}

function TemplateCard({ template, onSelect }: TemplateCardProps) {
  return (
    <button
      onClick={onSelect}
      className="group bg-white rounded-2xl border-2 border-slate-200 overflow-hidden hover:border-lime-400 hover:shadow-lg transition-all text-left"
    >
      {/* Preview Area */}
      <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center overflow-hidden relative">
        <div className="text-8xl opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all">
          {template.icon}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{template.name}</h3>
            <p className="text-xs text-slate-500 mt-1 font-semibold uppercase">
              {template.formats.join(" · ")}
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-4">{template.description}</p>

        {/* CTA */}
        <div className="pt-4 border-t border-slate-100">
          <span className="text-xs font-bold text-lime-600 group-hover:text-lime-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Use This Template
          </span>
        </div>
      </div>
    </button>
  );
}
