import { useState, useEffect } from "react";
import { useBrand } from "@/contexts/BrandContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { DashboardSkeleton } from "@/components/ui/skeletons";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Send,
  Sparkles,
  Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  PlatformReview,
  ReviewSentiment,
  PLATFORM_CONFIGS,
} from "@/types/integrations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Reviews() {
  const { currentBrand, loading: brandLoading } = useBrand();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<PlatformReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSentiment, setFilterSentiment] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    if (currentBrand?.id) {
      loadReviews();
    }
  }, [currentBrand?.id]);

  const loadReviews = async () => {
    if (!currentBrand?.id) return;

    try {
      const { data, error } = await supabase
        .from("platform_reviews")
        .select("*")
        .eq("brand_id", currentBrand.id)
        .order("review_date", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading reviews",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (reviewId: string, responseText: string) => {
    try {
      const { error } = await supabase
        .from("platform_reviews")
        .update({
          response_text: responseText,
          responded_at: new Date().toISOString(),
          status: "answered",
        })
        .eq("id", reviewId);

      if (error) throw error;

      toast({
        title: "Response Sent",
        description: "Your response has been posted",
      });
      loadReviews();
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
          icon={MessageSquare}
          title="No brand selected"
          description="Select a brand to manage reviews"
        />
      </div>
    );
  }

  const filteredReviews = reviews.filter((review) => {
    if (filterStatus !== "all" && review.status !== filterStatus) return false;
    if (filterSentiment !== "all" && review.sentiment !== filterSentiment)
      return false;
    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.review_date).getTime() - new Date(a.review_date).getTime()
        );
      case "oldest":
        return (
          new Date(a.review_date).getTime() - new Date(b.review_date).getTime()
        );
      case "highest":
        return b.rating - a.rating;
      case "lowest":
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  const stats = {
    total: reviews.length,
    unanswered: reviews.filter((r) => r.status === "unanswered").length,
    average:
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          ).toFixed(1)
        : "0.0",
    positive: reviews.filter((r) => r.sentiment === "positive").length,
    negative: reviews.filter((r) => r.sentiment === "negative").length,
  };

  return (
    <div className="p-10 space-y-10">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-semibold tracking-tight">Reviews</h1>
          <HelpTooltip content="Manage and respond to reviews from Facebook and Google Business Profile in one centralized dashboard." />
        </div>
        <p className="text-muted-foreground text-lg">
          Reputation management for {currentBrand.name}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Reviews"
          value={stats.total.toString()}
          icon={<MessageSquare className="h-5 w-5" />}
        />
        <StatCard
          title="Unanswered"
          value={stats.unanswered.toString()}
          icon={<Star className="h-5 w-5" />}
          variant="warning"
        />
        <StatCard
          title="Average Rating"
          value={stats.average}
          icon={<Star className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          title="Sentiment"
          value={`${stats.positive} / ${stats.negative}`}
          subtitle="Positive / Negative"
          icon={<ThumbsUp className="h-5 w-5" />}
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="unanswered">Unanswered</SelectItem>
            <SelectItem value="answered">Answered</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterSentiment} onValueChange={setFilterSentiment}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by sentiment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sentiment</SelectItem>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="highest">Highest Rating</SelectItem>
            <SelectItem value="lowest">Lowest Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No reviews found"
            description="Reviews from your connected platforms will appear here"
          />
        ) : (
          sortedReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onRespond={(text) => handleRespond(review.id, text)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
}: {
  title: string;
  value: string;
  subtitle?: string;
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
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

function ReviewCard({
  review,
  onRespond,
}: {
  review: PlatformReview;
  onRespond: (text: string) => void;
}) {
  const [responseText, setResponseText] = useState("");
  const [showResponseDialog, setShowResponseDialog] = useState(false);

  const platform = PLATFORM_CONFIGS[review.provider];
  const sentimentColors: Record<ReviewSentiment, string> = {
    positive: "bg-mint/10 text-mint border-mint/20",
    neutral: "bg-azure/10 text-azure border-azure/20",
    negative: "bg-coral/10 text-coral border-coral/20",
  };

  const handleSubmitResponse = () => {
    if (responseText.trim()) {
      onRespond(responseText);
      setResponseText("");
      setShowResponseDialog(false);
    }
  };

  const handleGenerateAI = () => {
    const aiResponse = `Thank you for your ${review.rating}-star review! We appreciate your feedback and are glad you had a ${review.rating >= 4 ? "positive" : "valuable"} experience with ${review.reviewer_name}.`;
    setResponseText(aiResponse);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Avatar>
              <AvatarImage src={review.reviewer_avatar_url} />
              <AvatarFallback>
                {review.reviewer_name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="font-medium">{review.reviewer_name}</p>
                <Badge variant="outline" className="gap-1">
                  <span>{platform?.icon}</span>
                  {platform?.name}
                </Badge>
                {review.sentiment && (
                  <Badge
                    className={cn("border", sentimentColors[review.sentiment])}
                  >
                    {review.sentiment}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < review.rating
                          ? "fill-coral text-coral"
                          : "text-muted-foreground/30",
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(review.review_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <Badge
            variant={review.status === "unanswered" ? "destructive" : "default"}
          >
            {review.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed">{review.review_text}</p>

        {review.response_text ? (
          <div className="rounded-lg bg-accent/5 border border-border/50 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Your Response</Badge>
              <span className="text-xs text-muted-foreground">
                {review.responded_at &&
                  new Date(review.responded_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm leading-relaxed">{review.response_text}</p>
          </div>
        ) : (
          <Dialog
            open={showResponseDialog}
            onOpenChange={setShowResponseDialog}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Respond to Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Respond to {review.reviewer_name}</DialogTitle>
                <DialogDescription>
                  Write a thoughtful response to this {review.rating}-star
                  review
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="rounded-lg bg-accent/5 border border-border/50 p-4">
                  <p className="text-sm">{review.review_text}</p>
                </div>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Write your response..."
                    className="min-h-[150px]"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleGenerateAI}
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate AI Response
                  </Button>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowResponseDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSubmitResponse}
                    disabled={!responseText.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Response
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
