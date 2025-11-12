/**
 * Request Approval Modal
 * Allows creator to request approval from team members
 */

import { useState } from "react";
import { X, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RequestApprovalModalProps {
  designName: string;
  onConfirm: (reviewers: string[], message?: string) => void;
  onClose: () => void;
}

// Mock team members - in production, fetch from API
const TEAM_MEMBERS = [
  { id: "user-1", name: "Sarah Johnson", role: "Content Manager", avatar: "SJ" },
  { id: "user-2", name: "Mike Chen", role: "Creative Director", avatar: "MC" },
  { id: "user-3", name: "Emily Davis", role: "Brand Manager", avatar: "ED" },
  { id: "user-4", name: "Alex Rivera", role: "Marketing Lead", avatar: "AR" },
];

export function RequestApprovalModal({
  designName,
  onConfirm,
  onClose,
}: RequestApprovalModalProps) {
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const toggleReviewer = (userId: string) => {
    setSelectedReviewers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = () => {
    if (selectedReviewers.length === 0) {
      alert("Please select at least one reviewer");
      return;
    }
    onConfirm(selectedReviewers, message || undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Send className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Request Approval</h2>
              <p className="text-sm text-slate-600">{designName}</p>
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
        <div className="p-6 space-y-6">
          {/* Select Reviewers */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
              <Users className="w-4 h-4" />
              Select Reviewers
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {TEAM_MEMBERS.map((member) => (
                <button
                  key={member.id}
                  onClick={() => toggleReviewer(member.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    selectedReviewers.includes(member.id)
                      ? "border-purple-600 bg-purple-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      selectedReviewers.includes(member.id)
                        ? "bg-purple-600 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {member.avatar}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-slate-900">{member.name}</p>
                    <p className="text-xs text-slate-600">{member.role}</p>
                  </div>
                  {selectedReviewers.includes(member.id) && (
                    <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Message */}
          <div>
            <label className="text-sm font-bold text-slate-900 mb-2 block">
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add context or specific feedback requests..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-purple-600 hover:bg-purple-700"
            disabled={selectedReviewers.length === 0}
          >
            <Send className="w-4 h-4 mr-2" />
            Send Request ({selectedReviewers.length})
          </Button>
        </div>
      </div>
    </div>
  );
}
