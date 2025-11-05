import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Zap,
  Settings,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import Reveal from "@/components/Reveal";

interface Integration {
  id: string;
  name: string;
  logo: string;
  description: string;
  category: "social" | "analytics" | "design" | "automation";
  status: "connected" | "disconnected" | "error";
  isConnected: boolean;
  lastSync?: string;
}

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      // Mock data - replace with actual API call
      const mockIntegrations: Integration[] = [
        {
          id: "1",
          name: "Instagram",
          logo: "📷",
          description:
            "Connect your Instagram Business account to schedule posts and access analytics",
          category: "social",
          status: "connected",
          isConnected: true,
          lastSync: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Facebook",
          logo: "📘",
          description: "Manage Facebook pages and run advertising campaigns",
          category: "social",
          status: "connected",
          isConnected: true,
          lastSync: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "3",
          name: "Twitter",
          logo: "🐦",
          description: "Schedule tweets and monitor Twitter analytics",
          category: "social",
          status: "disconnected",
          isConnected: false,
        },
        {
          id: "4",
          name: "Google Analytics",
          logo: "📊",
          description:
            "Track website traffic and conversions from social media",
          category: "analytics",
          status: "error",
          isConnected: false,
        },
        {
          id: "5",
          name: "Canva",
          logo: "🎨",
          description: "Create stunning visuals with Canva integration",
          category: "design",
          status: "disconnected",
          isConnected: false,
        },
        {
          id: "6",
          name: "Zapier",
          logo: "⚡",
          description: "Automate workflows between different apps",
          category: "automation",
          status: "disconnected",
          isConnected: false,
        },
      ];
      setIntegrations(mockIntegrations);
    } catch (error) {
      console.error("Failed to load integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleIntegration = async (integrationId: string, connect: boolean) => {
    try {
      // Mock API call
      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.id === integrationId
            ? {
                ...integration,
                isConnected: connect,
                status: connect ? "connected" : "disconnected",
                lastSync: connect ? new Date().toISOString() : undefined,
              }
            : integration,
        ),
      );
    } catch (error) {
      console.error("Failed to toggle integration:", error);
    }
  };

  const getStatusIcon = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const categories = [
    { id: "social", name: "Social Media", icon: "📱" },
    { id: "analytics", name: "Analytics", icon: "📊" },
    { id: "design", name: "Design", icon: "🎨" },
    { id: "automation", name: "Automation", icon: "⚡" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-slate-900">Integrations</h1>
          <p className="text-slate-600">
            Connect your favorite tools to streamline your workflow
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-20 space-y-8">
        <Reveal>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Available Integrations</h2>
              <p className="text-slate-600">
                Browse and connect integrations for each brand
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Browse Integrations
            </Button>
          </div>

          {categories.map((category) => {
            const categoryIntegrations = integrations.filter(
              (i) => i.category === category.id,
            );

            return (
              <div key={category.id} className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span>{category.icon}</span>
                  {category.name}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryIntegrations.map((integration) => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration}
                      onToggle={toggleIntegration}
                      getStatusIcon={getStatusIcon}
                      getStatusColor={getStatusColor}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </Reveal>
      </main>
    </div>
  );
}

function IntegrationCard({
  integration,
  onToggle,
  getStatusIcon,
  getStatusColor,
}: {
  integration: Integration;
  onToggle: (id: string, connect: boolean) => void;
  getStatusIcon: (status: Integration["status"]) => React.ReactNode;
  getStatusColor: (status: Integration["status"]) => string;
}) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{integration.logo}</div>
            <div>
              <CardTitle className="text-lg">{integration.name}</CardTitle>
              <div className="flex items-center gap-2">
                {getStatusIcon(integration.status)}
                <Badge className={getStatusColor(integration.status)}>
                  {integration.status}
                </Badge>
              </div>
            </div>
          </div>
          <Switch
            checked={integration.isConnected}
            onCheckedChange={(checked) => onToggle(integration.id, checked)}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{integration.description}</p>

        {integration.lastSync && (
          <p className="text-xs text-gray-500">
            Last synced: {new Date(integration.lastSync).toLocaleString()}
          </p>
        )}

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 gap-1">
            <Settings className="h-3 w-3" />
            Configure
          </Button>
          <Button size="sm" variant="outline" className="gap-1">
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
