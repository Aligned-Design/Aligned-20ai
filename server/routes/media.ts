import { RequestHandler } from 'express';

interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  category: string;
  mimeType: string;
  size: number;
  brandId: string;
  tenantId: string;
  bucketPath: string;
  createdAt: string;
  updatedAt: string;
  hash?: string;
  tags?: string[];
  variants?: unknown[];
  metadata?: Record<string, unknown>;
}

interface MediaUploadResponse {
  success: boolean;
  asset?: MediaAsset;
  uploadId: string;
  error?: string;
  warnings?: string[];
}

interface MediaListResponse {
  assets: MediaAsset[];
  total: number;
  hasMore: boolean;
  categories: Record<string, number>;
}

interface StorageUsageResponse {
  brandId: string;
  totalSize: number;
  assetCount: number;
  bucketName: string;
  categoryBreakdown: Record<string, { count: number; size: number }>;
  lastUpdated: string;
}

interface DuplicateCheckResponse {
  isDuplicate: boolean;
  existingAsset?: MediaAsset;
  similarity: number;
}

interface SEOMetadataRequest {
  assetId: string;
  context?: string;
  targetKeywords?: string[];
}

interface SEOMetadataResponse {
  altText: string;
  title: string;
  description: string;
  keywords: string[];
  optimizedMetadata: Record<string, unknown>;
}

// Helper function stubs
async function getCategoryUsage(_bucketName: string, _brandId: string): Promise<Record<string, { count: number; size: number }>> {
  return {
    graphics: { count: 0, size: 0 },
    images: { count: 0, size: 0 },
    logos: { count: 0, size: 0 },
    videos: { count: 0, size: 0 }
  };
}

async function getSignedUrl(bucketName: string, assetPath: string, expirationSeconds: number): Promise<string> {
  return `https://storage.example.com/${bucketName}/${assetPath}?expires=${expirationSeconds}`;
}

async function checkDuplicate(_bucketName: string, _hash: string, _brandId: string): Promise<MediaAsset | null> {
  return null;
}

function generateSEOMetadata(asset: MediaAsset, _context: string): { altText: string; title: string; description: string } {
  return {
    altText: asset.originalName,
    title: `Image: ${asset.originalName}`,
    description: `Digital asset: ${asset.originalName}`
  };
}

export const uploadMedia: RequestHandler = async (req, res) => {
  try {
    const { brandId, tenantId } = req.body;
    
    if (!brandId || !tenantId) {
      return res.status(400).json({ 
        success: false, 
        error: 'brandId and tenantId required' 
      });
    }

    // Mock successful upload response
    const asset: MediaAsset = {
      id: `asset_${Date.now()}`,
      filename: 'placeholder.jpg',
      originalName: 'placeholder.jpg',
      category: 'images',
      mimeType: 'image/jpeg',
      size: 1024000,
      brandId,
      tenantId,
      bucketPath: `${tenantId}/${brandId}/images/placeholder.jpg`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const response: MediaUploadResponse = {
      success: true,
      asset,
      uploadId: asset.id
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    });
  }
};

export const listMedia: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.query;
    
    if (!brandId) {
      return res.status(400).json({ error: 'brandId required' });
    }

    const response: MediaListResponse = {
      assets: [],
      total: 0,
      hasMore: false,
      categories: {
        graphics: 0,
        images: 0,
        logos: 0,
        videos: 0,
        ai_exports: 0,
        client_uploads: 0
      }
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to list media'
    });
  }
};

export const getStorageUsage: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId required' });
    }

    const bucketName = `tenant-${tenantId}`;
    const categoryBreakdown = await getCategoryUsage(bucketName, brandId);

    const totalSize = Object.values(categoryBreakdown).reduce((sum, cat) => sum + cat.size, 0);
    const totalCount = Object.values(categoryBreakdown).reduce((sum, cat) => sum + cat.count, 0);

    const response: StorageUsageResponse = {
      brandId,
      totalSize,
      assetCount: totalCount,
      bucketName,
      categoryBreakdown,
      lastUpdated: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('Storage usage error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get storage usage'
    });
  }
};

export const getAssetUrl: RequestHandler = async (req, res) => {
  try {
    const { tenantId, assetPath } = req.params;
    const bucketName = `tenant-${tenantId}`;

    const signedUrl = await getSignedUrl(bucketName, assetPath, 3600);

    res.json({ url: signedUrl });
  } catch (error) {
    console.error('Asset URL error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get asset URL'
    });
  }
};

export const checkDuplicateAsset: RequestHandler = async (req, res) => {
  try {
    const { hash, brandId, tenantId } = req.query;

    if (!hash || !brandId || !tenantId) {
      return res.status(400).json({ error: 'hash, brandId, and tenantId required' });
    }

    const bucketName = `tenant-${tenantId}`;
    const existingAsset = await checkDuplicate(bucketName, hash as string, brandId as string);

    const response: DuplicateCheckResponse = {
      isDuplicate: !!existingAsset,
      existingAsset: existingAsset || undefined,
      similarity: existingAsset ? 1.0 : 0
    };

    res.json(response);
  } catch (error) {
    console.error('Duplicate check error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to check duplicates'
    });
  }
};

export const generateSEOMetadataRoute: RequestHandler = async (req, res) => {
  try {
    const { assetId, context = 'web', targetKeywords = [] } = req.body as SEOMetadataRequest;

    // TODO: Fetch asset from database
    // const asset = await db.assets.findById(assetId);
    
    // Mock asset for now
    const asset: MediaAsset = {
      id: assetId,
      filename: 'sample.jpg',
      originalName: 'sample.jpg',
      category: 'images',
      mimeType: 'image/jpeg',
      size: 1024,
      hash: 'mock-hash',
      tags: ['business', 'professional'],
      brandId: 'mock-brand',
      tenantId: 'mock-tenant',
      bucketPath: 'mock/path',
      variants: [],
      metadata: {
        width: 1920,
        height: 1080,
        keywords: ['professional', 'business'],
        aiTags: ['corporate', 'modern'],
        usedIn: [],
        usageCount: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const seoData = generateSEOMetadata(asset, context);

    const response: SEOMetadataResponse = {
      altText: seoData.altText,
      title: seoData.title,
      description: seoData.description,
      keywords: [...(asset.metadata?.keywords || []), ...targetKeywords],
      optimizedMetadata: asset.metadata || {}
    };

    res.json(response);
  } catch (error) {
    console.error('SEO metadata generation error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate SEO metadata'
    });
  }
};

export const trackAssetUsage: RequestHandler = async (req, res) => {
  try {
    const { assetId, usedIn } = req.body;

    if (!assetId || !usedIn) {
      return res.status(400).json({ error: 'assetId and usedIn required' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to track asset usage'
    });
  }
};
