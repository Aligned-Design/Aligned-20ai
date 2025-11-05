/**
 * Weekend Posting Toggle Component
 *
 * Allows users to enable/disable posting on weekends (Saturday & Sunday)
 * Integrates with brand posting configuration
 */

import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WeekendPostingToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  isLoading?: boolean;
  error?: string;
}

export const WeekendPostingToggle: React.FC<WeekendPostingToggleProps> = ({
  enabled,
  onToggle,
  isLoading = false,
  error
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          <CardTitle>Weekend Posting</CardTitle>
        </div>
        <CardDescription>
          Enable or disable automatic posting on Saturdays and Sundays
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Toggle Switch */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <Switch
              id="weekend-posting"
              checked={enabled}
              onCheckedChange={onToggle}
              disabled={isLoading}
              aria-label="Enable weekend posting"
            />
            <Label
              htmlFor="weekend-posting"
              className="flex-1 cursor-pointer"
            >
              <div className="font-semibold">Allow Weekend Posts</div>
              <div className="text-sm text-muted-foreground">
                {enabled
                  ? "Posts can be scheduled for Saturday and Sunday"
                  : "Posts will not be scheduled for weekends"}
              </div>
            </Label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Info Section */}
        <div className="space-y-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            {showDetails ? "Hide" : "Show"} details
          </button>

          {showDetails && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 space-y-2 text-sm">
              <div>
                <strong>When Enabled:</strong>
                <ul className="list-disc list-inside text-muted-foreground mt-1">
                  <li>Content can be scheduled for any day</li>
                  <li>Saturday and Sunday publish times are available</li>
                  <li>Weekend schedules follow your brand timezone settings</li>
                </ul>
              </div>

              <div>
                <strong>When Disabled:</strong>
                <ul className="list-disc list-inside text-muted-foreground mt-1">
                  <li>Weekday-only posting strategy is enforced</li>
                  <li>Saturday/Sunday scheduling is blocked</li>
                  <li>Content will retry on next available weekday</li>
                </ul>
              </div>

              <div>
                <strong>Timezone Consideration:</strong>
                <p className="text-muted-foreground mt-1">
                  Weekend boundaries are determined by your brand timezone setting.
                  Adjusting your timezone will update when weekends are considered.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stats / Current Status */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="text-center p-2">
            <div className="text-2xl font-bold text-primary">
              {enabled ? "5" : "7"}
            </div>
            <div className="text-xs text-muted-foreground">Days per week</div>
          </div>
          <div className="text-center p-2">
            <div className="text-2xl font-bold text-primary">
              {enabled ? "Enabled" : "Disabled"}
            </div>
            <div className="text-xs text-muted-foreground">Weekend posts</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeekendPostingToggle;
