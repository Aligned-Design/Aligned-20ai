import React, { useState, useEffect } from 'react';
import { MediaUploader } from '@/components/media/MediaUploader';
import { MediaBrowser } from '@/components/media/MediaBrowser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HardDrive, Image, Upload } from 'lucide-react';
import { StorageUsageResponse, MediaUploadResponse } from '@shared/media';

export function MediaManager() {
  const [brandId] = useState('demo-brand-123'); // In real app, get from context/auth
  const [storageUsage, setStorageUsage] = useState<StorageUsageResponse | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadStorageUsage();
  }, [brandId, refreshTrigger]);

  const loadStorageUsage = async () => {
    try {
      const response = await fetch(`/api/media/usage/${brandId}`);
      const data: StorageUsageResponse = await response.json();
      setStorageUsage(data);
    } catch (error) {
      console.error('Failed to load storage usage:', error);
    }
  };

  const handleUploadComplete = (results: MediaUploadResponse[]) => {
    console.log('Upload complete:', results);
    setRefreshTrigger(prev => prev + 1);
  };

  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Media Manager</h1>
        <p className="text-gray-600">
          Upload, organize, and manage your brand assets
        </p>
      </div>

      {/* Storage Usage Card */}
      {storageUsage && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Assets:</span>
                <Badge variant="secondary">{storageUsage.assetCount}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Storage:</span>
                <Badge variant="secondary">
                  {formatFileSize(storageUsage.totalSize)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Bucket:</span>
                <Badge variant="outline">{storageUsage.bucketName}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList>
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Browse Assets
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Media
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <Card>
            <CardHeader>
              <CardTitle>Asset Library</CardTitle>
            </CardHeader>
            <CardContent>
              <MediaBrowser 
                brandId={brandId}
                onSelectAsset={(asset) => console.log('Selected:', asset)}
                key={refreshTrigger} // Force refresh after uploads
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <MediaUploader
                brandId={brandId}
                onUploadComplete={handleUploadComplete}
                maxFiles={20}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
