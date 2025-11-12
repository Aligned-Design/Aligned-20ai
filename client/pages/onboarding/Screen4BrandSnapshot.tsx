import { useAuth } from "@/contexts/AuthContext";
import { BrandDNAVisualization } from "@/components/onboarding/BrandDNAVisualization";

export default function Screen4BrandSnapshot() {
  const { brandSnapshot, setOnboardingStep } = useAuth();

  if (!brandSnapshot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50/30 via-white to-blue-50/20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-slate-600 font-medium">
            Loading your brand profile...
          </p>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    // Go back to brand intake to edit
    setOnboardingStep(3);
  };

  const handleConfirm = () => {
    // Continue to next step (connect accounts)
    setOnboardingStep(3.5);
  };

  // Transform brandSnapshot to brandData format expected by BrandDNAVisualization
  const brandData = {
    name: brandSnapshot.name || "Your Brand",
    colors: brandSnapshot.colors || [],
    tone: brandSnapshot.tone || [],
    voiceExample: brandSnapshot.voice,
    audience: brandSnapshot.audience,
    goal: brandSnapshot.goal,
    industry: brandSnapshot.industry,
    extractedMetadata: brandSnapshot.extractedMetadata || {
      keywords: [],
      coreMessaging: [],
      dos: [
        "Always maintain brand consistency",
        "Use approved color palette",
        "Include clear call-to-action",
        "Engage authentically with audience",
      ],
      donts: [
        "Don't use off-brand colors or fonts",
        "Avoid overly promotional language",
        "Don't post without review if approval required",
        "Avoid controversial topics unrelated to brand",
      ],
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/30 via-white to-blue-50/20 p-4">
      <div className="max-w-4xl mx-auto pt-6 pb-12">
        <BrandDNAVisualization
          brandData={brandData}
          onEdit={handleEdit}
          onConfirm={handleConfirm}
        />
      </div>
    </div>
  );
}
