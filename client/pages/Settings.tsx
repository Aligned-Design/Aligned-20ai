import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Settings as SettingsIcon,
  User,
  Bot,
  Bell,
  Users,
  Zap,
  Shield,
  Palette,
  Save,
  RotateCcw,
  HelpCircle,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { UserPreferences, PreferenceValidation } from "@shared/preferences";

export default function Settings() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [validation, setValidation] = useState<PreferenceValidation | null>(
    null,
  );

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/preferences");
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (
    section: keyof UserPreferences,
    updates: Record<string, unknown>,
  ) => {
    if (!preferences) return;

    const currentValue = preferences[section];
    const newPreferences = {
      ...preferences,
      [section]:
        typeof currentValue === "object" && currentValue !== null
          ? { ...(currentValue as any), ...updates }
          : updates,
    };

    setPreferences(newPreferences);
    setUnsavedChanges(true);

    // Validate changes
    try {
      const validation = await validatePreferences(section, updates);
      setValidation(validation);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const validatePreferences = async (
    section: string,
    updates: Record<string, unknown>,
  ): Promise<PreferenceValidation> => {
    const response = await fetch("/api/preferences/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, updates }),
    });
    return response.json();
  };

  const savePreferences = async () => {
    if (!preferences || !unsavedChanges) return;

    try {
      setSaving(true);
      const response = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        setUnsavedChanges(false);
        setValidation(null);
        // Show success message
      }
    } catch (error) {
      console.error("Failed to save preferences:", error);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    try {
      const response = await fetch("/api/preferences/reset", {
        method: "POST",
      });
      if (response.ok) {
        await loadPreferences();
        setUnsavedChanges(false);
      }
    } catch (error) {
      console.error("Failed to reset preferences:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!preferences) {
    return <div>Failed to load preferences</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600">
            Customize your experience and AI behavior
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unsavedChanges && (
            <Badge
              variant="secondary"
              className="bg-yellow-100 text-yellow-800"
            >
              Unsaved changes
            </Badge>
          )}

          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>

          <Button
            onClick={savePreferences}
            disabled={!unsavedChanges || saving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Validation Alerts */}
      {validation && !validation.valid && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900 mb-2">
                  Please fix the following issues:
                </h4>
                <ul className="space-y-1">
                  {validation.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-800">
                      • {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="gap-2">
            <User className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Bot className="h-4 w-4" />
            AI & Content
          </TabsTrigger>
          <TabsTrigger value="publishing" className="gap-2">
            <Zap className="h-4 w-4" />
            Publishing
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-2">
            <Shield className="h-4 w-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <GeneralSettings
            preferences={preferences}
            onUpdate={(updates) => updatePreference("interface", updates)}
          />
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <AIContentSettings
            preferences={preferences}
            onUpdate={(updates) => updatePreference("aiSettings", updates)}
          />
        </TabsContent>

        <TabsContent value="publishing" className="space-y-6">
          <PublishingSettings
            preferences={preferences}
            onUpdate={(updates) => updatePreference("publishing", updates)}
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings
            preferences={preferences}
            onUpdate={(updates) => updatePreference("notifications", updates)}
          />
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <TeamSettings
            preferences={preferences}
            onUpdate={(updates) => updatePreference("teamSettings", updates)}
          />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <AdvancedSettings
            preferences={preferences}
            onUpdate={(updates) => updatePreference("advanced", updates)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GeneralSettings({
  preferences,
  onUpdate,
}: {
  preferences: UserPreferences;
  onUpdate: (updates: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Interface & Display
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Theme</Label>
              <Select
                value={preferences.interface.theme}
                onValueChange={(value) => onUpdate({ theme: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto (System)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Language</Label>
              <Select
                value={preferences.interface.language}
                onValueChange={(value) => onUpdate({ language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Compact Mode</Label>
              <p className="text-sm text-gray-600">
                Show more content in less space
              </p>
            </div>
            <Switch
              checked={preferences.interface.compactMode}
              onCheckedChange={(checked) => onUpdate({ compactMode: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Show Advanced Options</Label>
              <p className="text-sm text-gray-600">
                Display power-user features
              </p>
            </div>
            <Switch
              checked={preferences.interface.showAdvancedOptions}
              onCheckedChange={(checked) =>
                onUpdate({ showAdvancedOptions: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AIContentSettings({
  preferences,
  onUpdate,
}: {
  preferences: UserPreferences;
  onUpdate: (updates: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Behavior & Brand Voice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Default Tone</Label>
            <Select
              value={preferences.aiSettings.defaultTone}
              onValueChange={(value) => onUpdate({ defaultTone: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="authoritative">Authoritative</SelectItem>
                <SelectItem value="playful">Playful</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Creativity Level</Label>
            <p className="text-sm text-gray-600 mb-3">
              How creative should AI be with content generation?
            </p>
            <div className="space-y-3">
              <Slider
                value={[
                  getCreativityValue(preferences.aiSettings.creativityLevel),
                ]}
                onValueChange={(value) =>
                  onUpdate({ creativityLevel: getCreativityLevel(value[0]) })
                }
                max={3}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Conservative</span>
                <span>Balanced</span>
                <span>Creative</span>
                <span>Experimental</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Strict Brand Mode</Label>
              <p className="text-sm text-gray-600">
                Enforce strict adherence to brand guidelines
              </p>
            </div>
            <Switch
              checked={preferences.aiSettings.strictBrandMode}
              onCheckedChange={(checked) =>
                onUpdate({ strictBrandMode: checked })
              }
            />
          </div>

          <div>
            <Label>Brand Voice Personality</Label>
            <Textarea
              value={preferences.aiSettings.brandVoice.personality.join(", ")}
              onChange={(e) =>
                onUpdate({
                  brandVoice: {
                    ...preferences.aiSettings.brandVoice,
                    personality: e.target.value.split(",").map((s) => s.trim()),
                  },
                })
              }
              placeholder="e.g., energetic, trustworthy, innovative"
            />
          </div>

          <div>
            <Label>Words to Avoid</Label>
            <Textarea
              value={preferences.aiSettings.brandVoice.avoidWords.join(", ")}
              onChange={(e) =>
                onUpdate({
                  brandVoice: {
                    ...preferences.aiSettings.brandVoice,
                    avoidWords: e.target.value.split(",").map((s) => s.trim()),
                  },
                })
              }
              placeholder="e.g., cheap, discount, basic"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PublishingSettings({
  preferences,
  onUpdate,
}: {
  preferences: UserPreferences;
  onUpdate: (updates: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Auto-Approval Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Auto-Approval</Label>
              <p className="text-sm text-gray-600">
                Automatically approve content that meets criteria
              </p>
            </div>
            <Switch
              checked={preferences.publishing.autoApproval.enabled}
              onCheckedChange={(checked) =>
                onUpdate({
                  autoApproval: {
                    ...preferences.publishing.autoApproval,
                    enabled: checked,
                  },
                })
              }
            />
          </div>

          {preferences.publishing.autoApproval.enabled && (
            <>
              <div>
                <Label>Minimum Brand Fit Score (%)</Label>
                <Slider
                  value={[
                    preferences.publishing.autoApproval.rules.minBrandFitScore,
                  ]}
                  onValueChange={(value) =>
                    onUpdate({
                      autoApproval: {
                        ...preferences.publishing.autoApproval,
                        rules: {
                          ...preferences.publishing.autoApproval.rules,
                          minBrandFitScore: value[0],
                        },
                      },
                    })
                  }
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Current:{" "}
                  {preferences.publishing.autoApproval.rules.minBrandFitScore}%
                </p>
              </div>

              <div>
                <Label>Auto-Publish Score (%)</Label>
                <Slider
                  value={[
                    preferences.publishing.autoApproval.rules.autoPublishScore,
                  ]}
                  onValueChange={(value) =>
                    onUpdate({
                      autoApproval: {
                        ...preferences.publishing.autoApproval,
                        rules: {
                          ...preferences.publishing.autoApproval.rules,
                          autoPublishScore: value[0],
                        },
                      },
                    })
                  }
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Current:{" "}
                  {preferences.publishing.autoApproval.rules.autoPublishScore}%
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationSettings({
  preferences,
  onUpdate,
}: {
  preferences: UserPreferences;
  onUpdate: (updates: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Email Notifications</Label>
            <Switch
              checked={preferences.notifications.email.enabled}
              onCheckedChange={(checked) =>
                onUpdate({
                  email: {
                    ...preferences.notifications.email,
                    enabled: checked,
                  },
                })
              }
            />
          </div>

          {preferences.notifications.email.enabled && (
            <>
              <div>
                <Label>Frequency</Label>
                <Select
                  value={preferences.notifications.email.frequency}
                  onValueChange={(value) =>
                    onUpdate({
                      email: {
                        ...preferences.notifications.email,
                        frequency: value,
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Notification Types</Label>
                {Object.entries(preferences.notifications.email.types).map(
                  ([type, enabled]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm capitalize">
                        {type.replace(/([A-Z])/g, " $1")}
                      </span>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) =>
                          onUpdate({
                            email: {
                              ...preferences.notifications.email,
                              types: {
                                ...preferences.notifications.email.types,
                                [type]: checked,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  ),
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TeamSettings({
  preferences,
  onUpdate,
}: {
  preferences: UserPreferences;
  onUpdate: (updates: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Permissions & Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Role</Label>
            <Select
              value={preferences.teamSettings.role}
              onValueChange={(value) => onUpdate({ role: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="creator">Content Creator</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Permissions</Label>
            {Object.entries(preferences.teamSettings.permissions).map(
              ([permission, enabled]) => (
                <div
                  key={permission}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm">
                    {formatPermissionName(permission)}
                  </span>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) =>
                      onUpdate({
                        permissions: {
                          ...preferences.teamSettings.permissions,
                          [permission]: checked,
                        },
                      })
                    }
                  />
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdvancedSettings({
  preferences,
  onUpdate,
}: {
  preferences: UserPreferences;
  onUpdate: (updates: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Experimental Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {preferences.advanced?.experimental?.betaFeatures?.map(
              (feature: string) => (
                <div
                  key={feature}
                  className="flex items-center justify-between"
                >
                  <div>
                    <span className="text-sm font-medium">{feature}</span>
                    <Badge variant="secondary" className="ml-2">
                      Beta
                    </Badge>
                  </div>
                  <Switch defaultChecked />
                </div>
              ),
            )}
          </div>

          <div>
            <Label>AI Model Version</Label>
            <Select
              value={
                preferences.advanced?.experimental?.aiModelVersion || "stable"
              }
              onValueChange={(value) =>
                onUpdate({
                  experimental: {
                    ...(preferences.advanced?.experimental || {}),
                    aiModelVersion: value,
                  },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stable">Stable (Recommended)</SelectItem>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="experimental">Experimental</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions
function getCreativityValue(level: string): number {
  const map = { conservative: 0, balanced: 1, creative: 2, experimental: 3 };
  return map[level as keyof typeof map] || 1;
}

function getCreativityLevel(value: number): string {
  const levels = ["conservative", "balanced", "creative", "experimental"];
  return levels[value] || "balanced";
}

function formatPermissionName(permission: string): string {
  return permission
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace("Can ", "");
}
