import { useState, useEffect } from 'react';
import { useBrand } from '@/contexts/BrandContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/ui/empty-state';
import { DashboardSkeleton } from '@/components/ui/skeletons';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import {
  PenSquare,
  Image as ImageIcon,
  Hash,
  Calendar,
  Send,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
  PLATFORM_CONFIGS,
  PlatformConnection,
  PlatformProvider,
  ContentType,
  CreatePostFormData,
} from '@/types/integrations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export default function CreatePost() {
  const { currentBrand, loading: brandLoading } = useBrand();
  const { toast } = useToast();
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformProvider[]>([]);
  const [formData, setFormData] = useState<CreatePostFormData>({
    caption: '',
    content_type: 'post',
    platforms: [],
    hashtags: [],
  });

  useEffect(() => {
    if (currentBrand?.id) {
      loadConnections();
    }
  }, [currentBrand?.id]);

  const loadConnections = async () => {
    if (!currentBrand?.id) return;

    try {
      const { data, error } = await supabase
        .from('platform_connections')
        .select('*')
        .eq('brand_id', currentBrand.id)
        .eq('status', 'connected')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading connections',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (provider: PlatformProvider) => {
    setSelectedPlatforms(prev =>
      prev.includes(provider)
        ? prev.filter(p => p !== provider)
        : [...prev, provider]
    );
  };

  const handleSaveDraft = async () => {
    if (!currentBrand?.id || selectedPlatforms.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one platform',
        variant: 'destructive',
      });
      return;
    }

    try {
      const connectionIds = connections
        .filter(c => selectedPlatforms.includes(c.provider))
        .map(c => c.id);

      const { error } = await supabase.from('social_posts').insert({
        brand_id: currentBrand.id,
        connection_ids: connectionIds,
        title: formData.title,
        caption: formData.caption,
        content_type: formData.content_type,
        media_urls: formData.media_urls,
        hashtags: formData.hashtags,
        cta_text: formData.cta_text,
        cta_url: formData.cta_url,
        status: 'draft',
      });

      if (error) throw error;

      toast({
        title: 'Draft Saved',
        description: 'Your post has been saved as a draft',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSchedule = async () => {
    toast({
      title: 'Schedule Post',
      description: 'Opening scheduler...',
    });
  };

  const handlePublish = async () => {
    toast({
      title: 'Publishing',
      description: 'Your post will be published to selected platforms...',
    });
  };

  if (brandLoading || loading) {
    return <DashboardSkeleton />;
  }

  if (!currentBrand) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <EmptyState
          icon={PenSquare}
          title="No brand selected"
          description="Select a brand to create posts"
        />
      </div>
    );
  }

  const connectedPlatforms = Array.from(new Set(connections.map(c => c.provider)));
  const tier1Platforms = connectedPlatforms.filter(
    p => PLATFORM_CONFIGS[p]?.tier === 1
  );

  if (connectedPlatforms.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <EmptyState
          icon={PenSquare}
          title="No platforms connected"
          description="Connect at least one platform to start creating posts"
          action={{
            label: 'Go to Integrations',
            onClick: () => window.location.href = '/integrations',
          }}
        />
      </div>
    );
  }

  const maxCaptionLength = Math.min(
    ...selectedPlatforms
      .map(p => PLATFORM_CONFIGS[p]?.maxCaptionLength)
      .filter(Boolean) as number[]
  ) || 2200;

  return (
    <div className="p-10 space-y-10">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-semibold tracking-tight">Create Post</h1>
          <HelpTooltip content="Create and publish content across all your connected platforms from one unified composer." />
        </div>
        <p className="text-muted-foreground text-lg">
          Compose once, publish everywhere for {currentBrand.name}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="Post title for LinkedIn articles, blog posts..."
                  value={formData.title || ''}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="caption">Caption / Content</Label>
                  <span className="text-xs text-muted-foreground">
                    {formData.caption.length} / {maxCaptionLength}
                  </span>
                </div>
                <Textarea
                  id="caption"
                  placeholder="Write your post content..."
                  className="min-h-[200px] resize-y"
                  value={formData.caption}
                  onChange={e => setFormData({ ...formData, caption: e.target.value })}
                  maxLength={maxCaptionLength}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hashtags">Hashtags</Label>
                <Input
                  id="hashtags"
                  placeholder="#marketing #socialmedia #content"
                  value={formData.hashtags?.join(' ') || ''}
                  onChange={e => {
                    const tags = e.target.value
                      .split(/\s+/)
                      .filter(tag => tag.startsWith('#'))
                      .map(tag => tag.slice(1));
                    setFormData({ ...formData, hashtags: tags });
                  }}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cta-text">CTA Text (Optional)</Label>
                  <Input
                    id="cta-text"
                    placeholder="Learn More"
                    value={formData.cta_text || ''}
                    onChange={e => setFormData({ ...formData, cta_text: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cta-url">CTA URL (Optional)</Label>
                  <Input
                    id="cta-url"
                    type="url"
                    placeholder="https://..."
                    value={formData.cta_url || ''}
                    onChange={e => setFormData({ ...formData, cta_url: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Media</Label>
                <div className="rounded-lg border-2 border-dashed border-border/50 p-8 text-center hover:bg-accent/5 transition-colors cursor-pointer">
                  <ImageIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Click to upload images or videos
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports JPG, PNG, MP4 (up to 100MB)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleSchedule}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button
              className="flex-1"
              onClick={handlePublish}
              disabled={!formData.caption || selectedPlatforms.length === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              Publish Now
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Platforms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tier1Platforms.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No Tier 1 platforms connected
                </p>
              ) : (
                tier1Platforms.map(provider => {
                  const platform = PLATFORM_CONFIGS[provider];
                  const isSelected = selectedPlatforms.includes(provider);
                  const platformConnections = connections.filter(c => c.provider === provider);

                  return (
                    <div key={provider}>
                      <div
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border border-border/50 cursor-pointer transition-all hover:bg-accent/5',
                          isSelected && 'bg-accent/10 border-violet'
                        )}
                        onClick={() => togglePlatform(provider)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => togglePlatform(provider)}
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xl">{platform.icon}</span>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{platform.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {platformConnections.length} account
                              {platformConnections.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-violet" />}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {selectedPlatforms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Platform Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedPlatforms.map(provider => {
                  const platform = PLATFORM_CONFIGS[provider];
                  return (
                    <div key={provider} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{platform.icon}</span>
                        <span className="text-sm font-medium">{platform.name}</span>
                      </div>
                      <div className="pl-6 space-y-0.5 text-xs text-muted-foreground">
                        {platform.maxCaptionLength && (
                          <p>• Max caption: {platform.maxCaptionLength} chars</p>
                        )}
                        {platform.maxHashtags && (
                          <p>• Max hashtags: {platform.maxHashtags}</p>
                        )}
                        <p>• Supports: {platform.supportedContentTypes.join(', ')}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
