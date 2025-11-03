import { useEffect, useState } from 'react';
import { useBrand } from '@/contexts/BrandContext';
import { supabase, Asset } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderOpen, Plus, Search, Image, FileText, Video, File } from 'lucide-react';

export default function Assets() {
  const { currentBrand } = useBrand();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (currentBrand) {
      fetchAssets();
    }
  }, [currentBrand]);

  const fetchAssets = async () => {
    if (!currentBrand) return;

    try {
      const { data } = await supabase
        .from('assets')
        .select('*')
        .eq('brand_id', currentBrand.id)
        .order('created_at', { ascending: false });

      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = assets.filter((asset) =>
    asset.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!currentBrand) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center max-w-md">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No brand selected</h2>
          <p className="text-muted-foreground">
            Select a brand to view its asset library.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Asset Library</h1>
          <p className="text-muted-foreground mt-1">
            Manage files and media for {currentBrand.name}
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Upload Asset
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : filteredAssets.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-card">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No assets yet</h3>
          <p className="text-muted-foreground mb-4">
            Upload your first asset to organize brand files
          </p>
          <Button>Upload Asset</Button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
}

function AssetCard({ asset }: { asset: Asset }) {
  const getIcon = () => {
    switch (asset.file_type) {
      case 'image':
        return <Image className="h-8 w-8" />;
      case 'video':
        return <Video className="h-8 w-8" />;
      case 'document':
        return <FileText className="h-8 w-8" />;
      default:
        return <File className="h-8 w-8" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="group rounded-xl border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="aspect-square rounded-lg bg-accent/50 flex items-center justify-center mb-3 text-muted-foreground">
        {getIcon()}
      </div>
      <p className="text-sm font-medium truncate mb-1">{asset.file_name}</p>
      {asset.file_size_bytes && (
        <p className="text-xs text-muted-foreground">{formatSize(asset.file_size_bytes)}</p>
      )}
      {asset.tags && asset.tags.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {asset.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
