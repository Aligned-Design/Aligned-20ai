import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Plus, X } from "lucide-react";

interface PlatformAccount {
  id: string;
  name: string;
  emoji: string;
  connected: boolean;
  username?: string;
}

const PLATFORMS: PlatformAccount[] = [
  { id: "instagram", name: "Instagram", emoji: "📸", connected: false },
  { id: "facebook", name: "Facebook", emoji: "👥", connected: false },
  { id: "linkedin", name: "LinkedIn", emoji: "💼", connected: false },
  { id: "google", name: "Google Business", emoji: "🔍", connected: false },
  { id: "mailchimp", name: "Mailchimp", emoji: "📧", connected: false },
];

export default function Screen35ConnectAccounts() {
  const { setOnboardingStep } = useAuth();
  const [platforms, setPlatforms] = useState<PlatformAccount[]>(PLATFORMS);
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (id: string) => {
    setConnecting(id);
    // Simulate auth flow (real implementation would open OAuth dialog)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setPlatforms(platforms.map((p) => (p.id === id ? { ...p, connected: true, username: `@user_${id}` } : p)));
    setConnecting(null);
  };

  const handleDisconnect = (id: string) => {
    setPlatforms(platforms.map((p) => (p.id === id ? { ...p, connected: false, username: undefined } : p)));
  };

  const handleSkip = () => {
    setOnboardingStep(5);
  };

  const handleContinue = () => {
    setOnboardingStep(5);
  };

  const connectedCount = platforms.filter((p) => p.connected).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/30 via-white to-blue-50/20 p-4">
      <div className="max-w-2xl mx-auto pt-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100 mb-4">
            <span className="text-lg">🔗</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Connect Your Accounts</h1>
          <p className="text-slate-600 font-medium">
            (Optional) Link your social platforms to start publishing from Aligned.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="text-sm font-bold text-slate-600">
            {connectedCount} of {platforms.length} connected
          </div>
          <div className="flex gap-1">
            {platforms.map((p) => (
              <div
                key={p.id}
                className={`h-2 w-2 rounded-full transition-all ${
                  p.connected ? "bg-lime-400" : "bg-slate-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className={`relative p-6 rounded-2xl border-2 transition-all ${
                platform.connected
                  ? "bg-lime-50/50 border-lime-300 shadow-sm"
                  : "bg-white/50 border-slate-200 hover:border-indigo-300"
              }`}
            >
              {/* Platform Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-3xl mb-2">{platform.emoji}</div>
                  <h3 className="font-black text-slate-900 text-sm">{platform.name}</h3>
                </div>
                {platform.connected && <div className="text-lime-600 text-2xl">✓</div>}
              </div>

              {/* Status / Username */}
              {platform.connected ? (
                <div className="space-y-3">
                  <div className="px-3 py-2 bg-lime-100 rounded-lg">
                    <p className="text-xs text-lime-700 font-bold">Connected</p>
                    <p className="text-xs text-lime-800 font-medium">{platform.username}</p>
                  </div>
                  <button
                    onClick={() => handleDisconnect(platform.id)}
                    className="w-full px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(platform.id)}
                  disabled={connecting === platform.id}
                  className="w-full px-4 py-2 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {connecting === platform.id ? (
                    <>
                      <span className="inline-block animate-spin">⏳</span>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Connect
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 mb-8">
          <p className="text-xs text-blue-800 font-medium">
            💡 You can add or change platforms anytime from Settings. Starting without connections? No problem—use Aligned to plan and
            approve content, then manually post if needed.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 px-6 py-4 bg-white/50 border-2 border-slate-200 text-slate-700 font-black rounded-lg hover:bg-slate-50 transition-all"
          >
            Skip for Now
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
          >
            Continue
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
