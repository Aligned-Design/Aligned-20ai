import React, { useState, useEffect } from 'react';
import { Card as _Card, CardContent as _CardContent, CardHeader as _CardHeader, CardTitle as _CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle, Download, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserPreferences, BasicPreferences, AdvancedPreferences, AgencyOverrides, Language, DateTimeFormat, NotificationFrequency, DashboardDensity, CardAnimation, AnalyticsStyle, FontSize } from '@shared/preferences';

interface UserPreferencesProps {
  userRole: 'admin' | 'manager' | 'client';
  className?: string;
}

export function UserPreferencesComponent({ userRole, className }: UserPreferencesProps) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (section: keyof UserPreferences | 'basic' | 'advanced' | 'agency', updates: any) => {
    try {
      setSaving(true);
      // Map component section names to UserPreferences section names
      const sectionMap: Record<string, keyof UserPreferences> = {
        'basic': 'interface',
        'advanced': 'advanced',
        'agency': 'advanced'
      };
      const actualSection = sectionMap[section as string] || (section as keyof UserPreferences);

      const response = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: actualSection, preferences: updates })
      });

      if (response.ok) {
        await loadPreferences();
        setSavedMessage('✅ Preferences saved. Changes will take effect immediately.');
        setTimeout(() => setSavedMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const exportPreferences = () => {
    if (!preferences) return;
    
    const dataStr = JSON.stringify(preferences, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'user-preferences.json';
    link.click();
  };

  const importPreferences = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setPreferences(imported);
      } catch (error) {
        console.error('Invalid preferences file:', error);
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading preferences...</div>;
  }

  if (!preferences) {
    return <div className="text-center p-8">Failed to load preferences</div>;
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Preferences</h1>
          <p className="text-gray-600">Customize your Aligned AI experience</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPreferences}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <label>
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={importPreferences}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {savedMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800">
          {savedMessage}
        </div>
      )}

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Preferences</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
          {userRole === 'admin' && (
            <TabsTrigger value="agency">Agency Overrides</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="basic">
          <BasicPreferencesTab
            preferences={{
              theme: (preferences.interface?.theme as 'light' | 'dark' | 'auto') || 'auto',
              language: (preferences.interface?.language as Language) || 'en',
              timezone: preferences.interface?.timezone || 'UTC',
              dateTimeFormat: '12h' as DateTimeFormat,
              homePageView: (preferences.interface?.defaultDashboardView || 'dashboard') as 'dashboard' | 'calendar' | 'analytics',
              emailNotifications: {
                approvals: preferences.notifications?.email?.types?.contentReady ?? true,
                newReview: preferences.notifications?.email?.types?.approvalNeeded ?? true,
                failedPost: preferences.notifications?.email?.types?.analyticsReports ?? false,
                analyticsDigest: preferences.notifications?.email?.types?.systemUpdates ?? false
              },
              digestFrequency: (preferences.notifications?.email?.frequency as NotificationFrequency) || 'daily',
              appNotifications: preferences.notifications?.inApp?.enabled ?? true,
              inAppMessageSounds: false,
              dashboardDensity: 'comfortable' as DashboardDensity,
              cardAnimation: 'smooth' as CardAnimation,
              analyticsStyle: 'graph-heavy' as AnalyticsStyle,
              fontSize: 'medium' as FontSize,
              quickActionsOnHover: true
            }}
            onSave={(updates) => {
              if (updates.theme) savePreferences('interface', { theme: updates.theme });
              if (updates.language) savePreferences('interface', { language: updates.language });
            }}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="advanced">
          <AdvancedPreferencesTab
            preferences={{
              analyticsEmailCadence: 'daily',
              reportFormat: 'pdf',
              aiInsightLevel: 'detailed',
              showBenchmarks: true,
              includeCompetitorMentions: false,
              tonePreset: preferences.aiSettings?.defaultTone === 'professional' ? 'safe' : 'bold',
              voiceAdaptationSpeed: 'balanced',
              autoGenerateNextMonthPlan: false,
              autoApproveAISuggestions: false,
              languageStyle: 'us-english',
              aiRegenerationTriggers: 'manual',
              draftVisibility: 'internal-only',
              commentTagAlerts: 'digest',
              clientCommentVisibility: false,
              autoMeetingSummaries: false,
              taskIntegration: 'none',
              meetingNotesToAI: 'ask-each-time',
              autoSaveInterval: 'manual',
              approvalWorkflow: '1-step',
              graceWindowHours: 24,
              postFailureHandling: 'notify-only',
              twoFactorAuth: false,
              sessionTimeout: '8h',
              ipWhitelist: [],
              autoDataExport: false,
              dataExportFrequency: 'weekly'
            }}
            onSave={(updates) => savePreferences('advanced', updates)}
            saving={saving}
          />
        </TabsContent>

        {userRole === 'admin' && (
          <TabsContent value="agency">
            <AgencyOverridesTab
              overrides={{
                defaultSafetyMode: 'safe',
                globalBrandQuotaTemplate: {},
                defaultAnalyticsEmailSchedule: 'weekly',
                clientAccessControls: {
                  uploads: true,
                  reviews: true,
                  events: true,
                  analytics: true,
                  pipeline: true
                },
                whiteLabel: false,
                defaultReportSections: [],
                forceMFA: false,
                disableAutoAIPlan: false,
                maintenanceMode: false
              }}
              onSave={(updates) => savePreferences('advanced', updates)}
              saving={saving}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

interface BasicPreferencesTabProps {
  preferences: BasicPreferences;
  onSave: (updates: Partial<BasicPreferences>) => void;
  saving: boolean;
}

function BasicPreferencesTab({ preferences, onSave, saving }: BasicPreferencesTabProps) {
  const [localPrefs, setLocalPrefs] = useState(preferences);

  const updatePreference = (key: keyof BasicPreferences, value: any) => {
    const updated = { ...localPrefs, [key]: value };
    setLocalPrefs(updated);
    onSave({ [key]: value });
  };

  return (
    <Accordion type="multiple" defaultValue={["general", "notifications"]} className="space-y-4">
      <AccordionItem value="general">
        <AccordionTrigger className="text-lg font-semibold">General</AccordionTrigger>
        <AccordionContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PreferenceField
              label="Theme"
              description="Choose your visual theme"
              help="Light mode for day use, dark for night, auto follows system"
            >
              <Select
                value={localPrefs.theme}
                onValueChange={(value) => updatePreference('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </PreferenceField>

            <PreferenceField
              label="Language"
              description="Interface language"
              help="Language for UI elements and notifications"
            >
              <Select
                value={localPrefs.language}
                onValueChange={(value) => updatePreference('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </PreferenceField>

            <PreferenceField
              label="Date/Time Format"
              description="How dates and times are displayed"
              help="12-hour includes AM/PM, 24-hour uses military time"
            >
              <Select
                value={localPrefs.dateTimeFormat}
                onValueChange={(value) => updatePreference('dateTimeFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                  <SelectItem value="24h">24-hour</SelectItem>
                </SelectContent>
              </Select>
            </PreferenceField>

            <PreferenceField
              label="Home Page"
              description="Default view when you log in"
              help="Choose what you see first after signing in"
            >
              <Select
                value={localPrefs.homePageView}
                onValueChange={(value) => updatePreference('homePageView', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  <SelectItem value="calendar">Calendar</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                </SelectContent>
              </Select>
            </PreferenceField>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="notifications">
        <AccordionTrigger className="text-lg font-semibold">Notifications & Communication</AccordionTrigger>
        <AccordionContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium">Email Notifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(localPrefs.emailNotifications).map(([key, enabled]) => (
                <PreferenceField
                  key={key}
                  label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  description={`Email alerts for ${key}`}
                >
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => 
                      updatePreference('emailNotifications', {
                        ...localPrefs.emailNotifications,
                        [key]: checked
                      })
                    }
                  />
                </PreferenceField>
              ))}
            </div>
          </div>

          <PreferenceField
            label="Digest Frequency"
            description="How often to receive summary emails"
            help="Combines multiple notifications into a single digest"
          >
            <Select
              value={localPrefs.digestFrequency}
              onValueChange={(value) => updatePreference('digestFrequency', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="off">Off</SelectItem>
              </SelectContent>
            </Select>
          </PreferenceField>

          <PreferenceField
            label="In-App Notifications"
            description="Show toast notifications in the app"
            help="Pop-up alerts for approvals, tasks, and errors"
          >
            <Switch
              checked={localPrefs.appNotifications}
              onCheckedChange={(checked) => updatePreference('appNotifications', checked)}
            />
          </PreferenceField>

          <PreferenceField
            label="Message Sounds"
            description="Play sounds for in-app notifications"
            help="Audio alerts for important notifications"
          >
            <Switch
              checked={localPrefs.inAppMessageSounds}
              onCheckedChange={(checked) => updatePreference('inAppMessageSounds', checked)}
            />
          </PreferenceField>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="display">
        <AccordionTrigger className="text-lg font-semibold">Display & Layout</AccordionTrigger>
        <AccordionContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PreferenceField
              label="Dashboard Density"
              description="Spacing between dashboard cards"
              help="Comfortable for readability, compact for more content"
            >
              <Select
                value={localPrefs.dashboardDensity}
                onValueChange={(value) => updatePreference('dashboardDensity', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </PreferenceField>

            <PreferenceField
              label="Card Animations"
              description="Visual effects for UI elements"
              help="Smooth for full effects, minimal for reduced motion"
            >
              <Select
                value={localPrefs.cardAnimation}
                onValueChange={(value) => updatePreference('cardAnimation', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smooth">Smooth</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="off">Off</SelectItem>
                </SelectContent>
              </Select>
            </PreferenceField>

            <PreferenceField
              label="Analytics Style"
              description="How analytics data is presented"
              help="Graph-heavy for data analysts, summary-only for executives"
            >
              <Select
                value={localPrefs.analyticsStyle}
                onValueChange={(value) => updatePreference('analyticsStyle', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="graph-heavy">Graph-heavy</SelectItem>
                  <SelectItem value="summary-only">Summary-only</SelectItem>
                </SelectContent>
              </Select>
            </PreferenceField>

            <PreferenceField
              label="Font Size"
              description="Text size throughout the app"
              help="Larger sizes improve readability"
            >
              <Select
                value={localPrefs.fontSize}
                onValueChange={(value) => updatePreference('fontSize', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </PreferenceField>
          </div>

          <PreferenceField
            label="Quick Actions on Hover"
            description="Show action buttons when hovering over items"
            help="Useful for power users, can be disabled for cleaner interface"
          >
            <Switch
              checked={localPrefs.quickActionsOnHover}
              onCheckedChange={(checked) => updatePreference('quickActionsOnHover', checked)}
            />
          </PreferenceField>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

interface AdvancedPreferencesTabProps {
  preferences: AdvancedPreferences;
  onSave: (updates: Partial<AdvancedPreferences>) => void;
  saving: boolean;
}

function AdvancedPreferencesTab({ preferences, onSave, saving }: AdvancedPreferencesTabProps) {
  // ...existing code... Similar structure to BasicPreferencesTab but with advanced settings
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Advanced Settings</h3>
        <p className="text-blue-700 text-sm">
          These settings provide fine-grained control over AI behavior, workflows, and integrations.
          Changes here affect how the platform operates for you.
        </p>
      </div>
      
      {/* Advanced settings accordion similar to basic, but with more complex controls */}
      <Accordion type="multiple" defaultValue={["ai-settings"]} className="space-y-4">
        {/* AI & Analytics section */}
        {/* Workflow & Automation section */}
        {/* Security & Privacy section */}
      </Accordion>
    </div>
  );
}

interface AgencyOverridesTabProps {
  overrides?: AgencyOverrides;
  onSave: (updates: Partial<AgencyOverrides>) => void;
  saving: boolean;
}

function AgencyOverridesTab({ overrides, onSave, saving }: AgencyOverridesTabProps) {
  if (!overrides) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Agency overrides are only available for admin users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-medium text-amber-900 mb-2">⚠️ Agency-Level Overrides</h3>
        <p className="text-amber-700 text-sm">
          These settings apply globally across all brands and users in your agency.
          Changes here will override individual user preferences.
        </p>
      </div>
      
      {/* Agency override controls */}
    </div>
  );
}

interface PreferenceFieldProps {
  label: string;
  description?: string;
  help?: string;
  children: React.ReactNode;
}

function PreferenceField({ label, description, help, children }: PreferenceFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="font-medium">{label}</Label>
        {help && (
          <div className="group relative">
            <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {help}
            </div>
          </div>
        )}
      </div>
      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
      {children}
    </div>
  );
}
