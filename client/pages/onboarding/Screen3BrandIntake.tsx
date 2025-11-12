import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Loader } from "lucide-react";
import { extractColorsFromImage, ColorSwatch } from "@/lib/colorExtraction";
import { PalettePreview } from "@/components/onboarding/PalettePreview";

interface BrandFormData {
  businessDescription: string;
  tone: string[];
  audience: string;
  goal: string;
  colors: string[];
  logo: File | null;
  extractedSwatches?: ColorSwatch[];
}

interface ScreenState {
  step: "questions" | "palette";
}

const TONE_OPTIONS = [
  { label: "Professional", emoji: "💼" },
  { label: "Playful", emoji: "🎉" },
  { label: "Inspiring", emoji: "✨" },
  { label: "Bold", emoji: "⚡" },
  { label: "Approachable", emoji: "🤝" },
];

// Color theme palettes - each palette has 2-3 colors
const COLOR_THEMES = [
  {
    name: "Professional",
    colors: ["#1F2937", "#3B82F6", "#E5E7EB"],
    emoji: "💼",
  },
  {
    name: "Vibrant",
    colors: ["#312E81", "#B9F227", "#EC4899"],
    emoji: "🌈",
  },
  {
    name: "Modern",
    colors: ["#0F172A", "#06B6D4", "#F43F5E"],
    emoji: "✨",
  },
  {
    name: "Earthy",
    colors: ["#92400E", "#D97706", "#F3E8FF"],
    emoji: "🌿",
  },
  {
    name: "Tech",
    colors: ["#1E293B", "#8B5CF6", "#10B981"],
    emoji: "🚀",
  },
  {
    name: "Bold",
    colors: ["#7C2D12", "#DC2626", "#FBBF24"],
    emoji: "⚡",
  },
  {
    name: "Minimal",
    colors: ["#000000", "#FFFFFF", "#64748B"],
    emoji: "◇",
  },
  {
    name: "Creative",
    colors: ["#EC4899", "#A855F7", "#0EA5E9"],
    emoji: "🎨",
  },
];

// Legacy presets for backward compatibility
const COLOR_PRESETS = COLOR_THEMES.flatMap((theme) => theme.colors).slice(0, 5);

const AUDIENCE_OPTIONS = [
  "Startups & SMBs",
  "Enterprise",
  "Consumers (B2C)",
  "Mixed",
  "Other",
];

const GOAL_OPTIONS = [
  { label: "Grow followers", emoji: "📈" },
  { label: "Get leads", emoji: "🎯" },
  { label: "Strengthen brand consistency", emoji: "✅" },
  { label: "Other", emoji: "🎨" },
];

export default function Screen3BrandIntake() {
  const { setOnboardingStep, setBrandSnapshot } = useAuth();
  const [form, setForm] = useState<BrandFormData>({
    businessDescription: "",
    tone: [],
    audience: "",
    goal: "",
    colors: [],
    logo: null,
  });
  const [screenState, setScreenState] = useState<ScreenState>({ step: "questions" });
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleTone = (tone: string) => {
    setForm((prev) => ({
      ...prev,
      tone: prev.tone.includes(tone)
        ? prev.tone.filter((t) => t !== tone)
        : [...prev.tone, tone],
    }));
  };

  const toggleColor = (color: string) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setForm((prev) => ({ ...prev, logo: file }));

      // Extract colors from logo
      const swatches = await extractColorsFromImage(file);
      setForm((prev) => ({ ...prev, extractedSwatches: swatches }));

      // Show palette preview if colors were extracted
      if (swatches.length > 0) {
        setScreenState({ step: "palette" });
      }
    }
  };

  const handlePaletteConfirm = (selectedColors: string[]) => {
    setForm((prev) => ({ ...prev, colors: selectedColors }));
    setScreenState({ step: "questions" });
  };

  const handleRegenerateVariants = async () => {
    // In a real app, this would regenerate variants
    // For now, just keep the extracted swatches
  };

  const generateBrandSnapshot = async () => {
    setIsGenerating(true);
    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const snapshot = {
      voice: form.businessDescription.slice(0, 50) + "...",
      tone: form.tone.length > 0 ? form.tone : ["Professional"],
      audience: form.audience || "Mixed",
      goal: form.goal || "Strengthen brand consistency",
      colors: form.colors.length > 0 ? form.colors : ["#312E81", "#B9F227"],
      logo: form.logo ? URL.createObjectURL(form.logo) : undefined,
    };

    setBrandSnapshot(snapshot);
    setIsGenerating(false);
    setOnboardingStep(3.5);
  };

  // All fields are optional - user can proceed with or without filling anything
  const isComplete = true;

  // Show palette preview if in palette step and swatches exist
  if (screenState.step === "palette" && form.extractedSwatches) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50/30 via-white to-blue-50/20 p-4">
        <div className="max-w-2xl mx-auto pt-6">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Your Brand Colors</h1>
            <p className="text-slate-600 font-medium">
              We've extracted these colors from your logo. Adjust or confirm to use them.
            </p>
          </div>

          <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/60 p-8 mb-8">
            <PalettePreview
              swatches={form.extractedSwatches}
              onConfirm={handlePaletteConfirm}
              onRegenerateVariants={handleRegenerateVariants}
            />
          </div>

          <button
            onClick={() => setScreenState({ step: "questions" })}
            className="w-full px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors"
          >
            ← Back to Questions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/30 via-white to-blue-50/20 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 pt-6">
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            Let's build your brand foundation
          </h1>
          <p className="text-slate-600 font-medium">
            This helps your content and AI stay on brand from day one.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            💡 All fields are optional — skip what you're unsure about
          </p>
        </div>

        {/* Form */}
        <div className="space-y-8 mb-8">
          {/* Q1: Business Description */}
          <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/60 p-6">
            <label className="block text-sm font-black text-slate-900 mb-3">
              1️⃣ Describe your business in one line (Optional)
            </label>
            <textarea
              value={form.businessDescription}
              onChange={(e) => setForm({ ...form, businessDescription: e.target.value })}
              placeholder="E.g., We help agencies create on-brand content at scale using AI..."
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-white/50 focus:border-indigo-500 focus:outline-none text-sm font-medium resize-none"
              rows={3}
            />
          </div>

          {/* Q2: Tone */}
          <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/60 p-6">
            <label className="block text-sm font-black text-slate-900 mb-4">
              2️⃣ What's your tone? (Optional)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {TONE_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  onClick={() => toggleTone(option.label)}
                  className={`px-3 py-3 rounded-lg border-2 font-bold text-sm transition-all text-center ${
                    form.tone.includes(option.label)
                      ? "bg-indigo-100 border-indigo-500 text-indigo-700"
                      : "bg-white/50 border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="text-lg mb-1">{option.emoji}</div>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Q3: Audience */}
          <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/60 p-6">
            <label className="block text-sm font-black text-slate-900 mb-3">
              3️⃣ Who's your audience? (Optional)
            </label>
            <select
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-white/50 focus:border-indigo-500 focus:outline-none font-medium"
            >
              <option value="">Select your audience...</option>
              {AUDIENCE_OPTIONS.map((aud) => (
                <option key={aud} value={aud}>
                  {aud}
                </option>
              ))}
            </select>
          </div>

          {/* Q4: Goal */}
          <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/60 p-6">
            <label className="block text-sm font-black text-slate-900 mb-4">
              4️⃣ What's your key goal?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GOAL_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  onClick={() => setForm({ ...form, goal: option.label })}
                  className={`px-4 py-3 rounded-lg border-2 font-bold text-sm transition-all text-left flex items-center gap-3 ${
                    form.goal === option.label
                      ? "bg-indigo-100 border-indigo-500 text-indigo-700"
                      : "bg-white/50 border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span className="text-xl">{option.emoji}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Q5: Logo Upload */}
          <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/60 p-6">
            <label className="block text-sm font-black text-slate-900 mb-3">
              5️⃣ Upload your logo (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-input"
              />
              <label htmlFor="logo-input" className="cursor-pointer block">
                {form.logo ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={URL.createObjectURL(form.logo)}
                      alt="Logo preview"
                      className="w-16 h-16 object-contain mb-2"
                    />
                    <p className="text-sm font-bold text-slate-700">{form.logo.name}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-2xl mb-2">📸</p>
                    <p className="text-sm font-bold text-slate-700">Click to upload</p>
                    <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Q6: Colors */}
          <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/60 p-6">
            <label className="block text-sm font-black text-slate-900 mb-4">
              6️⃣ Choose a color theme (Optional)
            </label>
            <p className="text-xs text-slate-600 mb-4">
              Pick a pre-made palette, upload a logo for AI color extraction, or manually select colors
            </p>

            {/* Theme Palettes */}
            <div className="space-y-3 mb-6">
              <p className="text-xs font-bold text-slate-700">Theme Palettes:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {COLOR_THEMES.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => setForm({ ...form, colors: theme.colors })}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      form.colors.length === theme.colors.length &&
                      theme.colors.every((c) => form.colors.includes(c))
                        ? "bg-indigo-100 border-indigo-500"
                        : "bg-white/50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="text-xl mb-2">{theme.emoji}</div>
                    <p className="text-xs font-bold text-slate-700 mb-2">{theme.name}</p>
                    <div className="flex gap-1 justify-center">
                      {theme.colors.map((color) => (
                        <div
                          key={color}
                          className="w-4 h-4 rounded border border-slate-300"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Color Selection */}
            {form.colors.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-xs font-bold text-slate-700 mb-3">Selected Colors:</p>
                <div className="flex flex-wrap gap-3">
                  {form.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => toggleColor(color)}
                      className="w-12 h-12 rounded-lg border-3 border-slate-900 shadow-md transition-all hover:opacity-75"
                      style={{ backgroundColor: color }}
                      title={`Remove ${color}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setForm({ ...form, colors: [] })}
                  className="text-xs text-slate-600 hover:text-slate-900 mt-3 font-medium"
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={generateBrandSnapshot}
          disabled={!isComplete || isGenerating}
          className={`w-full px-6 py-4 font-black rounded-lg transition-all flex items-center justify-center gap-2 group ${
            isComplete && !isGenerating
              ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-lg"
              : "bg-slate-200 text-slate-500 cursor-not-allowed"
          }`}
        >
          {isGenerating ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Analyzing your brand...
            </>
          ) : (
            <>
              Generate My Brand Guide
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
