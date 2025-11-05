import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  Play, 
  Eye, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContentItem, ProductionDashboardData, BatchOperation } from '@shared/content-production';

export default function ContentDashboard() {
  const [dashboardData, setDashboardData] = useState<ProductionDashboardData | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDashboardData();
    // Set up real-time updates
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/content/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchOperation = async (operation: BatchOperation) => {
    try {
      await fetch('/api/content/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(operation)
      });
      await loadDashboardData();
      setSelectedItems([]);
    } catch (error) {
      console.error('Batch operation failed:', error);
    }
  };

  const handleRetry = async (contentId: string) => {
    try {
      await fetch(`/api/content/${contentId}/retry`, { method: 'POST' });
      await loadDashboardData();
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div>Failed to load dashboard</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Production</h1>
          <p className="text-gray-600">Manage and monitor your content generation pipeline</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Generate Content
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatusCard
          title="Completed"
          count={dashboardData.summary.completed}
          total={dashboardData.summary.total}
          color="green"
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <StatusCard
          title="In Queue"
          count={dashboardData.summary.inQueue}
          total={dashboardData.summary.total}
          color="yellow"
          icon={<Clock className="h-5 w-5" />}
        />
        <StatusCard
          title="Generating"
          count={dashboardData.summary.generating}
          total={dashboardData.summary.total}
          color="blue"
          icon={<Zap className="h-5 w-5" />}
        />
        <StatusCard
          title="Errored"
          count={dashboardData.summary.errored}
          total={dashboardData.summary.total}
          color="red"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Batch Actions */}
      {selectedItems.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex items-center justify-between p-4">
            <span className="text-blue-800 font-medium">
              {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleBatchOperation({ action: 'retry', contentIds: selectedItems })}
              >
                Retry Selected
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBatchOperation({ action: 'approve', contentIds: selectedItems })}
              >
                Approve Selected
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Tabs */}
      <Tabs value={activeFilter} onValueChange={setActiveFilter}>
        <TabsList>
          <TabsTrigger value="all">All Content</TabsTrigger>
          <TabsTrigger value="errored">
            Errored ({dashboardData.summary.errored})
          </TabsTrigger>
          <TabsTrigger value="queued">
            In Queue ({dashboardData.summary.inQueue})
          </TabsTrigger>
          <TabsTrigger value="generating">
            Generating ({dashboardData.summary.generating})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ContentGrid
            items={dashboardData.recentActivity}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
            onRetry={handleRetry}
          />
        </TabsContent>

        <TabsContent value="errored" className="space-y-4">
          <ContentGrid
            items={dashboardData.erroredItems}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
            onRetry={handleRetry}
            showErrorDetails
          />
        </TabsContent>

        <TabsContent value="queued" className="space-y-4">
          <ContentGrid
            items={dashboardData.queuedItems}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
            onRetry={handleRetry}
            showQueuePosition
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface StatusCardProps {
  title: string;
  count: number;
  total: number;
  color: 'green' | 'yellow' | 'blue' | 'red';
  icon: React.ReactNode;
}

function StatusCard({ title, count, total, color, icon }: StatusCardProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  const colorClasses = {
    green: 'text-green-600 bg-green-100 border-green-200',
    yellow: 'text-yellow-600 bg-yellow-100 border-yellow-200',
    blue: 'text-blue-600 bg-blue-100 border-blue-200',
    red: 'text-red-600 bg-red-100 border-red-200'
  };

  return (
    <Card className={cn("transition-all hover:shadow-md", colorClasses[color])}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2 rounded-full", colorClasses[color])}>
            {icon}
          </div>
          <span className="text-2xl font-bold">{count}</span>
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <div className="flex items-center gap-2 mt-2">
            <Progress value={percentage} className="flex-1 h-2" />
            <span className="text-xs text-gray-600">{percentage.toFixed(0)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ContentGridProps {
  items: ContentItem[];
  selectedItems: string[];
  onSelectionChange: (ids: string[]) => void;
  onRetry: (id: string) => void;
  showErrorDetails?: boolean;
  showQueuePosition?: boolean;
}

function ContentGrid({ 
  items, 
  selectedItems, 
  onSelectionChange, 
  onRetry,
  showErrorDetails,
  showQueuePosition 
}: ContentGridProps) {
  const handleSelectItem = (id: string, selected: boolean) => {
    if (selected) {
      onSelectionChange([...selectedItems, id]);
    } else {
      onSelectionChange(selectedItems.filter(item => item !== id));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((item) => (
        <ContentCard
          key={item.id}
          item={item}
          isSelected={selectedItems.includes(item.id)}
          onSelect={(selected) => handleSelectItem(item.id, selected)}
          onRetry={() => onRetry(item.id)}
          showErrorDetails={showErrorDetails}
          showQueuePosition={showQueuePosition}
        />
      ))}
    </div>
  );
}

interface ContentCardProps {
  item: ContentItem;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onRetry: () => void;
  showErrorDetails?: boolean;
  showQueuePosition?: boolean;
}

function ContentCard({ 
  item, 
  isSelected, 
  onSelect, 
  onRetry,
  showErrorDetails,
  showQueuePosition 
}: ContentCardProps) {
  const getStatusColor = (status: ContentItem['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-blue-100 text-blue-800';
      case 'queued': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: ContentItem['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'generating': return <Zap className="h-4 w-4" />;
      case 'queued': return <Clock className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card className={cn(
      "transition-all hover:shadow-md cursor-pointer",
      isSelected && "ring-2 ring-primary"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="mt-1"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(item.status)}>
                {getStatusIcon(item.status)}
                <span className="ml-1 capitalize">{item.status}</span>
              </Badge>
              <Badge variant="outline" className="text-xs">
                {item.platform}
              </Badge>
            </div>
            
            <h4 className="font-medium text-sm mb-1 line-clamp-1">{item.title}</h4>
            <p className="text-xs text-gray-600 line-clamp-2 mb-3">{item.content}</p>
            
            {/* Generation Progress */}
            {item.generationJob && item.status === 'generating' && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Generating...</span>
                  <span>{item.generationJob.progress}%</span>
                </div>
                <Progress value={item.generationJob.progress} className="h-1" />
              </div>
            )}
            
            {/* Error Details */}
            {showErrorDetails && item.generationJob?.error && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                {item.generationJob.error}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {new Date(item.updatedAt).toLocaleDateString()}
              </span>
              
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Eye className="h-3 w-3" />
                </Button>
                
                {item.status === 'error' && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0"
                    onClick={onRetry}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                )}
                
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
