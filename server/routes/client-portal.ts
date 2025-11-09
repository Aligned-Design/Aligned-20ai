import { RequestHandler } from 'express';
import { _ClientDashboardData as ClientDashboardData, _ContentComment as ContentComment } from '@shared/client-portal';  // unused
import { clientPortalDB } from '../lib/client-portal-db-service';
import { AppError } from '../lib/error-middleware';
import { ErrorCode, HTTP_STATUS } from '../lib/error-responses';

/**
 * GET /api/client-portal/dashboard
 * Get client dashboard with content, metrics, and pending approvals
 */
export const getClientDashboard: RequestHandler = async (req, res, next) => {
  try {
    const brandId = (req as unknown).user?.brandId;
    const clientId = (req as unknown).user?.id || (req as unknown).userId;

    if (!brandId) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'brandId is required',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    // Fetch dashboard data from database
    const dashboardContent = await clientPortalDB.getClientDashboardContent(
      brandId,
      clientId,
      50,
      0
    );

    const metrics = await clientPortalDB.getClientDashboardMetrics(brandId);

    // Build response
    const dashboardData = {
      brandInfo: {
        name: 'Brand Name',
        logo: '📱',
        colors: {
          primary: '#2563eb',
          secondary: '#64748b',
        },
      },
      metrics,
      recentContent: dashboardContent.recentContent,
      upcomingPosts: dashboardContent.upcomingPosts,
      pendingApprovals: dashboardContent.pendingApprovals,
      recentComments: [],
      agencyInfo: {
        name: 'Agency Name',
        logo: '🎯',
        contactEmail: 'contact@agency.com',
        supportUrl: 'https://support.agency.com',
      },
      aiInsight: {
        title: 'Performance Insight',
        description: 'Your content is performing well. Keep up the momentum!',
        impact: 'actionable' as const,
      },
      topPerformingContent: dashboardContent.recentContent.slice(0, 3),
      quickActions: {
        approvalsNeeded: dashboardContent.pendingApprovals.length,
        reviewsAvailable: dashboardContent.upcomingPosts.length,
        eventsUpcoming: 1,
      },
    };

    res.json(dashboardData);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/client-portal/content/:contentId/approve
 * Approve content as client
 */
export const approveContent: RequestHandler = async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const { feedback } = req.body;
    const brandId = (req as unknown).user?.brandId;
    const clientId = (req as unknown).user?.id || (req as unknown).userId;

    if (!brandId || !clientId || !contentId) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'brandId, clientId, and contentId are required',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    // Approve content via database
    const approval = await clientPortalDB.approveContent(
      contentId,
      brandId,
      clientId,
      feedback
    );

    res.json({
      success: true,
      contentId,
      approved: true,
      message: 'Content approved successfully',
      approvedAt: approval.approved_at,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/client-portal/content/:contentId/reject
 * Reject content as client with feedback
 */
export const rejectContent: RequestHandler = async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const { feedback } = req.body;
    const brandId = (req as unknown).user?.brandId;
    const clientId = (req as unknown).user?.id || (req as unknown).userId;

    if (!brandId || !clientId || !contentId) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'brandId, clientId, and contentId are required',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    if (!feedback?.trim()) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'feedback is required when rejecting content',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    // Reject content via database
    const rejection = await clientPortalDB.rejectContent(
      contentId,
      brandId,
      clientId,
      feedback.trim()
    );

    res.json({
      success: true,
      contentId,
      approved: false,
      message: 'Feedback requested - content returned to drafts',
      rejectedAt: rejection.created_at,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/client-portal/content/:contentId/comments
 * Add comment to content
 */
export const addContentComment: RequestHandler = async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const { message } = req.body;
    const userId = (req as unknown).user?.id || (req as unknown).userId;
    const userName = (req as unknown).user?.name || 'User';
    const userRole = (req as unknown).user?.role || 'client';

    if (!contentId || !message?.trim()) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'contentId and message are required',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    // Add comment via database
    const comment = await clientPortalDB.addContentComment(
      contentId,
      userId,
      userName,
      userRole as unknown,
      message.trim(),
      false
    );

    res.json({
      success: true,
      comment: {
        id: comment.id,
        contentId: comment.content_id,
        userId: comment.user_id,
        userName: comment.user_name,
        userRole: comment.user_role,
        message: comment.message,
        isInternal: comment.is_internal,
        createdAt: comment.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/client-portal/content/:contentId/comments
 * Get comments for content
 */
export const getContentComments: RequestHandler = async (req, res, next) => {
  try {
    const { contentId } = req.params;

    if (!contentId) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'contentId is required',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    // Fetch comments from database
    const comments = await clientPortalDB.getContentComments(contentId);

    // Map to response format
    const mappedComments = comments.map((comment) => ({
      id: comment.id,
      contentId: comment.content_id,
      userId: comment.user_id,
      userName: comment.user_name,
      userRole: comment.user_role,
      message: comment.message,
      isInternal: comment.is_internal,
      createdAt: comment.created_at,
    }));

    res.json({
      contentId,
      comments: mappedComments,
      total: mappedComments.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/client-portal/media/upload
 * Handle file uploads from client
 */
export const uploadClientMedia: RequestHandler = async (req, res, next) => {
  try {
    const { filename, mimeType, fileSize, path } = req.body;
    const brandId = (req as unknown).user?.brandId;
    const clientId = (req as unknown).user?.id || (req as unknown).userId;

    if (!brandId || !clientId || !filename || !mimeType || fileSize === undefined) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'brandId, clientId, filename, mimeType, and fileSize are required',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    // Store upload in database
    const uploadRecord = await clientPortalDB.storeClientMediaUpload(
      brandId,
      clientId,
      filename,
      mimeType,
      fileSize,
      path || `client-uploads/${brandId}/${clientId}/${filename}`
    );

    res.json({
      success: true,
      message: 'File uploaded successfully',
      uploads: [
        {
          id: uploadRecord.id,
          filename: uploadRecord.filename,
          path: uploadRecord.path,
          uploadedAt: uploadRecord.uploadedAt,
        },
      ],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/client-portal/media
 * Get client media uploads
 */
export const getClientMedia: RequestHandler = async (req, res, next) => {
  try {
    const brandId = (req as unknown).user?.brandId;
    const clientId = (req as unknown).user?.id || (req as unknown).userId;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!brandId || !clientId) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'brandId and clientId are required',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    // Fetch media uploads from database
    const uploads = await clientPortalDB.getClientMediaUploads(brandId, clientId, limit);

    res.json({
      uploads,
      total: uploads.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/client-portal/content
 * Get all content for client portal (with filtering)
 */
export const getPortalContent: RequestHandler = async (req, res, next) => {
  try {
    const brandId = (req as unknown).user?.brandId;
    const status = req.query.status as unknown;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!brandId) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'brandId is required',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    // Fetch content from database
    const { content, total } = await clientPortalDB.getContentForClientPortal(
      brandId,
      status,
      limit,
      offset
    );

    res.json({
      content,
      total,
      hasMore: offset + content.length < total,
      limit,
      offset,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/client-portal/content/:contentId
 * Get content with comments
 */
export const getContentWithComments: RequestHandler = async (req, res, next) => {
  try {
    const { contentId } = req.params;

    if (!contentId) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'contentId is required',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    // Fetch content and comments from database
    const { content, comments } = await clientPortalDB.getContentWithComments(contentId);

    if (!content) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        'Content not found',
        HTTP_STATUS.NOT_FOUND,
        'warning'
      );
    }

    // Map comments to response format
    const mappedComments = comments.map((comment) => ({
      id: comment.id,
      contentId: comment.content_id,
      userId: comment.user_id,
      userName: comment.user_name,
      userRole: comment.user_role,
      message: comment.message,
      isInternal: comment.is_internal,
      createdAt: comment.created_at,
    }));

    res.json({
      content,
      comments: mappedComments,
      commentCount: mappedComments.length,
    });
  } catch (error) {
    next(error);
  }
};
