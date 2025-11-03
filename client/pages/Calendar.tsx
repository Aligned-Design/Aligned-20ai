import { useEffect, useState } from 'react';
import { useBrand } from '@/contexts/BrandContext';
import { supabase, ContentItem } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Plus, CheckCircle2, Clock, XCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { CalendarSkeleton } from '@/components/ui/skeletons';
import { useToast } from '@/hooks/use-toast';

export default function Calendar() {
  const { currentBrand, loading: brandLoading } = useBrand();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (currentBrand) {
      fetchContent();
    }
  }, [currentBrand]);

  const fetchContent = async () => {
    if (!currentBrand) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('content_items')
        .select('*')
        .eq('brand_id', currentBrand.id)
        .order('scheduled_for', { ascending: true });

      if (fetchError) throw fetchError;
      setContentItems(data || []);
    } catch (err: any) {
      console.error('Error fetching content:', err);
      setError(err.message || 'Failed to load content calendar');
      toast({
        title: 'Error loading calendar',
        description: 'We couldn\'t load your content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (brandLoading || (loading && contentItems.length === 0)) {
    return <CalendarSkeleton />;
  }

  if (!currentBrand) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <EmptyState
          icon={CalendarDays}
          title="No brand selected"
          description="Select a brand from the sidebar to view and manage its content calendar."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorState
          message={error}
          onRetry={fetchContent}
        />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Calendar</h1>
          <p className="text-muted-foreground mt-1">
            Schedule and manage content for {currentBrand.name}
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Create Content
        </Button>
      </div>

      <div className="grid gap-6">
        {contentItems.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No content scheduled"
            description="Create your first content item or let our AI agents generate on-brand content for you. Get started in seconds."
            action={{
              label: "Create First Post",
              onClick: () => toast({ title: 'Content creator coming soon!' }),
            }}
          />
        ) : (
          contentItems.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))
        )}
      </div>
    </div>
  );
}

function ContentCard({ item }: { item: ContentItem }) {
  const statusConfig = {
    draft: { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100', label: 'Draft' },
    pending_review: { icon: Eye, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending Review' },
    approved: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', label: 'Approved' },
    published: { icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Published' },
    rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Rejected' },
  };

  const config = statusConfig[item.status];
  const Icon = config.icon;

  return (
    <div className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <Badge variant="outline" className="text-xs">
              {item.content_type}
            </Badge>
            {item.platform && (
              <Badge variant="secondary" className="text-xs">
                {item.platform}
              </Badge>
            )}
          </div>
          {item.scheduled_for && (
            <p className="text-sm text-muted-foreground">
              Scheduled for {format(new Date(item.scheduled_for), 'PPp')}
            </p>
          )}
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg}`}>
          <Icon className={`h-4 w-4 ${config.color}`} />
          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
        </div>
      </div>
      {item.body && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.body}</p>
      )}
      {item.generated_by_agent && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          Generated by {item.generated_by_agent.replace('_', ' ')}
        </div>
      )}
    </div>
  );
}
