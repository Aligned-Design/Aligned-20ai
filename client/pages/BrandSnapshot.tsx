import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase, Brand } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import {
  CheckCircle2,
  Palette,
  MessageSquare,
  Target,
  Shield,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function BrandSnapshot() {
  const [searchParams] = useSearchParams();
  const brandId = searchParams.get("brandId");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!brandId) {
      navigate("/brands");
      return;
    }

    fetchBrand();
  }, [brandId]);

  const fetchBrand = async () => {
    if (!brandId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from("brands")
        .select("*")
        .eq("id", brandId)
        .single();

      if (fetchError) throw fetchError;
      setBrand(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error loading brand",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading your brand snapshot..." />;
  }

  if (error || !brand) {
    return (
      <div className="p-8">
        <ErrorState message={error || "Brand not found"} onRetry={fetchBrand} />
      </div>
    );
  }

  const brandKit = (brand.brand_kit as any) || {};
  const voiceSummary = (brand.voice_summary as any) || {};
  const visualSummary = (brand.visual_summary as any) || {};

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary/10 via-fuchsia-500/10 to-sky-500/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Here's Your Brand Snapshot
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your brand profile is complete! Our AI agents are now trained on
            your unique voice, style, and preferences.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Voice Snapshot</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Tone</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {brandKit.toneKeywords?.map((tone: string) => (
                    <Badge key={tone} variant="secondary">
                      {tone}
                    </Badge>
                  )) || <p className="text-muted-foreground">Not specified</p>}
                </div>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Personality</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {brandKit.brandPersonality?.map((trait: string) => (
                    <Badge key={trait} variant="outline">
                      {trait}
                    </Badge>
                  )) || <p className="text-muted-foreground">Not specified</p>}
                </div>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">
                  Writing Style
                </p>
                <p className="mt-1">
                  {brandKit.writingStyle || "Not specified"}
                </p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">
                  Primary Audience
                </p>
                <p className="mt-1">
                  {brandKit.primaryAudience || "Not specified"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-fuchsia-500/10">
                <Palette className="h-5 w-5 text-fuchsia-600" />
              </div>
              <h2 className="text-xl font-semibold">Visual Identity</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">
                  Brand Colors
                </p>
                <div className="flex gap-2 mt-2">
                  {brandKit.primaryColor && (
                    <div className="flex items-center gap-2">
                      <div
                        className="h-8 w-8 rounded border"
                        style={{ backgroundColor: brandKit.primaryColor }}
                      />
                      <span className="text-xs">{brandKit.primaryColor}</span>
                    </div>
                  )}
                  {brandKit.secondaryColor && (
                    <div className="flex items-center gap-2">
                      <div
                        className="h-8 w-8 rounded border"
                        style={{ backgroundColor: brandKit.secondaryColor }}
                      />
                      <span className="text-xs">{brandKit.secondaryColor}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Font Family</p>
                <p className="mt-1">{brandKit.fontFamily || "Nourd"}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">
                  Font Weights
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {brandKit.fontWeights?.map((weight: string) => (
                    <Badge key={weight} variant="secondary">
                      {weight}
                    </Badge>
                  )) || <p className="text-muted-foreground">Not specified</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-sky-500/10">
                <Target className="h-5 w-5 text-sky-600" />
              </div>
              <h2 className="text-xl font-semibold">Content Preferences</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Platforms</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {brandKit.platformsUsed?.map((platform: string) => (
                    <Badge key={platform} variant="outline">
                      {platform}
                    </Badge>
                  )) || <p className="text-muted-foreground">Not specified</p>}
                </div>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">
                  Post Frequency
                </p>
                <p className="mt-1">
                  {brandKit.postFrequency || "Not specified"}
                </p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">
                  Content Types
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {brandKit.preferredContentTypes
                    ?.slice(0, 3)
                    .map((type: string) => (
                      <Badge key={type} variant="secondary">
                        {type}
                      </Badge>
                    )) || (
                    <p className="text-muted-foreground">Not specified</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold">Compliance & Guidelines</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">
                  Approval Workflow
                </p>
                <p className="mt-1">
                  {brandKit.approvalWorkflow || "Not configured"}
                </p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">
                  Words to Avoid
                </p>
                <p className="mt-1 text-muted-foreground">
                  {brandKit.wordsToAvoid || "None specified"}
                </p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">
                  Social Handles
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {brandKit.socialHandles?.map((handle: string) => (
                    <Badge key={handle} variant="secondary">
                      {handle}
                    </Badge>
                  )) || <p className="text-muted-foreground">Not specified</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl border bg-gradient-to-br from-primary/5 via-fuchsia-500/5 to-sky-500/5 p-8 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-primary mb-4" />
          <h3 className="text-2xl font-bold mb-2">Your AI Agents Are Ready!</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Doc Agent, Design Agent, and Advisor Agent have been trained on your
            brand profile. They're ready to generate on-brand content, create
            visuals, and provide data-driven recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate("/calendar")}
              size="lg"
              className="bg-gradient-to-r from-primary to-fuchsia-500 min-h-[44px]"
            >
              Start Creating Content
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={() => navigate("/dashboard")}
              size="lg"
              variant="outline"
              className="min-h-[44px]"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Button
            onClick={() => navigate(`/brand-intake?brandId=${brandId}`)}
            variant="ghost"
            size="sm"
          >
            Edit brand profile
          </Button>
        </div>
      </div>
    </div>
  );
}
