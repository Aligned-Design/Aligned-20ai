/**
 * Approval workflow routes
 * Handles bulk approvals, individual approvals, and approval status tracking
 */

import { RequestHandler } from 'express';
import { BulkApprovalRequest, BulkApprovalResult } from '@shared/approvals';
import { approvalsDB } from '../lib/approvals-db-service';
import { logAuditAction } from '../lib/audit-logger';
import { sendEmail } from '../lib/email-service';
import { AppError } from '../lib/error-middleware';
import { ErrorCode, HTTP_STATUS } from '../lib/error-responses';
import {
  generateReminderEmail,
} from '../lib/email-templates';

/**
 * POST /api/approvals/bulk
 * Approve or reject multiple posts in a single request
 */
export const bulkApproveContent: RequestHandler = async (req, res, next) => {
  try {
    const { postIds, action, note } = req.body as BulkApprovalRequest;
    const userId = (req as unknown).user?.id || (req as unknown).userId;
    const userEmail = (req as unknown).user?.email || req.headers['x-user-email'] as string;
    const brandId = (req as unknown).user?.brandId || req.headers['x-brand-id'] as string;
    const userRole = (req as unknown).user?.role || req.headers['x-user-role'] as string;

    // Validate required fields
    if (!userId || !brandId) {
      throw new AppError(
        ErrorCode.UNAUTHORIZED,
        'User ID and Brand ID are required',
        HTTP_STATUS.UNAUTHORIZED,
        'warning'
      );
    }

    // Validate permissions
    if (!['client', 'agency', 'admin'].includes(userRole)) {
      throw new AppError(
        ErrorCode.FORBIDDEN,
        'Invalid user role',
        HTTP_STATUS.FORBIDDEN,
        'warning'
      );
    }

    // Validate input
    if (!Array.isArray(postIds) || postIds.length === 0) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'postIds must be a non-empty array',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      throw new AppError(
        ErrorCode.INVALID_INPUT,
        'action must be approve or reject',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    // Check role permissions
    const canApprove =
      userRole === 'client' || userRole === 'admin' ||
      (userRole === 'agency' && action === 'approve');

    if (!canApprove) {
      throw new AppError(
        ErrorCode.FORBIDDEN,
        `User role '${userRole}' cannot ${action} content`,
        HTTP_STATUS.FORBIDDEN,
        'warning'
      );
    }

    // Process bulk action via database
    const results: BulkApprovalResult = {
      success: true,
      totalRequested: postIds.length,
      approved: 0,
      rejected: 0,
      skipped: 0,
      errors: [],
    };

    try {
      if (action === 'approve') {
        await approvalsDB.bulkApprovePostIds(postIds, brandId, userId);
        results.approved = postIds.length;
      } else {
        await approvalsDB.bulkRejectPostIds(postIds, brandId, userId, note || '');
        results.rejected = postIds.length;
      }

      // Log audit action for bulk operation
      await logAuditAction(
        brandId,
        'bulk_operation',
        userId,
        userEmail,
        action === 'approve' ? 'BULK_APPROVED' : 'BULK_REJECTED',
        {
          note: note || '',
          bulkCount: postIds.length,
          postIds,
        },
        req.ip,
        req.headers['user-agent']
      );
    } catch (error) {
      results.errors.push({
        postId: 'bulk_operation',
        reason: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    res.json(results);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/approvals/:postId/approve
 * Approve a single post
 */
export const approveSingleContent: RequestHandler = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { note } = req.body;
    const userId = (req as unknown).user?.id || (req as unknown).userId;
    const userEmail = (req as unknown).user?.email || req.headers['x-user-email'] as string;
    const brandId = (req as unknown).user?.brandId || req.headers['x-brand-id'] as string;
    const userRole = (req as unknown).user?.role || req.headers['x-user-role'] as string;

    // Validate required fields
    if (!userId || !brandId) {
      throw new AppError(
        ErrorCode.UNAUTHORIZED,
        'User ID and Brand ID are required',
        HTTP_STATUS.UNAUTHORIZED,
        'warning'
      );
    }

    // Validate permissions
    if (!['client', 'admin'].includes(userRole)) {
      throw new AppError(
        ErrorCode.FORBIDDEN,
        'Only clients and admins can approve content',
        HTTP_STATUS.FORBIDDEN,
        'warning'
      );
    }

    if (!postId) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'postId is required',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    // Approve post via database
    const approvedPost = await approvalsDB.approvePost(postId, brandId, userId, note);

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

    res.json({
      success: true,
      postId,
      status: 'approved',
      approvedBy: userEmail,
      approvedAt: approvedPost.approval_date || new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/approvals/:postId/reject
 * Reject a post with required changes
 */
export const rejectContent: RequestHandler = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { reason, note } = req.body;
    const userId = (req as unknown).user?.id || (req as unknown).userId;
    const userEmail = (req as unknown).user?.email || req.headers['x-user-email'] as string;
    const brandId = (req as unknown).user?.brandId || req.headers['x-brand-id'] as string;
    const userRole = (req as unknown).user?.role || req.headers['x-user-role'] as string;

    // Validate required fields
    if (!userId || !brandId) {
      throw new AppError(
        ErrorCode.UNAUTHORIZED,
        'User ID and Brand ID are required',
        HTTP_STATUS.UNAUTHORIZED,
        'warning'
      );
    }

    // Validate permissions
    if (!['client', 'admin'].includes(userRole)) {
      throw new AppError(
        ErrorCode.FORBIDDEN,
        'Only clients and admins can reject content',
        HTTP_STATUS.FORBIDDEN,
        'warning'
      );
    }

    // Validate input
    if (!reason) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'reason is required for rejections',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    if (!postId) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'postId is required',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    // Reject post via database
    const rejectedPost = await approvalsDB.rejectPost(postId, brandId, userId, reason, note);

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

    res.json({
      success: true,
      postId,
      status: 'rejected',
      rejectedBy: userEmail,
      reason,
      rejectedAt: rejectedPost.rejection_date || new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/approvals/:postId/history
 * Get full audit trail for a post
 */
export const getApprovalHistory: RequestHandler = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const brandId = (req as unknown).user?.brandId || req.headers['x-brand-id'] as string;

    if (!brandId) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'Brand ID is required',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    if (!postId) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'postId is required',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    // Get approval history from database
    const auditTrail = await approvalsDB.getApprovalHistory(postId, brandId);

    res.json({
      postId,
      history: auditTrail,
      totalActions: auditTrail.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/approvals/:postId/request
 * Request approval for a post
 */
export const requestApproval: RequestHandler = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { assignedTo, deadline, priority } = req.body;
    const userId = (req as unknown).user?.id || (req as unknown).userId;
    const userEmail = (req as unknown).user?.email || req.headers['x-user-email'] as string;
    const brandId = (req as unknown).user?.brandId || req.headers['x-brand-id'] as string;

    // Validate required fields
    if (!userId || !brandId || !postId || !assignedTo) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'userId, brandId, postId, and assignedTo are required',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    // Create approval request via database
    const approvalRequest = await approvalsDB.createApprovalRequest(
      postId,
      brandId,
      userId,
      assignedTo,
      (priority || 'normal') as 'low' | 'normal' | 'high',
      deadline
    );

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

    res.json({
      success: true,
      postId,
      requestedBy: userEmail,
      assignedTo,
      deadline,
      requestedAt: approvalRequest.created_at,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/approvals/pending
 * Get pending approvals for user
 */
export const getPendingApprovals: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as unknown).user?.id || (req as unknown).userId;
    const brandId = (req as unknown).user?.brandId || req.query.brandId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      throw new AppError(
        ErrorCode.UNAUTHORIZED,
        'User ID is required',
        HTTP_STATUS.UNAUTHORIZED,
        'warning'
      );
    }

    // Get pending approvals from database
    const { approvals, total } = await approvalsDB.getPendingApprovalsForUser(
      userId,
      brandId as string | undefined,
      limit,
      offset
    );

    // Map database records to response format
    const pending = approvals.map((approval) => ({
      id: approval.id,
      postId: approval.post_id,
      requestedBy: approval.requested_by,
      deadline: approval.deadline,
      priority: approval.priority,
      status: approval.status,
      createdAt: approval.created_at,
    }));

    res.json({
      pending,
      total,
      hasMore: offset + pending.length < total,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/approvals/send-reminder
 * Send approval reminder email
 */
export const sendApprovalReminder: RequestHandler = async (req, res, next) => {
  try {
    const { clientEmail, brandName, pendingCount, oldestPendingAge } = req.body;
    const brandId = (req as unknown).user?.brandId || req.headers['x-brand-id'] as string;
    const userId = (req as unknown).user?.id || (req as unknown).userId;
    const userEmail = (req as unknown).user?.email || req.headers['x-user-email'] as string;

    // Validate required fields
    if (!brandId || !userId || !clientEmail || !brandName) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'brandId, userId, clientEmail, and brandName are required',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

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
      throw new AppError(
        ErrorCode.EMAIL_SERVICE_ERROR,
        sendResult.error || 'Failed to send email',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'warning'
      );
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
    next(error);
  }
};
