/**
 * Approval History Panel
 * Shows timeline of approval events
 */

import { Clock, CheckCircle, XCircle, Send, User } from "lucide-react";
import { Design } from "@/types/creativeStudio";

interface ApprovalHistoryPanelProps {
  design: Design;
}

interface ApprovalEvent {
  type: "requested" | "approved" | "rejected";
  userId: string;
  userName: string;
  timestamp: string;
  notes?: string;
}

export function ApprovalHistoryPanel({ design }: ApprovalHistoryPanelProps) {
  // Build timeline from design data
  const events: ApprovalEvent[] = [];

  if (design.approvalRequestedBy && design.approvalRequestedAt) {
    events.push({
      type: "requested",
      userId: design.approvalRequestedBy,
      userName: "User", // In production, fetch from user service
      timestamp: design.approvalRequestedAt,
    });
  }

  if (design.approvedBy && design.approvedAt) {
    events.push({
      type: "approved",
      userId: design.approvedBy,
      userName: "Reviewer", // In production, fetch from user service
      timestamp: design.approvedAt,
    });
  }

  if (design.rejectedBy && design.rejectedAt) {
    events.push({
      type: "rejected",
      userId: design.rejectedBy,
      userName: "Reviewer", // In production, fetch from user service
      timestamp: design.rejectedAt,
      notes: design.rejectionReason,
    });
  }

  // Sort by timestamp (most recent first)
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (events.length === 0) {
    return (
      <div className="p-6 text-center">
        <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500">No approval history yet</p>
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "requested":
        return <Send className="w-4 h-4 text-blue-600" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-600" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "requested":
        return "bg-blue-100 border-blue-200";
      case "approved":
        return "bg-green-100 border-green-200";
      case "rejected":
        return "bg-red-100 border-red-200";
      default:
        return "bg-slate-100 border-slate-200";
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case "requested":
        return "Approval Requested";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return "Event";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Approval History
      </h3>

      <div className="space-y-3">
        {events.map((event, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border ${getEventColor(event.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-slate-900">
                    {getEventLabel(event.type)}
                  </p>
                  <span className="text-xs text-slate-500">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {event.userName}
                </p>
                {event.notes && (
                  <p className="text-xs text-slate-700 mt-2 p-2 bg-white/50 rounded border border-slate-200">
                    "{event.notes}"
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
