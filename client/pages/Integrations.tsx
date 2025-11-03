import { useState, useEffect } from "react";
import { useBrand } from "@/contexts/BrandContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DashboardSkeleton } from "@/components/ui/skeletons";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import {
  Plug,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Settings,
  RefreshCw,
  Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  PLATFORM_CONFIGS,
  PlatformConnection,
  PlatformProvider,
} from "@/types/integrations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Integrations() {
  const { currentBrand, loading: brandLoading } = useBrand();
  const { toast } = useToast();
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    if (currentBrand?.id) {
      loadConnections();
    }
  }, [currentBrand?.id]);

  const loadConnections = async () => {
    if (!currentBrand?.id) return;

    try {
      const { data, error } = await supabase
        .from("platform_connections")
        .select("*")
        .eq("brand_id", currentBrand.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading connections",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: PlatformProvider) => {
    toast({
      title: "OAuth Flow",
      description: `Connecting to ${PLATFORM_CONFIGS[provider].name}...`,
    });
  };

  const handleReconnect = async (connectionId: string) => {
    toast({
      title: "Reconnecting",
      description: "Opening authentication dialog...",
    });
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from("platform_connections")
        .update({ status: "disconnected" })
        .eq("id", connectionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Platform disconnected successfully",
      });
      loadConnections();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (brandLoading || loading) {
    return <DashboardSkeleton />;
  }

  if (!currentBrand) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <EmptyState
          icon={Plug}
          title="No brand selected"
          description="Select a brand to manage platform integrations"
        />
      </div>
    );
  }

  const categories = [
    {
      id: "all",
      label: "All Platforms",
      count: Object.keys(PLATFORM_CONFIGS).length,
    },
    {
      id: "social",
      label: "Social Media",
      count: Object.values(PLATFORM_CONFIGS).filter(
        (p) => p.category === "social",
      ).length,
    },
    {
      id: "video",
      label: "Video Platforms",
      count: Object.values(PLATFORM_CONFIGS).filter(
        (p) => p.category === "video",
      ).length,
    },
    {
      id: "professional",
      label: "Professional",
      count: Object.values(PLATFORM_CONFIGS).filter(
        (p) => p.category === "professional",
      ).length,
    },
    {
      id: "email",
      label: "Email Marketing",
      count: Object.values(PLATFORM_CONFIGS).filter(
        (p) => p.category === "email",
      ).length,
    },
    {
      id: "web_blog",
      label: "Web & Blog",
      count: Object.values(PLATFORM_CONFIGS).filter(
        (p) => p.category === "web_blog",
      ).length,
    },
    {
      id: "reviews",
      label: "Reviews",
      count: Object.values(PLATFORM_CONFIGS).filter(
        (p) => p.category === "reviews",
      ).length,
    },
    {
      id: "ecommerce",
      label: "E-Commerce",
      count: Object.values(PLATFORM_CONFIGS).filter(
        (p) => p.category === "ecommerce",
      ).length,
    },
  ];

  const filteredPlatforms = Object.values(PLATFORM_CONFIGS).filter(
    (platform) =>
      selectedCategory === "all" || platform.category === selectedCategory,
  );

  const getConnectionForPlatform = (provider: PlatformProvider) => {
    return connections.filter((c) => c.provider === provider);
  };

  return (
    <div className="p-10 space-y-10">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-semibold tracking-tight">
            Integrations
          </h1>
          <HelpTooltip content="Connect your social media, email, and content platforms to publish and manage content from one place." />
        </div>
        <p className="text-muted-foreground text-lg">
          Manage all your platform connections for {currentBrand.name}
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="gap-2"
          >
            {category.label}
            <Badge variant="secondary" className="ml-1">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlatforms.map((platform) => {
          const platformConnections = getConnectionForPlatform(
            platform.provider,
          );
          const isComingSoon = platform.tier === "coming_soon";

          return (
            <Card
              key={platform.provider}
              className="group relative overflow-hidden"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="text-3xl h-12 w-12 rounded-xl flex items-center justify-center shadow-soft"
                      style={{ backgroundColor: `${platform.color}15` }}
                    >
                      {platform.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{platform.name}</CardTitle>
                      <CardDescription className="capitalize">
                        {platform.category.replace("_", " & ")}
                      </CardDescription>
                    </div>
                  </div>
                  {platform.tier !== "coming_soon" && (
                    <Badge
                      variant={platform.tier === 1 ? "default" : "secondary"}
                    >
                      Tier {platform.tier}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isComingSoon ? (
                  <div className="text-center py-4">
                    <Badge variant="outline" className="mb-2">
                      Coming Soon
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      This integration will be available in a future update
                    </p>
                  </div>
                ) : platformConnections.length === 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Not connected. Click to authorize.
                    </p>
                    <Button
                      className="w-full"
                      onClick={() => handleConnect(platform.provider)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Connect {platform.name}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {platformConnections.map((connection) => (
                      <ConnectionCard
                        key={connection.id}
                        connection={connection}
                        platform={platform}
                        onReconnect={() => handleReconnect(connection.id)}
                        onDisconnect={() => handleDisconnect(connection.id)}
                      />
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleConnect(platform.provider)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Account
                    </Button>
                  </div>
                )}

                <div className="pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">
                    Supported content:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {platform.supportedContentTypes.slice(0, 3).map((type) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                    {platform.supportedContentTypes.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{platform.supportedContentTypes.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ConnectionCard({
  connection,
  platform,
  onReconnect,
  onDisconnect,
}: {
  connection: PlatformConnection;
  platform: any;
  onReconnect: () => void;
  onDisconnect: () => void;
}) {
  const getStatusIcon = () => {
    switch (connection.status) {
      case "connected":
        return <CheckCircle2 className="h-4 w-4 text-mint" />;
      case "expired":
        return <AlertCircle className="h-4 w-4 text-coral" />;
      default:
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    if (connection.status === "connected" && connection.token_expires_at) {
      const expiresAt = new Date(connection.token_expires_at);
      const now = new Date();
      const daysUntilExpiry = Math.floor(
        (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysUntilExpiry < 7) {
        return (
          <span className="text-coral">Expires in {daysUntilExpiry}d</span>
        );
      }
      return <span className="text-mint">Connected</span>;
    }
    return <span className="capitalize">{connection.status}</span>;
  };

  return (
    <div className="rounded-lg border border-border/50 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-medium text-sm">
            {connection.account_username || "Account"}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{getStatusText()}</span>
      </div>

      <div className="flex gap-2">
        {connection.status === "expired" && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onReconnect}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reconnect
          </Button>
        )}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={connection.status === "expired" ? "flex-1" : "w-full"}
            >
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{platform.name} Settings</DialogTitle>
              <DialogDescription>
                Manage connection for @{connection.account_username}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Connection Details</p>
                <div className="rounded-lg border border-border/50 p-3 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium capitalize">
                      {connection.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connected:</span>
                    <span className="font-medium">
                      {new Date(connection.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {connection.scopes && (
                    <div className="pt-2">
                      <span className="text-muted-foreground block mb-1">
                        Permissions:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {connection.scopes.map((scope) => (
                          <Badge
                            key={scope}
                            variant="secondary"
                            className="text-xs"
                          >
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={onDisconnect}
              >
                Disconnect Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
