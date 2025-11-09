import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Eye, Save, RotateCcw, Palette, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWhiteLabel } from "@/hooks/useWhiteLabel";
import { WhiteLabelConfig, BRANDING_THEMES } from "@shared/branding";

interface WhiteLabelSettingsProps {
  userRole: "admin" | "manager" | "client";
  className?: string;
}

export function WhiteLabelSettings({
  userRole,
  className,
}: WhiteLabelSettingsProps) {
  const { config, loading, updateConfig, applyTheme } = useWhiteLabel();
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localConfig, setLocalConfig] = useState<Partial<WhiteLabelConfig>>(
    config || {},
  );
  const logoUploadRef = useRef<HTMLInputElement>(null);
  const faviconUploadRef = useRef<HTMLInputElement>(null);

  // Only admins can access white-label settings
  if (userRole !== "admin") {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">
          White-label settings are only available for agency administrators.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        Loading white-label settings...
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateConfig(localConfig);
      setPreviewMode(false);
    } catch (error) {
      console.error("Failed to save white-label config:", error);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (localConfig.colors) {
      applyTheme(localConfig.colors);
      setPreviewMode(true);
    }
  };

  const handleThemeSelect = (theme: (typeof BRANDING_THEMES)[0]) => {
    const updatedConfig = {
      ...localConfig,
      colors: theme.colors,
    };
    setLocalConfig(updatedConfig);
    applyTheme(theme.colors);
  };

  const handleLogoUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "favicon",
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In production, upload to your storage service
    const mockUrl = URL.createObjectURL(file);

    setLocalConfig((prev) => {
      const branding = prev.branding || {};
      return {
        ...prev,
        branding: {
          ...branding,
          [type === "logo" ? "logoUrl" : "favicon"]: mockUrl,
        } as Partial<WhiteLabelConfig>["branding"],
      };
    });
  };

  const updateLocalConfig = (section: keyof WhiteLabelConfig, updates: unknown) => {
    setLocalConfig((prev) => {
      const currentSection = prev[section] || {};
      return {
        ...prev,
        [section]: {
          ...currentSection,
          ...updates,
        },
      };
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">White-Label Settings</h1>
          <p className="text-gray-600">
            Customize the platform appearance for your agency and clients
          </p>
        </div>

        <div className="flex gap-2">
          {previewMode && (
            <Button variant="outline" onClick={() => setPreviewMode(false)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Exit Preview
            </Button>
          )}
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview Changes
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {previewMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-medium">Preview Mode Active</p>
          <p className="text-blue-700 text-sm">
            You're seeing how your changes will look. Click "Save Changes" to
            apply them permanently.
          </p>
        </div>
      )}

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="branding">🎨 Branding</TabsTrigger>
          <TabsTrigger value="colors">🌈 Colors & Themes</TabsTrigger>
          <TabsTrigger value="domain">🌐 Domain & URLs</TabsTrigger>
          <TabsTrigger value="features">⚙️ Features</TabsTrigger>
        </TabsList>

        <TabsContent value="branding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Identity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Company Name</Label>
                  <Input
                    value={localConfig.branding?.companyName || ""}
                    onChange={(e) =>
                      updateLocalConfig("branding", {
                        companyName: e.target.value,
                      })
                    }
                    placeholder="Your Agency Name"
                  />
                </div>

                <div>
                  <Label>Tagline</Label>
                  <Input
                    value={localConfig.branding?.tagline || ""}
                    onChange={(e) =>
                      updateLocalConfig("branding", { tagline: e.target.value })
                    }
                    placeholder="Your agency's tagline"
                  />
                </div>

                <div>
                  <Label>Logo</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => logoUploadRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                    {localConfig.branding?.logoUrl && (
                      <img
                        src={localConfig.branding.logoUrl}
                        alt="Logo preview"
                        className="h-10 w-auto"
                      />
                    )}
                  </div>
                  <input
                    ref={logoUploadRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoUpload(e, "logo")}
                    className="hidden"
                  />
                </div>

                <div>
                  <Label>Favicon</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => faviconUploadRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Favicon
                    </Button>
                    {localConfig.branding?.favicon && (
                      <img
                        src={localConfig.branding.favicon}
                        alt="Favicon preview"
                        className="h-4 w-4"
                      />
                    )}
                  </div>
                  <input
                    ref={faviconUploadRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoUpload(e, "favicon")}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Footer & Legal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Copyright Text</Label>
                  <Input
                    value={localConfig.footer?.copyrightText || ""}
                    onChange={(e) =>
                      updateLocalConfig("footer", {
                        copyrightText: e.target.value,
                      })
                    }
                    placeholder="© 2024 Your Agency. All rights reserved."
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Show "Powered by Aligned AI"</Label>
                  <Switch
                    checked={localConfig.footer?.showPoweredBy ?? true}
                    onCheckedChange={(checked) =>
                      updateLocalConfig("footer", { showPoweredBy: checked })
                    }
                  />
                </div>

                <div>
                  <Label>Support Email</Label>
                  <Input
                    type="email"
                    value={localConfig.footer?.supportEmail || ""}
                    onChange={(e) =>
                      updateLocalConfig("footer", {
                        supportEmail: e.target.value,
                      })
                    }
                    placeholder="support@youragency.com"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="colors">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Theme Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {BRANDING_THEMES.map((theme) => (
                    <div
                      key={theme.name}
                      className="p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleThemeSelect(theme)}
                    >
                      <div
                        className="h-16 rounded-lg mb-3"
                        style={{ background: theme.preview }}
                      />
                      <h4 className="font-medium">{theme.name}</h4>
                      <p className="text-sm text-gray-600">
                        {theme.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Colors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: "primary", label: "Primary" },
                    { key: "secondary", label: "Secondary" },
                    { key: "accent", label: "Accent" },
                    { key: "success", label: "Success" },
                    { key: "warning", label: "Warning" },
                    { key: "error", label: "Error" },
                  ].map(({ key, label }) => {
                    const colorValue =
                      (localConfig.colors?.[
                        key as keyof Omit<typeof localConfig.colors, "text">
                      ] as string | undefined) || "#000000";
                    return (
                      <div key={key}>
                        <Label className="text-sm">{label}</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={colorValue}
                            onChange={(e) =>
                              updateLocalConfig("colors", {
                                [key]: e.target.value,
                              })
                            }
                            className="w-12 h-8 rounded border"
                          />
                          <Input
                            value={colorValue}
                            onChange={(e) =>
                              updateLocalConfig("colors", {
                                [key]: e.target.value,
                              })
                            }
                            placeholder="#000000"
                            className="font-mono text-sm"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="domain">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Domain Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Custom Domain</Label>
                <Input
                  value={localConfig.domain?.custom || ""}
                  onChange={(e) =>
                    updateLocalConfig("domain", { custom: e.target.value })
                  }
                  placeholder="clients.youragency.com"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Configure a custom domain for your white-labeled platform
                </p>
              </div>

              <div>
                <Label>Subdomain Pattern</Label>
                <Input
                  value={localConfig.domain?.subdomain || ""}
                  onChange={(e) =>
                    updateLocalConfig("domain", { subdomain: e.target.value })
                  }
                  placeholder="[client].youragency.com"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Use [client] as a placeholder for client-specific subdomains
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Feature Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Hide Aligned AI Branding</Label>
                  <p className="text-sm text-gray-600">
                    Remove all Aligned AI references from the platform
                  </p>
                </div>
                <Switch
                  checked={localConfig.features?.hideAlignedAIBranding ?? false}
                  onCheckedChange={(checked) =>
                    updateLocalConfig("features", {
                      hideAlignedAIBranding: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Custom Login Page</Label>
                  <p className="text-sm text-gray-600">
                    Use your branding on the login page
                  </p>
                </div>
                <Switch
                  checked={localConfig.features?.customLoginPage ?? false}
                  onCheckedChange={(checked) =>
                    updateLocalConfig("features", { customLoginPage: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Client Branding</Label>
                  <p className="text-sm text-gray-600">
                    Let clients see their own brand colors in the interface
                  </p>
                </div>
                <Switch
                  checked={localConfig.features?.allowClientBranding ?? true}
                  onCheckedChange={(checked) =>
                    updateLocalConfig("features", {
                      allowClientBranding: checked,
                    })
                  }
                />
              </div>

              <div>
                <Label>Custom Dashboard Title</Label>
                <Input
                  value={localConfig.features?.customDashboardTitle || ""}
                  onChange={(e) =>
                    updateLocalConfig("features", {
                      customDashboardTitle: e.target.value,
                    })
                  }
                  placeholder="Client Dashboard"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
