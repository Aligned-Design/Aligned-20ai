/**
 * Approval Buttons
 * Approve/Reject buttons for reviewers
 */

import { useState } from "react";
import { CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApprovalButtonsProps {
  designName: string;
  onApprove: (notes?: string) => void;
  onReject: (reason: string) => void;
}

export function ApprovalButtons({
  designName,
  onApprove,
  onReject,
}: ApprovalButtonsProps) {
  const [showApproveNotes, setShowApproveNotes] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");

  const handleApprove = () => {
    if (showApproveNotes) {
      onApprove(notes || undefined);
      setNotes("");
      setShowApproveNotes(false);
    } else {
      setShowApproveNotes(true);
    }
  };

  const handleReject = () => {
    if (showRejectReason) {
      if (!reason.trim()) {
        alert("Please provide a reason for rejection");
        return;
      }
      onReject(reason);
      setReason("");
      setShowRejectReason(false);
    } else {
      setShowRejectReason(true);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Approval Buttons */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleApprove}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          {showApproveNotes ? "Confirm Approval" : "Approve"}
        </Button>
        <Button onClick={handleReject} variant="destructive" className="flex-1">
          <XCircle className="w-4 h-4 mr-2" />
          {showRejectReason ? "Confirm Rejection" : "Reject"}
        </Button>
      </div>

      {/* Approval Notes (Optional) */}
      {showApproveNotes && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <label className="text-sm font-bold text-green-900 mb-2 block flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Add Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any feedback or comments..."
            className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none bg-white"
            rows={3}
          />
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowApproveNotes(false);
                setNotes("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Rejection Reason (Required) */}
      {showRejectReason && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <label className="text-sm font-bold text-red-900 mb-2 block flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Reason for Rejection *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain what needs to be changed..."
            className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none bg-white"
            rows={3}
            required
          />
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowRejectReason(false);
                setReason("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
