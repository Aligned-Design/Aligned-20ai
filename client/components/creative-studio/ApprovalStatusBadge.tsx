/**
 * Approval Status Badge
 * Displays current approval status with color coding
 */

import { CheckCircle, Clock, XCircle, FileText } from "lucide-react";

export type ApprovalStatus = "draft" | "pending_approval" | "approved" | "rejected" | "scheduled";

interface ApprovalStatusBadgeProps {
  status: ApprovalStatus;
  className?: string;
  showIcon?: boolean;
}

const statusConfig: Record<
  ApprovalStatus,
  {
    label: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    icon: React.ComponentType<any>;
  }
> = {
  draft: {
    label: "Draft",
    bgColor: "bg-slate-100",
    textColor: "text-slate-700",
    borderColor: "border-slate-300",
    icon: FileText,
  },
  pending_approval: {
    label: "Pending Approval",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-300",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    borderColor: "border-green-300",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
    borderColor: "border-red-300",
    icon: XCircle,
  },
  scheduled: {
    label: "Scheduled",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    borderColor: "border-blue-300",
    icon: Clock,
  },
};

export function ApprovalStatusBadge({
  status,
  className = "",
  showIcon = true,
}: ApprovalStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span className="text-xs font-bold">{config.label}</span>
    </div>
  );
}
