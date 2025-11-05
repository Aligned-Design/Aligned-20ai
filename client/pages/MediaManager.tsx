import React, { useState, useEffect } from 'react';
import { Card as _Card, CardContent as _CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Search, 
  Image,
  Video,
  FileText,
  Download,
  Trash2
} from 'lucide-react';

interface MediaAsset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  size: number;
  createdAt: string;
  tags: string[];
  brand?: string;
}

export default function MediaManager() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      // Mock data - replace with actual API call
      const mockAssets: MediaAsset[] = [
        {
          id: '1',
          name: 'summer-campaign-hero.jpg',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
          size: 2048000,
          createdAt: new Date().toISOString(),
          tags: ['summer', 'campaign', 'hero'],
          brand: 'Nike'
        },
        {
          id: '2',
          name: 'product-showcase.mp4',
          type: 'video',
          url: 'https://example.com/video.mp4',
          size: 15360000,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          tags: ['product', 'showcase'],
          brand: 'Apple'
        },
        {
          id: '3',
          name: 'brand-guidelines.pdf',
          type: 'document',
          url: 'https://example.com/guidelines.pdf',
          size: 1024000,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          tags: ['guidelines', 'brand'],
          brand: 'Tesla'
        }
      ];
      setAssets(mockAssets);
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || asset.type === selectedType;
    return matchesSearch && matchesType;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type: MediaAsset['type']) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600">Manage your brand assets and media files</p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Media
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          {['all', 'image', 'video', 'document'].map(type => (
            <Button
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(type)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredAssets.map(asset => (
          <AssetCard key={asset.id} asset={asset} formatFileSize={formatFileSize} getTypeIcon={getTypeIcon} />
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
          <p className="text-gray-600">Try adjusting your search or upload some media files.</p>
        </div>
      )}
    </div>
  );
}

function AssetCard({ 
  asset, 
  formatFileSize, 
  getTypeIcon 
}: { 
  asset: MediaAsset; 
  formatFileSize: (bytes: number) => string;
  getTypeIcon: (type: MediaAsset['type']) => React.ReactNode;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
          {asset.type === 'image' ? (
            <img 
              src={asset.url} 
              alt={asset.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-400 text-4xl">
              {getTypeIcon(asset.type)}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm line-clamp-2">
            {asset.name}
          </h4>
          
          <div className="flex items-center gap-1 text-xs text-gray-600">
            {getTypeIcon(asset.type)}
            <span>{formatFileSize(asset.size)}</span>
          </div>
          
          {asset.brand && (
            <Badge variant="outline" className="text-xs">
              {asset.brand}
            </Badge>
          )}
          
          <div className="flex flex-wrap gap-1">
            {asset.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {asset.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{asset.tags.length - 2}
              </Badge>
            )}
          </div>
          
          <div className="flex gap-1 pt-2">
            <Button size="sm" variant="outline" className="flex-1 text-xs gap-1">
              <Download className="h-3 w-3" />
              Download
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
