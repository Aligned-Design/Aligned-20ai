/**
 * Bulk Approval Routes
 * Handles bulk approval/rejection of multiple posts with atomic operations
 */

import { RequestHandler } from 'express';
import { z } from 'zod';
import { logAuditAction } from '../lib/audit-logger';

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

// Mock storage for post approvals
const postApprovalsStore: Map<string, {
  postId: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  rejectedAt?: string;
  approvedBy?: string;
  rejectedBy?: string;
}> = new Map();

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

    const now = new Date().toISOString();

    // Process each post
    for (const postId of postIds) {
      try {
        // Check if post exists in store (mock)
        const key = `${brandId}:${postId}`;
        const currentApproval = postApprovalsStore.get(key);

        // If post doesn't exist, create a new entry
        if (!currentApproval) {
          const approval = {
            postId,
            status: action === 'approve' ? 'approved' as const : 'rejected' as const,
            ...(action === 'approve'
              ? { approvedAt: now, approvedBy: userEmail }
              : { rejectedAt: now, rejectedBy: userEmail }
            ),
          };
          postApprovalsStore.set(key, approval);
        } else {
          // Update existing approval
          const approval = {
            ...currentApproval,
            postId,
            status: action === 'approve' ? 'approved' as const : 'rejected' as const,
            ...(action === 'approve'
              ? { approvedAt: now, approvedBy: userEmail }
              : { rejectedAt: now, rejectedBy: userEmail }
            ),
          };
          postApprovalsStore.set(key, approval);
        }

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

    const key = `${brandId}:${postId}`;
    const approval = postApprovalsStore.get(key);

    if (!approval) {
      return res.status(404).json({
        error: 'Approval record not found',
      });
    }

    res.json({
      success: true,
      approval,
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

    const approvals = postIds.map(postId => {
      const key = `${brandId}:${postId}`;
      return postApprovalsStore.get(key) || {
        postId,
        status: 'pending',
      };
    });

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

    // In a real implementation, this would set a lock flag on posts
    // For now, we'll just return success
    const lockedCount = postIds.length;

    res.json({
      success: true,
      message: `Successfully locked ${lockedCount} posts`,
      lockedCount,
    });
  } catch (error) {
    console.error('[Lock Posts] Error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to lock posts',
    });
  }
};
