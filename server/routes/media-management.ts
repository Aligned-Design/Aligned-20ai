/**
 * PHASE 6: Media Management API Routes
 * Real implementation with Supabase, AI tagging, and duplicate detection
 */

import { Router, Request, Response } from 'express';
import { mediaService } from '../lib/media-service';
import { supabase } from '../lib/supabase';
import multer from 'multer';

const router = Router();

// Configure multer for file uploads (in-memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 20
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/', 'video/', 'application/pdf'];
    const isAllowed = allowed.some(type => file.mimetype.startsWith(type));

    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  }
});

/**
 * POST /api/media/upload
 * Upload single or multiple files with progress tracking
 */
router.post('/upload', upload.array('files', 20), async (req: Request, res: Response) => {
  try {
    const { brandId, category } = req.body;
    const tenantId = req.query.tenantId as string;

    if (!brandId || !tenantId || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: brandId, tenantId, category'
      });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided'
      });
    }

    // Verify brand belongs to tenant
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('id')
      .eq('id', brandId)
      .eq('tenant_id', tenantId)
      .limit(1);

    if (brandError || !brand || brand.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Brand not found'
      });
    }

    const uploadedAssets = [];
    const errors = [];

    // Upload each file
    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];
        const asset = await mediaService.uploadMedia(
          file.buffer,
          file.originalname,
          file.mimetype,
          brandId,
          tenantId,
          category as any,
          (progress) => {
            // Emit progress via SSE if needed
            console.log(`Upload progress: ${progress.percentComplete}% - ${progress.currentFile}`);
          }
        );

        uploadedAssets.push(asset);
      } catch (error) {
        errors.push({
          file: files[i].originalname,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    res.json({
      success: errors.length === 0,
      uploadedCount: uploadedAssets.length,
      totalCount: files.length,
      assets: uploadedAssets,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    });
  }
});

/**
 * GET /api/media/list
 * List assets with filtering, search, and pagination
 */
router.get('/list', async (req: Request, res: Response) => {
  try {
    const { brandId } = req.query;
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const sortBy = (req.query.sortBy as 'created' | 'name' | 'size' | 'usage') || 'created';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    if (!brandId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: brandId'
      });
    }

    const { assets, total } = await mediaService.listAssets(brandId as string, {
      category: category as any,
      search,
      tags,
      limit,
      offset,
      sortBy,
      sortOrder
    });

    res.json({
      success: true,
      assets,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list assets'
    });
  }
});

/**
 * GET /api/media/search
 * Full-text search with tag filtering
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { brandId, q, tags } = req.query;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    if (!brandId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: brandId'
      });
    }

    // Search by tags if provided
    if (tags) {
      const tagArray = (tags as string).split(',');
      const results = await mediaService.searchByTag(
        brandId as string,
        tagArray,
        limit
      );

      return res.json({
        success: true,
        assets: results,
        count: results.length
      });
    }

    // Otherwise use list with search
    const { assets, total } = await mediaService.listAssets(brandId as string, {
      search: q as string,
      limit
    });

    res.json({
      success: true,
      assets,
      count: total
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Search failed'
    });
  }
});

/**
 * GET /api/media/storage/:brandId
 * Get storage usage and quota information
 */
router.get('/storage/:brandId', async (req: Request, res: Response) => {
  try {
    const { brandId } = req.params;

    const usage = await mediaService.getStorageUsage(brandId);

    res.json({
      success: true,
      ...usage
    });
  } catch (error) {
    console.error('Storage usage error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get storage usage'
    });
  }
});

/**
 * GET /api/media/:assetId
 * Get single asset details
 */
router.get('/:assetId', async (req: Request, res: Response) => {
  try {
    const { assetId } = req.params;
    const { brandId } = req.query;

    if (!brandId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: brandId'
      });
    }

    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .eq('id', assetId)
      .eq('brand_id', brandId)
      .limit(1);

    if (error || !data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found'
      });
    }

    res.json({
      success: true,
      asset: data[0]
    });
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get asset'
    });
  }
});

/**
 * POST /api/media/:assetId/delete
 * Delete asset with cleanup
 */
router.post('/:assetId/delete', async (req: Request, res: Response) => {
  try {
    const { assetId } = req.params;
    const { brandId } = req.body;

    if (!brandId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: brandId'
      });
    }

    await mediaService.deleteAsset(assetId, brandId);

    res.json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete asset'
    });
  }
});

/**
 * POST /api/media/:assetId/track-usage
 * Track asset usage in posts/campaigns
 */
router.post('/:assetId/track-usage', async (req: Request, res: Response) => {
  try {
    const { assetId } = req.params;
    const { brandId, usedIn } = req.body;

    if (!brandId || !usedIn) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: brandId, usedIn'
      });
    }

    await mediaService.trackAssetUsage(assetId, usedIn, brandId);

    res.json({
      success: true,
      message: 'Asset usage tracked'
    });
  } catch (error) {
    console.error('Track usage error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track usage'
    });
  }
});

/**
 * POST /api/media/bulk-delete
 * Delete multiple assets
 */
router.post('/bulk-delete', async (req: Request, res: Response) => {
  try {
    const { assetIds, brandId } = req.body;

    if (!assetIds || !Array.isArray(assetIds) || !brandId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: assetIds (array), brandId'
      });
    }

    const results = {
      deleted: 0,
      failed: 0,
      errors: [] as unknown[]
    };

    for (const assetId of assetIds) {
      try {
        await mediaService.deleteAsset(assetId, brandId);
        results.deleted++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          assetId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    res.json({
      success: results.failed === 0,
      ...results
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Bulk delete failed'
    });
  }
});

/**
 * POST /api/media/organize
 * Reorganize assets into different categories
 */
router.post('/organize', async (req: Request, res: Response) => {
  try {
    const { assetIds, newCategory, brandId } = req.body;

    if (!assetIds || !Array.isArray(assetIds) || !newCategory || !brandId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: assetIds, newCategory, brandId'
      });
    }

    const { error } = await supabase
      .from('media_assets')
      .update({ category: newCategory })
      .in('id', assetIds)
      .eq('brand_id', brandId);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      message: `${assetIds.length} assets moved to ${newCategory}`,
      count: assetIds.length
    });
  } catch (error) {
    console.error('Organize error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to organize assets'
    });
  }
});

export default router;
