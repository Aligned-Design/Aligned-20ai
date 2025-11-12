/**
 * Live Editing Indicators
 * Shows who's currently viewing/editing the design
 */

import { Eye, Edit3, User } from "lucide-react";

interface ActiveUser {
  userId: string;
  userName: string;
  userAvatar?: string;
  isEditing: boolean;
}

interface LiveEditingIndicatorsProps {
  activeUsers: ActiveUser[];
  className?: string;
}

export function LiveEditingIndicators({
  activeUsers,
  className = "",
}: LiveEditingIndicatorsProps) {
  if (activeUsers.length === 0) return null;

  const editors = activeUsers.filter((u) => u.isEditing);
  const viewers = activeUsers.filter((u) => !u.isEditing);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Active editors */}
      {editors.length > 0 && (
        <div className="flex items-center gap-1">
          <div className="flex -space-x-2">
            {editors.slice(0, 3).map((user) => (
              <div
                key={user.userId}
                className="w-8 h-8 rounded-full border-2 border-white bg-green-500 flex items-center justify-center text-xs font-bold text-white shadow-sm"
                title={`${user.userName} is editing`}
              >
                {user.userAvatar || user.userName.charAt(0)}
              </div>
            ))}
          </div>
          {editors.length > 3 && (
            <span className="text-xs text-slate-600 font-medium">
              +{editors.length - 3}
            </span>
          )}
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
            <Edit3 className="w-3 h-3" />
            <span className="text-xs font-bold">{editors.length} editing</span>
          </div>
        </div>
      )}

      {/* Active viewers */}
      {viewers.length > 0 && (
        <div className="flex items-center gap-1">
          <div className="flex -space-x-2">
            {viewers.slice(0, 2).map((user) => (
              <div
                key={user.userId}
                className="w-7 h-7 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-sm"
                title={`${user.userName} is viewing`}
              >
                {user.userAvatar || user.userName.charAt(0)}
              </div>
            ))}
          </div>
          {viewers.length > 2 && (
            <span className="text-xs text-slate-600 font-medium">
              +{viewers.length - 2}
            </span>
          )}
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
            <Eye className="w-3 h-3" />
            <span className="text-xs font-bold">{viewers.length} viewing</span>
          </div>
        </div>
      )}
    </div>
  );
}
