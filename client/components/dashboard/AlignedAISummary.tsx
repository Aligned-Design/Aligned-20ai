import { Sparkles, Edit2, Save, X } from "lucide-react";
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { generateMockAnalyticsSummary } from "@/lib/summarizeAnalytics";

interface AlignedAISummaryProps {
  summary?: string;
  onSummaryChange?: (summary: string) => void;
  readOnly?: boolean;
}

export function AlignedAISummary({ summary, onSummaryChange, readOnly }: AlignedAISummaryProps) {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState(summary || generateMockAnalyticsSummary());
  const displaySummary = summary || editedSummary;

  // Only allow editing for agency admins/managers
  const canEdit = !readOnly && user.accountType === "agency" && (user.role === "admin" || user.role === "manager");

  const handleSave = () => {
    onSummaryChange?.(editedSummary);
    setIsEditing(false);
  };

  const handleRegenerateAI = () => {
    const newSummary = generateMockAnalyticsSummary();
    setEditedSummary(newSummary);
    onSummaryChange?.(newSummary);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50/30 to-blue-50/20 border border-indigo-200/40 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-indigo-200/40">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="font-black text-slate-900">Aligned AI Analytics Summary</h3>
        </div>

        {!isEditing && canEdit && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-lg opacity-0 hover:opacity-100 transition-opacity text-indigo-600 hover:bg-indigo-100"
            title="Edit summary"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Display Mode */}
      {!isEditing ? (
        <div>
          <p className="text-sm text-slate-700 font-medium leading-relaxed mb-4">{displaySummary}</p>

          {canEdit && (
            <div className="flex gap-2 pt-4 border-t border-indigo-200/40">
              <button
                onClick={handleRegenerateAI}
                className="flex-1 px-3 py-2 rounded-lg bg-indigo-100/50 border border-indigo-300/50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition-all"
              >
                <Sparkles className="w-3 h-3 inline mr-1" />
                Regenerate AI Summary
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Edit Mode */
        <div className="space-y-3">
          <textarea
            value={editedSummary}
            onChange={(e) => setEditedSummary(e.target.value)}
            className="w-full px-4 py-3 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-700"
            rows={4}
            placeholder="Edit your analytics summary..."
          />

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 px-3 py-2 rounded-lg bg-lime-400 hover:bg-lime-300 text-indigo-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Save className="w-3 h-3" />
              Save Summary
            </button>
            <button
              onClick={() => {
                setEditedSummary(displaySummary);
                setIsEditing(false);
              }}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
          </div>

          <p className="text-xs text-slate-600 font-medium">
            Word count: {editedSummary.split(" ").length}
          </p>
        </div>
      )}

      {/* Read-only indicator for business users */}
      {readOnly && user.role === "client" && (
        <p className="text-xs text-slate-500 italic mt-3 pt-3 border-t border-slate-200">
          This summary is provided by your agency and cannot be edited by your account.
        </p>
      )}
    </div>
  );
}
