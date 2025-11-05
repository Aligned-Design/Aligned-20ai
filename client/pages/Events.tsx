import { useState, useEffect } from "react";
import { useBrand } from "@/contexts/BrandContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { DashboardSkeleton } from "@/components/ui/skeletons";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import {
  CalendarPlus,
  MapPin,
  Clock,
  Users,
  ExternalLink,
  Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  PlatformEvent,
  PLATFORM_CONFIGS,
  PlatformConnection,
  CreateEventFormData,
} from "@/types/integrations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export default function Events() {
  const { currentBrand, loading: brandLoading } = useBrand();
  const { toast } = useToast();
  const [events, setEvents] = useState<PlatformEvent[]>([]);
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    if (currentBrand?.id) {
      loadEvents();
      loadConnections();
    }
  }, [currentBrand?.id]);

  const loadEvents = async () => {
    if (!currentBrand?.id) return;

    try {
      const { data, error } = await supabase
        .from("platform_events")
        .select("*")
        .eq("brand_id", currentBrand.id)
        .order("start_time", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Error loading events",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadConnections = async () => {
    if (!currentBrand?.id) return;

    try {
      const { data, error } = await supabase
        .from("platform_connections")
        .select("*")
        .eq("brand_id", currentBrand.id)
        .eq("status", "connected")
        .in("provider", ["facebook", "google_business"]);

      if (error) throw error;
      setConnections(data || []);
    } catch (error: unknown) {
      console.error("Error loading connections:", error);
    }
  };

  if (brandLoading || loading) {
    return <DashboardSkeleton />;
  }

  if (!currentBrand) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <EmptyState
          icon={CalendarPlus}
          title="No brand selected"
          description="Select a brand to manage events"
        />
      </div>
    );
  }

  const upcomingEvents = events.filter(
    (e) => new Date(e.start_time) >= new Date() && e.status === "published",
  );
  const draftEvents = events.filter((e) => e.status === "draft");

  return (
    <div className="p-10 space-y-10">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-semibold tracking-tight">Events</h1>
            <HelpTooltip content="Create and manage events for Facebook and Google Business Profile. Events sync automatically across platforms." />
          </div>
          <p className="text-muted-foreground text-lg">
            Event management for {currentBrand.name}
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Create an event and publish it to Facebook and Google Business
                Profile
              </DialogDescription>
            </DialogHeader>
            <CreateEventForm
              connections={connections}
              onSuccess={() => {
                setShowCreateDialog(false);
                loadEvents();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Total Events"
          value={events.length.toString()}
          icon={<CalendarPlus className="h-5 w-5" />}
        />
        <StatCard
          title="Upcoming"
          value={upcomingEvents.length.toString()}
          icon={<Clock className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          title="Drafts"
          value={draftEvents.length.toString()}
          icon={<CalendarPlus className="h-5 w-5" />}
          variant="warning"
        />
      </div>

      {connections.length === 0 && (
        <Card className="bg-accent/5 border-dashed">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <CalendarPlus className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="font-medium mb-1">
                  Connect Facebook or Google Business
                </p>
                <p className="text-sm text-muted-foreground">
                  To create events, connect at least one platform that supports
                  events
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/integrations")}
              >
                Go to Integrations
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {upcomingEvents.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {draftEvents.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Drafts</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {draftEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <EmptyState
            icon={CalendarPlus}
            title="No events yet"
            description="Create your first event to engage with your audience"
            action={
              connections.length > 0
                ? {
                    label: "Create Event",
                    onClick: () => setShowCreateDialog(true),
                  }
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  variant = "default",
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  variant?: "default" | "success" | "warning";
}) {
  const variantColors = {
    default: "text-muted-foreground",
    success: "text-mint",
    warning: "text-coral",
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
          <div className={cn("transition-colors", variantColors[variant])}>
            {icon}
          </div>
        </div>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}

function EventCard({ event }: { event: PlatformEvent }) {
  const startDate = new Date(event.start_time);
  const endDate = event.end_time ? new Date(event.end_time) : null;

  return (
    <Card>
      {event.cover_image_url && (
        <div className="aspect-video w-full overflow-hidden rounded-t-xl">
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
          <Badge
            variant={event.status === "published" ? "default" : "secondary"}
          >
            {event.status}
          </Badge>
        </div>
        {event.description && (
          <CardDescription className="line-clamp-2">
            {event.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2 text-sm">
          <Clock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <div>
            <p className="font-medium">{startDate.toLocaleDateString()}</p>
            <p className="text-muted-foreground text-xs">
              {startDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {endDate &&
                ` - ${endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
            </p>
          </div>
        </div>

        {(event.location_name || event.online_url) && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              {event.online_url ? (
                <a
                  href={event.online_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet hover:underline flex items-center gap-1"
                >
                  Online Event
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <>
                  <p className="font-medium">{event.location_name}</p>
                  {event.location_address && (
                    <p className="text-muted-foreground text-xs line-clamp-1">
                      {event.location_address}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {event.rsvp_enabled && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {event.rsvp_count} {event.rsvp_count === 1 ? "person" : "people"}{" "}
              attending
            </span>
          </div>
        )}

        {event.published_urls &&
          Object.keys(event.published_urls).length > 0 && (
            <div className="pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2">
                Published on:
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(event.published_urls).map(([platform, url]) => {
                  const platformConfig =
                    PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS];
                  return (
                    <a
                      key={platform}
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-violet hover:underline"
                    >
                      {platformConfig?.icon} {platformConfig?.name}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}

function CreateEventForm({
  connections,
  onSuccess,
}: {
  connections: PlatformConnection[];
  onSuccess: () => void;
}) {
  const { currentBrand } = useBrand();
  const { toast } = useToast();
  const [formData, setFormData] = useState<CreateEventFormData>({
    title: "",
    description: "",
    start_time: new Date(),
    rsvp_enabled: false,
    platforms: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentBrand?.id || formData.platforms.length === 0) {
      toast({
        title: "Validation Error",
        description:
          "Please fill all required fields and select at least one platform",
        variant: "destructive",
      });
      return;
    }

    try {
      const connectionIds = connections
        .filter((c) => formData.platforms.includes(c.provider))
        .map((c) => c.id);

      const { error } = await supabase.from("platform_events").insert({
        brand_id: currentBrand.id,
        connection_ids: connectionIds,
        title: formData.title,
        description: formData.description,
        start_time: formData.start_time.toISOString(),
        end_time: formData.end_time?.toISOString(),
        location_name: formData.location_name,
        location_address: formData.location_address,
        online_url: formData.online_url,
        cover_image_url: formData.cover_image_url,
        rsvp_enabled: formData.rsvp_enabled,
        status: "draft",
      });

      if (error) throw error;

      toast({
        title: "Event Created",
        description: "Your event has been saved as a draft",
      });
      onSuccess();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">Event Title *</Label>
        <Input
          id="title"
          placeholder="Annual Summer Festival"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Join us for an amazing celebration..."
          className="min-h-[100px]"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start">Start Date & Time *</Label>
          <Input
            id="start"
            type="datetime-local"
            value={formData.start_time.toISOString().slice(0, 16)}
            onChange={(e) =>
              setFormData({ ...formData, start_time: new Date(e.target.value) })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end">End Date & Time</Label>
          <Input
            id="end"
            type="datetime-local"
            value={formData.end_time?.toISOString().slice(0, 16) || ""}
            onChange={(e) =>
              setFormData({ ...formData, end_time: new Date(e.target.value) })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location-name">Location Name</Label>
        <Input
          id="location-name"
          placeholder="City Park Amphitheater"
          value={formData.location_name}
          onChange={(e) =>
            setFormData({ ...formData, location_name: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location-address">Location Address</Label>
        <Input
          id="location-address"
          placeholder="123 Main St, City, State 12345"
          value={formData.location_address}
          onChange={(e) =>
            setFormData({ ...formData, location_address: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="online-url">Or Online Event URL</Label>
        <Input
          id="online-url"
          type="url"
          placeholder="https://zoom.us/..."
          value={formData.online_url}
          onChange={(e) =>
            setFormData({ ...formData, online_url: e.target.value })
          }
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="rsvp"
          checked={formData.rsvp_enabled}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, rsvp_enabled: checked as boolean })
          }
        />
        <Label htmlFor="rsvp" className="cursor-pointer">
          Enable RSVP tracking
        </Label>
      </div>

      <div className="space-y-3">
        <Label>Select Platforms *</Label>
        {connections.map((connection) => {
          const platform = PLATFORM_CONFIGS[connection.provider];
          const isSelected = formData.platforms.includes(connection.provider);

          return (
            <div
              key={connection.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border border-border/50 cursor-pointer transition-all hover:bg-accent/5",
                isSelected && "bg-accent/10 border-violet",
              )}
              onClick={() => {
                const platforms = isSelected
                  ? formData.platforms.filter((p) => p !== connection.provider)
                  : [...formData.platforms, connection.provider];
                setFormData({ ...formData, platforms });
              }}
            >
              <Checkbox checked={isSelected} />
              <span className="text-xl">{platform.icon}</span>
              <div className="flex-1">
                <p className="font-medium text-sm">{platform.name}</p>
                <p className="text-xs text-muted-foreground">
                  @{connection.account_username}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          Create Event
        </Button>
      </div>
    </form>
  );
}
