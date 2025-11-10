import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Edit2, Check } from "lucide-react";

export default function Screen4BrandSnapshot() {
  const { brandSnapshot, setBrandSnapshot, setOnboardingStep } = useAuth();
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  if (!brandSnapshot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const startEdit = (field: string, value: string) => {
    setEditField(field);
    setEditValue(value);
  };

  const saveEdit = () => {
    if (editField && editValue.trim()) {
      setBrandSnapshot({
        ...brandSnapshot,
        [editField]: editField === "tone" ? editValue.split(",").map((t) => t.trim()) : editValue,
      });
      setEditField(null);
    }
  };

  const handleContinue = () => {
    setOnboardingStep(5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/30 via-white to-blue-50/20 p-4">
      <div className="max-w-2xl mx-auto pt-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Here's your Brand Snapshot</h1>
          <p className="text-slate-600 font-medium">
            Don't worry — your Brand Guide evolves as you do.
          </p>
        </div>

        {/* Brand Snapshot Card */}
        <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/60 p-8 space-y-6 mb-8">
          {/* Logo */}
          {brandSnapshot.logo && (
            <div className="flex justify-center">
              <img
                src={brandSnapshot.logo}
                alt="Brand logo"
                className="w-20 h-20 object-contain"
              />
            </div>
          )}

          {/* Brand Voice */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-black text-slate-900">Brand Voice</h3>
              <button
                onClick={() => startEdit("voice", brandSnapshot.voice)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4 text-indigo-600" />
              </button>
            </div>
            {editField === "voice" ? (
              <div className="flex gap-2">
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border-2 border-indigo-500 bg-white focus:outline-none text-sm font-medium"
                  rows={2}
                />
                <button
                  onClick={saveEdit}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p className="text-slate-700 font-medium text-sm">{brandSnapshot.voice}</p>
            )}
          </div>

          {/* Tone */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-black text-slate-900">Tone</h3>
              <button
                onClick={() => startEdit("tone", brandSnapshot.tone.join(", "))}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4 text-indigo-600" />
              </button>
            </div>
            {editField === "tone" ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border-2 border-indigo-500 bg-white focus:outline-none text-sm font-medium"
                  placeholder="E.g., Professional, Approachable"
                />
                <button
                  onClick={saveEdit}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {brandSnapshot.tone.map((t) => (
                  <span
                    key={t}
                    className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Audience */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-black text-slate-900">Audience</h3>
              <button
                onClick={() => startEdit("audience", brandSnapshot.audience)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4 text-indigo-600" />
              </button>
            </div>
            {editField === "audience" ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border-2 border-indigo-500 bg-white focus:outline-none text-sm font-medium"
                />
                <button
                  onClick={saveEdit}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p className="text-slate-700 font-medium text-sm">{brandSnapshot.audience}</p>
            )}
          </div>

          {/* Goal */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-black text-slate-900">Key Goal</h3>
              <button
                onClick={() => startEdit("goal", brandSnapshot.goal)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4 text-indigo-600" />
              </button>
            </div>
            {editField === "goal" ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border-2 border-indigo-500 bg-white focus:outline-none text-sm font-medium"
                />
                <button
                  onClick={saveEdit}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p className="text-slate-700 font-medium text-sm">{brandSnapshot.goal}</p>
            )}
          </div>

          {/* Colors */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-black text-slate-900 mb-4">Brand Colors</h3>
            <div className="flex flex-wrap gap-3">
              {brandSnapshot.colors.map((color) => (
                <div key={color} className="flex flex-col items-center gap-2">
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-slate-200 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <p className="text-xs font-bold text-slate-600">{color}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleContinue}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
          >
            Looks Great
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-500 text-center">
          You can update your Brand Guide anytime from the settings page.
        </p>
      </div>
    </div>
  );
}
