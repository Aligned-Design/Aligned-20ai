import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  Trash2,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  CheckCircle,
  Database,
  HardDrive,
  Grid,
  List,
  Zap
} from 'lucide-react';
import { MediaUploadWithProgress } from '@/components/media/MediaUploadWithProgress';
import { cn } from '@/lib/utils';

interface MediaAsset {
  id: string;
  filename: string;
  category: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string;
  metadata: {
    width?: number;
    height?: number;
    aiTags?: string[];
  };
  usageCount: number;
  createdAt: string;
}

interface StorageInfo {
  total: number;
  byCategory: Record<string, number>;
  assetCount: number;
  percentUsed: number;
  limit: number;
}

export default function MediaManagerV2() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('library');

  const brandId = 'demo-brand'; // In real app, get from context
  const tenantId = 'demo-tenant'; // In real app, get from context

  useEffect(() => {
    loadAssets();
    loadStorageInfo();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        brandId,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery }),
        limit: '100'
      });

      const response = await fetch(`/api/media/list?${params}`);
      if (!response.ok) throw new Error('Failed to load assets');

      const data = await response.json();
      setAssets(data.assets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const loadStorageInfo = async () => {
    try {
      const response = await fetch(`/api/media/storage/${brandId}`);
      if (response.ok) {
        const data = await response.json();
        setStorageInfo(data);
      }
    } catch (err) {
      console.error('Failed to load storage info:', err);
    }
  };

  const handleUploadComplete = (uploadedAssets: MediaAsset[]) => {
    setAssets(prev => [...uploadedAssets, ...prev]);
    loadStorageInfo();
    setActiveTab('library');
  };

  const handleDelete = async (assetId: string) => {
    if (!confirm('Delete this asset?')) return;

    try {
      const response = await fetch(`/api/media/${assetId}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId })
      });

      if (response.ok) {
        setAssets(prev => prev.filter(a => a.id !== assetId));
        loadStorageInfo();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAssets.size === 0) return;
    if (!confirm(`Delete ${selectedAssets.size} asset(s)?`)) return;

    try {
      const response = await fetch('/api/media/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetIds: Array.from(selectedAssets),
          brandId
        })
      });

      if (response.ok) {
        setAssets(prev => prev.filter(a => !selectedAssets.has(a.id)));
        setSelectedAssets(new Set());
        loadStorageInfo();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk delete failed');
    }
  };

  const handleDownload = (asset: MediaAsset) => {
    const link = document.createElement('a');
    link.href = asset.url;
    link.download = asset.filename;
    link.click();
  };

  const filteredAssets = assets.filter(asset => {
    if (searchQuery) {
      return asset.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.metadata.aiTags?.some(tag =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    return true;
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Media Manager
          </h1>
          <p className="text-gray-600">Organize, search, and reuse your brand assets</p>
        </div>
      </div>

      {/* Storage Info */}
      {storageInfo && (
        <Card className="bg-white border border-gray-100">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Storage Usage</p>
                  <p className="text-2xl font-bold">
                    {formatBytes(storageInfo.total)} / {formatBytes(storageInfo.limit)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Assets</p>
                  <p className="text-2xl font-bold">{storageInfo.assetCount}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{storageInfo.percentUsed.toFixed(1)}% used</span>
                  {storageInfo.percentUsed > 90 && (
                    <Badge variant="destructive">Storage full soon</Badge>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={cn(
                      'h-3 rounded-full transition-all',
                      storageInfo.percentUsed > 90 ? 'bg-red-600' :
                      storageInfo.percentUsed > 80 ? 'bg-yellow-600' :
                      'bg-green-600'
                    )}
                    style={{ width: `${Math.min(storageInfo.percentUsed, 100)}%` }}
                  />
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                {Object.entries(storageInfo.byCategory).map(([category, size]) => (
                  <div key={category} className="text-center">
                    <p className="text-xs text-gray-600 capitalize">{category}</p>
                    <p className="text-sm font-semibold">{formatBytes(size)}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="library">Asset Library</TabsTrigger>
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
        </TabsList>

        {/* Asset Library Tab */}
        <TabsContent value="library" className="space-y-4">
          {/* Controls */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by filename or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="graphics">Graphics</SelectItem>
                  <SelectItem value="images">Images</SelectItem>
                  <SelectItem value="logos">Logos</SelectItem>
                  <SelectItem value="videos">Videos</SelectItem>
                  <SelectItem value="ai_exports">AI Exports</SelectItem>
                  <SelectItem value="client_uploads">Client Uploads</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
                size="sm"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                size="sm"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedAssets.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
              <span className="font-medium">{selectedAssets.size} asset(s) selected</span>
              <Button
                onClick={handleBulkDelete}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          )}

          {/* Assets Display */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800">{error}</p>
              </CardContent>
            </Card>
          ) : filteredAssets.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No assets found</p>
                <p className="text-sm text-gray-400">
                  {searchQuery ? 'Try adjusting your search' : 'Upload files to get started'}
                </p>
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAssets.map(asset => (
                <div
                  key={asset.id}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    {asset.thumbnailUrl ? (
                      <img
                        src={asset.thumbnailUrl}
                        alt={asset.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Zap className="h-8 w-8 text-gray-400" />
                      </div>
                    )}

                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedAssets.has(asset.id)}
                      onChange={(e) => {
                        const newSet = new Set(selectedAssets);
                        if (e.target.checked) {
                          newSet.add(asset.id);
                        } else {
                          newSet.delete(asset.id);
                        }
                        setSelectedAssets(newSet);
                      }}
                      className="absolute top-2 left-2 w-4 h-4"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-2">
                    <p className="text-sm font-medium truncate">{asset.filename}</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {asset.category}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {formatBytes(asset.fileSize)}
                      </Badge>
                    </div>

                    {/* Tags */}
                    {asset.metadata.aiTags && asset.metadata.aiTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {asset.metadata.aiTags.slice(0, 2).map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {asset.metadata.aiTags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{asset.metadata.aiTags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Usage */}
                    <p className="text-xs text-gray-600">
                      Used {asset.usageCount} times
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(asset)}
                        className="flex-1"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(asset.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-2">
              {filteredAssets.map(asset => (
                <div
                  key={asset.id}
                  className="border rounded-lg p-4 flex items-center gap-4 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedAssets.has(asset.id)}
                    onChange={(e) => {
                      const newSet = new Set(selectedAssets);
                      if (e.target.checked) {
                        newSet.add(asset.id);
                      } else {
                        newSet.delete(asset.id);
                      }
                      setSelectedAssets(newSet);
                    }}
                    className="w-4 h-4"
                  />

                  {asset.thumbnailUrl && (
                    <img
                      src={asset.thumbnailUrl}
                      alt={asset.filename}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}

                  <div className="flex-1">
                    <p className="font-medium">{asset.filename}</p>
                    <div className="flex gap-2 flex-wrap mt-1">
                      <Badge variant="outline" className="text-xs">
                        {asset.category}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {formatBytes(asset.fileSize)}
                      </Badge>
                      <span className="text-xs text-gray-600">
                        Used {asset.usageCount} times
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(asset)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(asset.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload">
          <MediaUploadWithProgress
            brandId={brandId}
            tenantId={tenantId}
            category="graphics"
            onUploadComplete={handleUploadComplete}
            onError={(err) => setError(err)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
