import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  Send,
  Calendar,
  Users,
  Info,
  AlertCircle,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: "admin" | "manager" | "creator" | "client";
  email: string;
}

interface RoleBasedApprovalFlowProps {
  userRole: "admin" | "manager" | "creator" | "client";
  requiresApproval: boolean; // from brand settings
  teamMembers?: TeamMember[];
  onRequestApproval?: (approverId: string, message?: string) => void;
  onPublish?: () => void;
  onSchedule?: () => void;
  className?: string;
}

export function RoleBasedApprovalFlow({
  userRole,
  requiresApproval,
  teamMembers = [],
  onRequestApproval,
  onPublish,
  onSchedule,
  className,
}: RoleBasedApprovalFlowProps) {
  const [selectedApprover, setSelectedApprover] = useState<string>("");
  const [approvalMessage, setApprovalMessage] = useState("");
  const [showApprovalForm, setShowApprovalForm] = useState(false);

  // Auto-detect eligible approvers (admins and managers)
  const eligibleApprovers = teamMembers.filter(
    (member) => member.role === "admin" || member.role === "manager"
  );

  // Auto-assign to first available admin/manager if only one exists
  const autoAssignedApprover =
    eligibleApprovers.length === 1 ? eligibleApprovers[0] : null;

  const handleRequestApproval = () => {
    const approverId = selectedApprover || autoAssignedApprover?.id || "";
    if (approverId && onRequestApproval) {
      onRequestApproval(approverId, approvalMessage);
      setShowApprovalForm(false);
      setApprovalMessage("");
    }
  };

  // Solo Creator - No approval needed
  if (userRole === "creator" && !requiresApproval) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Info Banner */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-green-900 mb-1">
                    ✅ Ready to Publish
                  </p>
                  <p className="text-xs text-green-800">
                    You have permission to publish directly. No approval required.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {onSchedule && (
                <Button
                  variant="outline"
                  onClick={onSchedule}
                  className="gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule for Later
                </Button>
              )}
              {onPublish && (
                <Button
                  onClick={onPublish}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2"
                >
                  <Send className="w-4 h-4" />
                  Publish Now
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Team Member - Approval Required
  if (userRole === "creator" && requiresApproval) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-blue-900 mb-1">
                    Approval Required
                  </p>
                  <p className="text-xs text-blue-800">
                    Your brand settings require manager/admin approval before publishing.
                  </p>
                </div>
              </div>
            </div>

            {!showApprovalForm ? (
              <Button
                onClick={() => setShowApprovalForm(true)}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2"
              >
                <Users className="w-4 h-4" />
                Request Approval
              </Button>
            ) : (
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    Who should approve this?
                  </label>

                  {autoAssignedApprover ? (
                    <div className="p-3 bg-white rounded-lg border-2 border-indigo-200">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-indigo-600">
                            {autoAssignedApprover.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {autoAssignedApprover.name}
                          </p>
                          <p className="text-xs text-slate-600 capitalize">
                            {autoAssignedApprover.role}
                          </p>
                        </div>
                        <Badge className="ml-auto">Auto-assigned</Badge>
                      </div>
                    </div>
                  ) : (
                    <Select
                      value={selectedApprover}
                      onValueChange={setSelectedApprover}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team member" />
                      </SelectTrigger>
                      <SelectContent>
                        {eligibleApprovers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-2">
                              <span>{member.name}</span>
                              <Badge variant="outline" className="capitalize text-xs">
                                {member.role}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={approvalMessage}
                    onChange={(e) => setApprovalMessage(e.target.value)}
                    placeholder="Add any context for the approver..."
                    className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none text-sm resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowApprovalForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRequestApproval}
                    disabled={!selectedApprover && !autoAssignedApprover}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Request
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Admin/Manager - Can Approve or Publish
  if (userRole === "admin" || userRole === "manager") {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Info Banner */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-purple-900 mb-1">
                    {userRole === "admin" ? "🔑 Admin Privileges" : "✓ Manager Access"}
                  </p>
                  <p className="text-xs text-purple-800">
                    You can publish directly or schedule posts without additional approval.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {onSchedule && (
                <Button
                  variant="outline"
                  onClick={onSchedule}
                  className="gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule
                </Button>
              )}
              {onPublish && (
                <Button
                  onClick={onPublish}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2"
                >
                  <Send className="w-4 h-4" />
                  Publish Now
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Client - Can Only View/Approve (not create/edit)
  if (userRole === "client") {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Info Banner */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-yellow-900 mb-1">
                    Client View Mode
                  </p>
                  <p className="text-xs text-yellow-800">
                    You can approve or reject this content. Your agency will handle publishing.
                  </p>
                </div>
              </div>
            </div>

            {/* Approve/Reject Only */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Request Changes
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 gap-2">
                <CheckCircle className="w-4 h-4" />
                Approve
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
