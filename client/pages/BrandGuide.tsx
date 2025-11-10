import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { FirstVisitTooltip } from "@/components/dashboard/FirstVisitTooltip";
import { BrandGuide, INITIAL_BRAND_GUIDE, calculateCompletionPercentage } from "@/types/brandGuide";
import { BrandDashboard } from "@/components/dashboard/BrandDashboard";
import { BrandSummaryForm } from "@/components/dashboard/BrandSummaryForm";
import { VoiceToneEditor } from "@/components/dashboard/VoiceToneEditor";
import { VisualIdentityEditor } from "@/components/dashboard/VisualIdentityEditor";
import { PersonasEditor } from "@/components/dashboard/PersonasEditor";
import { GoalsEditor } from "@/components/dashboard/GoalsEditor";
import { GuardrailsEditor } from "@/components/dashboard/GuardrailsEditor";
import { BrandProgressMeter } from "@/components/dashboard/BrandProgressMeter";
import { AdvisorPlaceholder } from "@/components/dashboard/AdvisorPlaceholder";
import { BrandGuideWizard } from "@/components/dashboard/BrandGuideWizard";
import { StockImageModal } from "@/components/dashboard/StockImageModal";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { safeGetJSON, safeSetJSON } from "@/lib/safeLocalStorage";

type EditingSection = "dashboard" | "summary" | "voice" | "visual" | "personas" | "goals" | "guardrails" | "stock";

const AUTOSAVE_DELAY = 2000; // 2 seconds

export default function BrandGuidePageComponent() {
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();
  const [brand, setBrand] = useState<BrandGuide | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [editingSection, setEditingSection] = useState<EditingSection>("dashboard");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>("");
  const [showWizard, setShowWizard] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [brandStockImages, setBrandStockImages] = useState<any[]>([]);

  // Load from localStorage on mount (defensive)
  useEffect(() => {
    const parsedBrand = safeGetJSON("brandGuide", null);
    if (parsedBrand) {
      setBrand(parsedBrand);
      setShowWizard(false);
    } else {
      setShowWizard(true);
    }
  }, []);

  // Autosave with debounce
  useEffect(() => {
    if (!brand) return;

    const timer = setTimeout(() => {
      setIsSaving(true);
      safeSetJSON("brandGuide", brand);
      setLastSaved(new Date().toLocaleTimeString());
      setIsSaving(false);
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(timer);
  }, [brand]);

  // Update brand data
  const handleBrandUpdate = useCallback((updates: Partial<BrandGuide>) => {
    setBrand((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString(),
        completionPercentage: calculateCompletionPercentage({
          ...prev,
          ...updates,
        }),
      };
    });
  }, []);

  // Handle wizard completion
  const handleWizardComplete = (newBrand: BrandGuide) => {
    setBrand(newBrand);
    setShowWizard(false);
    safeSetJSON("brandGuide", newBrand);
  };

  // Show wizard if no brand exists
  if (showWizard && !brand) {
    return (
      <BrandGuideWizard
        onComplete={handleWizardComplete}
        onSkip={() => {
          setBrand(INITIAL_BRAND_GUIDE);
          setShowWizard(false);
        }}
      />
    );
  }

  // Show loading state while brand is being initialized
  if (!brand) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-blue-50/20 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-3">⏳</div>
            <p className="text-slate-600 font-bold">Loading your brand guide...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <FirstVisitTooltip page="brand">
        <div className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-blue-50/20">
          {/* Header */}
          <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/60">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900">Brand Guide</h1>
                <p className="text-sm text-slate-600 mt-1">
                  {currentWorkspace?.logo} {currentWorkspace?.name} — Define your brand identity, voice, and visual standards
                </p>
              </div>
              <div className="text-right">
                {isSaving ? (
                  <p className="text-xs text-amber-600 font-semibold">Saving...</p>
                ) : lastSaved ? (
                  <p className="text-xs text-slate-500">Saved at {lastSaved}</p>
                ) : null}
              </div>
            </div>

            {/* Section Navigation */}
            <div className="flex gap-2 flex-wrap overflow-x-auto">
              {(["dashboard", "summary", "voice", "visual", "personas", "goals", "guardrails", "stock"] as EditingSection[]).map((section) => (
                <button
                  key={section}
                  onClick={() => setEditingSection(section)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
                    editingSection === section
                      ? "bg-lime-400 text-indigo-950"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {section === "dashboard"
                    ? "Overview"
                    : section === "summary"
                    ? "Summary"
                    : section === "voice"
                    ? "Voice & Tone"
                    : section === "visual"
                    ? "Visual"
                    : section === "personas"
                    ? "Personas"
                    : section === "goals"
                    ? "Goals"
                    : section === "guardrails"
                    ? "Guardrails"
                    : "Stock Assets"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar: Progress & Navigation */}
            <div className="lg:col-span-1">
              <BrandProgressMeter percentage={brand.completionPercentage} />

              {/* Quick Nav Cards */}
              <div className="mt-6 space-y-3">
                {[
                  { id: "summary", label: "Summary", icon: "📝" },
                  { id: "voice", label: "Voice & Tone", icon: "🎤" },
                  { id: "visual", label: "Visual", icon: "🎨" },
                  { id: "personas", label: "Personas", icon: "👥" },
                  { id: "goals", label: "Goals", icon: "🎯" },
                  { id: "guardrails", label: "Guardrails", icon: "⚖️" },
                  { id: "stock", label: "Stock Assets", icon: "🌍" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setEditingSection(item.id as EditingSection)}
                    className={`w-full px-4 py-3 rounded-lg font-bold text-left text-sm transition-all ${
                      editingSection === item.id
                        ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-300"
                        : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Center: Main Content */}
            <div className="lg:col-span-2">
              {editingSection === "dashboard" && (
                <BrandDashboard brand={brand} onUpdate={handleBrandUpdate} />
              )}
              {editingSection === "summary" && (
                <BrandSummaryForm brand={brand} onUpdate={handleBrandUpdate} />
              )}
              {editingSection === "voice" && (
                <VoiceToneEditor brand={brand} onUpdate={handleBrandUpdate} />
              )}
              {editingSection === "visual" && (
                <VisualIdentityEditor brand={brand} onUpdate={handleBrandUpdate} />
              )}
              {editingSection === "personas" && (
                <PersonasEditor brand={brand} onUpdate={handleBrandUpdate} />
              )}
              {editingSection === "goals" && (
                <GoalsEditor brand={brand} onUpdate={handleBrandUpdate} />
              )}
              {editingSection === "guardrails" && (
                <GuardrailsEditor brand={brand} onUpdate={handleBrandUpdate} />
              )}
              {editingSection === "stock" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Brand Stock Assets</h2>
                    <p className="text-slate-600 mb-6">
                      Browse and assign stock images from Unsplash, Pexels, and Pixabay to your brand. All images come with proper attribution metadata.
                    </p>

                    <button
                      onClick={() => setShowStockModal(true)}
                      className="px-6 py-3 bg-lime-400 text-indigo-950 font-black rounded-lg hover:bg-lime-500 transition-colors"
                    >
                      🔍 Browse & Assign Stock
                    </button>
                  </div>

                  {/* Assigned Stock Images */}
                  {brandStockImages.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Assigned Stock Images ({brandStockImages.length})</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {brandStockImages.map((image: any) => (
                          <div key={image.id} className="group relative rounded-lg overflow-hidden border border-slate-200">
                            <img
                              src={image.previewUrl}
                              alt={image.title}
                              className="w-full aspect-square object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                              <button
                                onClick={() => setBrandStockImages((prev: any[]) => prev.filter((img) => img.id !== image.id))}
                                className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-red-600 text-white rounded font-bold text-sm transition-all"
                              >
                                ✕ Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Sidebar: Advisor Placeholder */}
            <div className="lg:col-span-1">
              <AdvisorPlaceholder brand={brand} />
            </div>
          </div>
        </div>

        {/* Stock Image Modal */}
        {showStockModal && (
          <StockImageModal
            isOpen={showStockModal}
            onClose={() => setShowStockModal(false)}
            onSelectImage={(image, action) => {
              if (action === "add-to-library") {
                setBrandStockImages((prev) => [...prev, image]);
                toast({
                  title: "Image Assigned",
                  description: `"${image.title}" added to brand stock assets`,
                });
              }
            }}
          />
        )}
        </div>
      </FirstVisitTooltip>
    </MainLayout>
  );
}
