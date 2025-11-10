import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, X, Sparkles } from "lucide-react";
import { useHelpState } from "@/hooks/useHelpState";
import { GUIDED_TOUR_STEPS } from "@/types/help";

export default function Screen5GuidedTour() {
  const { user, completeOnboarding } = useAuth();
  const { markTourCompleted } = useHelpState();
  const [currentStep, setCurrentStep] = useState(0);
  const [tryItClicked, setTryItClicked] = useState(false);

  const step = GUIDED_TOUR_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < GUIDED_TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setTryItClicked(false);
    } else {
      markTourCompleted();
      completeOnboarding();
      window.location.href = "/dashboard";
    }
  };

  const handleTryIt = () => {
    setTryItClicked(true);
    if (step.action) {
      step.action.handler();
    }
    // Auto-advance after 2 seconds
    setTimeout(() => {
      handleNext();
    }, 2000);
  };

  const skipTour = () => {
    markTourCompleted();
    completeOnboarding();
    window.location.href = "/dashboard";
  };

  const getTooltipPosition = (stepId: number) => {
    const positions: Record<number, string> = {
      1: "top-40 left-8",
      2: "top-40 left-32",
      3: "top-40 left-56",
      4: "top-40 right-32",
    };
    return positions[stepId] || "top-32 left-8";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/30 via-white to-blue-50/20">
      {/* Header Section */}
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
            ✨ You're all set! Let's explore.
          </h1>
          <p className="text-slate-600 font-medium">
            Quick tour of your new command center
          </p>
        </div>

        {/* Interactive Tour Preview */}
        <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/60 p-8 mb-12 relative min-h-96">
          {/* Mock Navigation Items */}
          <div className="flex gap-3 mb-8 pb-8 border-b border-slate-200 overflow-x-auto">
            {GUIDED_TOUR_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentStep(idx);
                  setTryItClicked(false);
                }}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
                  step.id === s.id
                    ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-400"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {s.emoji} {s.title}
              </button>
            ))}
          </div>

          {/* Mock Content Area - Changes by step */}
          <div className="grid grid-cols-2 gap-4 opacity-50 mb-8">
            {currentStep === 0 && (
              <>
                <div className="h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg" />
                <div className="h-20 bg-gradient-to-br from-lime-100 to-green-100 rounded-lg" />
              </>
            )}
            {currentStep === 1 && (
              <>
                <div className="h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg" />
                <div className="h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg" />
              </>
            )}
            {currentStep === 2 && (
              <>
                <div className="h-20 bg-gradient-to-br from-pink-100 to-red-100 rounded-lg" />
                <div className="h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg" />
              </>
            )}
            {currentStep === 3 && (
              <>
                <div className="h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg" />
                <div className="h-20 bg-gradient-to-br from-sky-100 to-cyan-100 rounded-lg" />
              </>
            )}
          </div>

          {/* Tooltip */}
          <div
            className={`absolute ${getTooltipPosition(
              step.id
            )} bg-white rounded-xl shadow-2xl border border-indigo-200 p-6 max-w-sm animate-[slideDown_300ms_ease-out]`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="text-3xl">{step.emoji}</div>
              <div className="flex-1">
                <h3 className="font-black text-slate-900 text-base">{step.title}</h3>
              </div>
              <button
                onClick={skipTour}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <p className="text-xs font-medium text-slate-600 mb-4">{step.description}</p>

            {/* Step Progress */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1">
                {GUIDED_TOUR_STEPS.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 w-2 rounded-full transition-all ${
                      idx <= currentStep ? "bg-indigo-600" : "bg-slate-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-500">
                {currentStep + 1}/{GUIDED_TOUR_STEPS.length}
              </span>
            </div>

            {/* Try It Action Button */}
            {step.action && (
              <button
                onClick={handleTryIt}
                className="w-full px-3 py-2 mb-2 text-xs font-bold bg-lime-400 text-indigo-950 rounded-lg hover:bg-lime-300 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3 h-3" />
                {step.action.label}
              </button>
            )}

            {/* Navigation */}
            <div className="flex gap-2">
              <button
                onClick={skipTour}
                className="flex-1 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="flex-1 px-3 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1"
              >
                {currentStep === GUIDED_TOUR_STEPS.length - 1 ? "Finish" : "Next"}
                {currentStep === GUIDED_TOUR_STEPS.length - 1 && (
                  <ArrowRight className="w-3 h-3" />
                )}
              </button>
            </div>

            {tryItClicked && (
              <p className="text-xs text-slate-500 mt-3 text-center">
                ✓ Demo opened. Continuing tour...
              </p>
            )}
          </div>
        </div>

        {/* Bottom Progress Text */}
        <div className="text-center">
          <p className="text-sm text-slate-600 font-medium">
            Step {currentStep + 1} of {GUIDED_TOUR_STEPS.length}
          </p>
        </div>
      </div>
    </div>
  );
}
