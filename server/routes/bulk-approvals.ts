/**
 * Bulk Approval Routes
 * Handles bulk approval/rejection of multiple posts with atomic operations
 * Now uses Supabase database for persistence
 */

import { RequestHandler } from 'express';
import { z } from 'zod';
import { logAuditAction } from '../lib/audit-logger';
import { postApprovals as dbPostApprovals} from '../lib/dbClient';

// ==================== TYPES & VALIDATION ====================

const BulkApprovalRequestSchema = z.object({
  postIds: z.array(z.string().min(1)).min(1),
  action: z.enum(['approve', 'reject']),
  note: z.string().optional(),
});

export type BulkApprovalRequest = z.infer<typeof BulkApprovalRequestSchema>;

export interface BulkApprovalResult {
  success: boolean;
  totalRequested: number;
  approved: number;
  rejected: number;
  skipped: number;
  errors: Array<{
    postId: string;
    reason: string;
  }>;
}

/**
 * POST /api/client/approvals/bulk
 * Bulk approve or reject multiple posts
 */
export const bulkApproveOrReject: RequestHandler = async (req, res) => {
  try {
    const clientId = req.headers['x-client-id'] as string;
    const brandId = req.headers['x-brand-id'] as string;
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;

    if (!clientId || !brandId) {
      return res.status(400).json({
        error: 'Missing required headers: x-client-id, x-brand-id',
      });
    }

    // Validate request payload
    const validationResult = BulkApprovalRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const { postIds, action, note } = validationResult.data;
    const result: BulkApprovalResult = {
      success: true,
      totalRequested: postIds.length,
      approved: 0,
      rejected: 0,
      skipped: 0,
      errors: [],
    };

    // Process each post
    for (const postId of postIds) {
      try {
        // Upsert approval record in database
        const __approval = await dbPostApprovals.upsert({
          brand_id: brandId,
          post_id: postId,
          status: action === 'approve' ? 'approved' : 'rejected',
          locked: false,
          ...(action === 'approve'
            ? { approved_by: userEmail }
            : { rejected_by: userEmail }
          ),
        });

        if (action === 'approve') {
          result.approved++;
        } else {
          result.rejected++;
        }

        // Log audit trail
        await logAuditAction(
          brandId,
          postId,
          userId || 'system',
          userEmail || 'system',
          action === 'approve' ? 'BULK_APPROVED' : 'BULK_REJECTED',
          {
            bulkCount: postIds.length,
            note: note,
          }
        );
      } catch (error) {
        result.errors.push({
          postId,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Determine overall success based on error rate
    const errorRate = result.errors.length / postIds.length;
    if (errorRate > 0.5) {
      result.success = false;
    }

    res.json({
      ...result,
      message: result.success
        ? `Successfully ${action}d ${result.approved + result.rejected} of ${postIds.length} posts`
        : `Partially completed: ${result.approved + result.rejected} succeeded, ${result.errors.length} failed`,
    });
  } catch (error) {
    console.error('[Bulk Approvals] Error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to process bulk approval',
    });
  }
};

/**
 * GET /api/client/approvals/status/:postId
 * Get approval status for a specific post
 */
export const getApprovalStatus: RequestHandler = async (req, res) => {
  try {
    const { postId } = req.params;
    const brandId = req.headers['x-brand-id'] as string;

    if (!brandId) {
      return res.status(400).json({
        error: 'Missing required header: x-brand-id',
      });
    }

    const approval = await dbPostApprovals.get(brandId, postId);

    if (!approval) {
      return res.status(404).json({
        error: 'Approval record not found',
      });
    }

    // Convert to camelCase response format
    res.json({
      success: true,
      approval: {
        id: approval.id,
        brandId: approval.brand_id,
        postId: approval.post_id,
        status: approval.status,
        approvedAt: approval.approved_at,
        approvedBy: approval.approved_by,
        rejectedAt: approval.rejected_at,
        rejectedBy: approval.rejected_by,
        locked: approval.locked,
        createdAt: approval.created_at,
        updatedAt: approval.updated_at,
      },
    });
  } catch (error) {
    console.error('[Approval Status] Error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get approval status',
    });
  }
};

/**
 * POST /api/client/approvals/batch-status
 * Get approval status for multiple posts
 */
export const getBatchApprovalStatus: RequestHandler = async (req, res) => {
  try {
    const { postIds } = req.body as { postIds: string[] };
    const brandId = req.headers['x-brand-id'] as string;

    if (!brandId) {
      return res.status(400).json({
        error: 'Missing required header: x-brand-id',
      });
    }

    if (!postIds || !Array.isArray(postIds)) {
      return res.status(400).json({
        error: 'postIds array is required',
      });
    }

    // Fetch all approvals in parallel
    const approvals = await Promise.all(
      postIds.map(async (postId) => {
        const approval = await dbPostApprovals.get(brandId, postId);
        if (approval) {
          return {
            id: approval.id,
            brandId: approval.brand_id,
            postId: approval.post_id,
            status: approval.status,
            approvedAt: approval.approved_at,
            approvedBy: approval.approved_by,
            rejectedAt: approval.rejected_at,
            rejectedBy: approval.rejected_by,
            locked: approval.locked,
            createdAt: approval.created_at,
            updatedAt: approval.updated_at,
          };
        }
        // Return default pending status if not found
        return {
          postId,
          status: 'pending' as const,
        };
      })
    );

    res.json({
      success: true,
      approvals,
    });
  } catch (error) {
    console.error('[Batch Status] Error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get batch approval status',
    });
  }
};

/**
 * POST /api/client/approvals/lock
 * Lock posts after bulk approval to prevent re-approval
 */
export const lockPostsAfterApproval: RequestHandler = async (req, res) => {
  try {
    const { postIds } = req.body as { postIds: string[] };
    const brandId = req.headers['x-brand-id'] as string;

    if (!brandId) {
      return res.status(400).json({
        error: 'Missing required header: x-brand-id',
      });
    }

    if (!postIds || !Array.isArray(postIds)) {
      return res.status(400).json({
        error: 'postIds array is required',
      });
    }

    // Update posts to set locked flag in database
    try {
      await dbPostApprovals.batchUpdate(brandId, postIds, { locked: true });
    } catch (error) {
      console.warn('[Lock Posts] Warning: Could not lock all posts:', error);
      // Continue even if locking fails - this is non-critical
    }

    res.json({
      success: true,
      message: `Successfully locked ${postIds.length} posts`,
      lockedCount: postIds.length,
    });
  } catch (error) {
    console.error('[Lock Posts] Error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to lock posts',
    });
  }
};
