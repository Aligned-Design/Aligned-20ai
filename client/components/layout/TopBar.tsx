/**
 * Top bar component with role-based actions
 */

import { Button } from "@/components/ui/button";
import { useCan } from "@/lib/auth/useCan";

export function TopBar() {
  // Check if user can create content (agency users)
  const canCreateContent = useCan("content:create");

  return (
    <div className="flex items-center justify-between">
      {/* Left side - empty for now */}
      <div />

      {/* Right side - actions */}
      <div className="flex items-center gap-3">
        {canCreateContent && (
          <Button className="gap-2">
            <span>+</span>
            Generate Content
          </Button>
        )}
      </div>
    </div>
  );
}

export default TopBar;
