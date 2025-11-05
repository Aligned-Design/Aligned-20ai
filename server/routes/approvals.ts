/**
 * Approval workflow routes
 * Handles bulk approvals, individual approvals, and approval status tracking
 */

import { RequestHandler } from 'express';
import { BulkApprovalRequest, BulkApprovalResult } from '@shared/approvals';
import { logAuditAction, getPostAuditTrail } from '../lib/audit-logger';
import { sendEmail } from '../lib/email-service';
import {
  generateApprovalEmail,
  generateReminderEmail,
  generatePublishFailureEmail,
} from '../lib/email-templates';

/**
 * POST /api/approvals/bulk
 * Approve or reject multiple posts in a single request
 */
export const bulkApproveContent: RequestHandler = async (req, res) => {
  try {
    const { postIds, action, note } = req.body as BulkApprovalRequest;
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;
    const brandId = req.headers['x-brand-id'] as string;
    const userRole = req.headers['x-user-role'] as string;

    // Validate permissions
    if (!['client', 'agency', 'admin'].includes(userRole)) {
      return res.status(403).json({
        error: 'Invalid user role',
      });
    }

    // Validate input
    if (!Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({
        error: 'postIds must be a non-empty array',
      });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        error: 'action must be approve or reject',
      });
    }

    // Check role permissions
    // In production, verify via database RLS policies
    const canApprove =
      userRole === 'client' || userRole === 'admin' ||
      (userRole === 'agency' && action === 'approve');

    if (!canApprove) {
      return res.status(403).json({
        error: `User role '${userRole}' cannot ${action} content`,
      });
    }

    // Process each post
    const results: BulkApprovalResult = {
      success: true,
      totalRequested: postIds.length,
      approved: 0,
      rejected: 0,
      skipped: 0,
      errors: [],
    };

    for (const postId of postIds) {
      try {
        // TODO: Verify post exists and belongs to brand
        // TODO: Check if user has permission to approve this post
        // TODO: Get post details for audit log

        const auditAction = action === 'approve' ? 'APPROVED' : 'REJECTED';

        // Log audit action
        await logAuditAction(
          brandId,
          postId,
          userId,
          userEmail,
          auditAction as any,
          {
            note: note || '',
            bulkCount: postIds.length,
          },
          req.ip,
          req.headers['user-agent']
        );

        // Update post status in database
        // TODO: Update post status: in_review -> approved/rejected
        // TODO: Trigger publishing if approved (based on workflow)

        if (action === 'approve') {
          results.approved++;
          // TODO: Send approval confirmation email to requestor
        } else {
          results.rejected++;
          // TODO: Send rejection notification
        }
      } catch (error) {
        results.skipped++;
        results.errors.push({
          postId,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });

        // Log error
        await logAuditAction(
          brandId,
          postId,
          userId,
          userEmail,
          'BULK_APPROVED',
          {
            bulkCount: postIds.length,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          },
          req.ip,
          req.headers['user-agent']
        );
      }
    }

    // Send completion notification
    if (results.approved > 0 || results.rejected > 0) {
      // TODO: Send notification to agency team about bulk action
    }

    res.json(results);
  } catch (error) {
    console.error('[Approvals] Bulk approval error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to process bulk approvals',
    });
  }
};

/**
 * POST /api/approvals/:postId/approve
 * Approve a single post
 */
export const approveSingleContent: RequestHandler = async (req, res) => {
  try {
    const { postId } = req.params;
    const { note } = req.body;
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;
    const brandId = req.headers['x-brand-id'] as string;
    const userRole = req.headers['x-user-role'] as string;

    // Validate permissions
    if (!['client', 'admin'].includes(userRole)) {
      return res.status(403).json({
        error: 'Only clients and admins can approve content',
      });
    }

    // TODO: Verify post exists and belongs to brand
    // TODO: Verify post is in review status

    // Log approval
    await logAuditAction(
      brandId,
      postId,
      userId,
      userEmail,
      'APPROVED',
      { note: note || '' },
      req.ip,
      req.headers['user-agent']
    );

    // TODO: Update post status to approved
    // TODO: Trigger next workflow step
    // TODO: Send notifications

    res.json({
      success: true,
      postId,
      status: 'approved',
      approvedBy: userEmail,
      approvedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Approvals] Single approval error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to approve content',
    });
  }
};

/**
 * POST /api/approvals/:postId/reject
 * Reject a post with required changes
 */
export const rejectContent: RequestHandler = async (req, res) => {
  try {
    const { postId } = req.params;
    const { reason, note } = req.body;
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;
    const brandId = req.headers['x-brand-id'] as string;
    const userRole = req.headers['x-user-role'] as string;

    // Validate permissions
    if (!['client', 'admin'].includes(userRole)) {
      return res.status(403).json({
        error: 'Only clients and admins can reject content',
      });
    }

    // Validate input
    if (!reason) {
      return res.status(400).json({
        error: 'reason is required for rejections',
      });
    }

    // TODO: Verify post exists and belongs to brand
    // TODO: Verify post is in review status

    // Log rejection
    await logAuditAction(
      brandId,
      postId,
      userId,
      userEmail,
      'REJECTED',
      {
        reason,
        note: note || '',
      },
      req.ip,
      req.headers['user-agent']
    );

    // TODO: Update post status to rejected
    // TODO: Send rejection notification to creator
    // TODO: Reopen post for editing

    res.json({
      success: true,
      postId,
      status: 'rejected',
      rejectedBy: userEmail,
      reason,
      rejectedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Approvals] Rejection error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to reject content',
    });
  }
};

/**
 * GET /api/approvals/:postId/history
 * Get full audit trail for a post
 */
export const getApprovalHistory: RequestHandler = async (req, res) => {
  try {
    const { postId } = req.params;
    const brandId = req.headers['x-brand-id'] as string;

    // TODO: Verify brand access via RLS

    const auditTrail = await getPostAuditTrail(brandId, postId);

    res.json({
      postId,
      history: auditTrail,
      totalActions: auditTrail.length,
    });
  } catch (error) {
    console.error('[Approvals] History error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch approval history',
    });
  }
};

/**
 * POST /api/approvals/:postId/request
 * Request approval for a post
 */
export const requestApproval: RequestHandler = async (req, res) => {
  try {
    const { postId } = req.params;
    const { assignedTo, deadline, priority } = req.body;
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;
    const brandId = req.headers['x-brand-id'] as string;

    // TODO: Verify user is agency/admin
    // TODO: Verify post exists
    // TODO: Get client email from assignment

    // Log approval request
    await logAuditAction(
      brandId,
      postId,
      userId,
      userEmail,
      'APPROVAL_REQUESTED',
      {
        assignedTo,
        deadline,
        priority: priority || 'normal',
      },
      req.ip,
      req.headers['user-agent']
    );

    // TODO: Create approval_requests record
    // TODO: Send approval request email to client

    res.json({
      success: true,
      postId,
      requestedBy: userEmail,
      assignedTo,
      deadline,
      requestedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Approvals] Request error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to request approval',
    });
  }
};

/**
 * GET /api/approvals/pending
 * Get pending approvals for user
 */
export const getPendingApprovals: RequestHandler = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const brandId = req.query.brandId as string;

    // TODO: Query approval_requests where assignedTo = userId and status = pending
    // TODO: Filter by brandId if provided
    // TODO: Implement pagination

    // Mock response
    const pending = [
      {
        id: 'approval_1',
        postId: 'post_1',
        requestedBy: 'agency@example.com',
        deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    ];

    res.json({
      pending,
      total: pending.length,
    });
  } catch (error) {
    console.error('[Approvals] Pending error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch pending approvals',
    });
  }
};

/**
 * POST /api/approvals/send-reminder
 * Send approval reminder email
 */
export const sendApprovalReminder: RequestHandler = async (req, res) => {
  try {
    const { clientEmail, brandName, pendingCount, oldestPendingAge } = req.body;
    const brandId = req.headers['x-brand-id'] as string;
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;

    // TODO: Verify user is agency/admin

    // Generate reminder email
    const { subject, htmlBody, textBody } = generateReminderEmail({
      clientName: clientEmail.split('@')[0],
      brandName,
      pendingCount,
      oldestPendingAge,
      approvalUrl: `${process.env.CLIENT_URL}/approvals`,
      agencyName: 'Aligned AI',
      brandColor: '#8B5CF6',
    });

    // Send email
    const sendResult = await sendEmail({
      to: clientEmail,
      subject,
      htmlBody,
      textBody,
      brandId,
      userId,
      notificationType: 'approval_reminder',
    });

    if (!sendResult.success) {
      throw new Error(sendResult.error || 'Failed to send email');
    }

    // Log email send
    await logAuditAction(
      brandId,
      'system',
      userId,
      userEmail,
      'EMAIL_SENT',
      {
        emailAddress: clientEmail,
        type: 'approval_reminder',
        messageId: sendResult.messageId,
      }
    );

    res.json({
      success: true,
      messageId: sendResult.messageId,
      sentTo: clientEmail,
    });
  } catch (error) {
    console.error('[Approvals] Send reminder error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to send reminder',
    });
  }
};
