import { RequestHandler } from 'express';
import { WorkflowTemplate, WorkflowAction } from '@shared/workflow';
import { workflowDB } from '../lib/workflow-db-service';
import { AppError } from '../lib/error-middleware';
import { ErrorCode, HTTP_STATUS } from '../lib/error-responses';

/**
 * GET /api/workflow/templates
 * Get workflow templates for a brand
 */
export const getWorkflowTemplates: RequestHandler = async (req, res, next) => {
  try {
    const { brandId } = req.query;
    const userBrandId = (req as unknown).user?.brandId;

    // Use provided brandId or fall back to user's brand
    const targetBrandId = (brandId as string) || userBrandId;

    if (!targetBrandId) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'brandId is required',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    // Fetch templates from database
    const templates = await workflowDB.getWorkflowTemplates(targetBrandId);
    res.json(templates);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/workflow/templates
 * Create a new workflow template
 */
export const createWorkflowTemplate: RequestHandler = async (req, res, next) => {
  try {
    const template: Omit<WorkflowTemplate, 'id' | 'createdAt' | 'updatedAt'> = req.body;
    const userBrandId = (req as unknown).user?.brandId;

    if (!userBrandId) {
      throw new AppError(
        ErrorCode.UNAUTHORIZED,
        'Brand ID is required',
        HTTP_STATUS.UNAUTHORIZED,
        'warning'
      );
    }

    if (!template.name || !template.steps || template.steps.length === 0) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'name and steps are required',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    // Create template in database
    const createdTemplate = await workflowDB.createWorkflowTemplate(userBrandId, {
      ...template,
      brand_id: userBrandId,
    } as unknown);

    res.json({ success: true, template: createdTemplate });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/workflow/start
 * Start a workflow for content
 */
export const startWorkflow: RequestHandler = async (req, res, next) => {
  try {
    const { contentId, templateId, assignedUsers, priority, deadline } = req.body;
    const brandId = (req as unknown).user?.brandId;
    const _userId = (req as unknown).user?.id || (req as unknown).userId;

    // Validate required fields
    if (!brandId || !contentId || !templateId || !assignedUsers) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'brandId, contentId, templateId, and assignedUsers are required',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    // Start workflow via database
    const workflowInstance = await workflowDB.startWorkflow(
      brandId,
      contentId,
      templateId,
      assignedUsers,
      priority || 'medium',
      deadline
    );

    res.json({ success: true, workflow: workflowInstance });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/workflow/:workflowId/action
 * Process a workflow action (approve, reject, comment, etc)
 */
export const processWorkflowAction: RequestHandler = async (req, res, next) => {
  try {
    const { workflowId } = req.params;
    const action: WorkflowAction = req.body;
    const _userId = (req as unknown).user?.id || (req as unknown).userId;

    // Validate input
    if (!workflowId) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'workflowId is required',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    if (!action || !action.type || !action.stepId) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'action.type and action.stepId are required',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    // Process action via database
    const updatedWorkflow = await workflowDB.processWorkflowAction(
      workflowId,
      action.stepId,
      action.type as 'approve' | 'reject' | 'comment' | 'reassign',
      action.details || {}
    );

    res.json({ success: true, workflow: updatedWorkflow });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/workflow/notifications
 * Get workflow notifications for user
 */
export const getWorkflowNotifications: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as unknown).user?.id || (req as unknown).userId;
    const unreadOnly = req.query.unreadOnly === 'true';

    if (!userId) {
      throw new AppError(
        ErrorCode.UNAUTHORIZED,
        'User ID is required',
        HTTP_STATUS.UNAUTHORIZED,
        'warning'
      );
    }

    // Fetch notifications from database
    const notifications = unreadOnly
      ? await workflowDB.getUnreadNotifications(userId)
      : [];

    // Map to response format
    const mappedNotifications = notifications.map((notif) => ({
      id: notif.id,
      workflowId: notif.workflow_id,
      type: notif.type,
      message: notif.message,
      readAt: notif.read_at,
      createdAt: notif.created_at,
    }));

    res.json({
      notifications: mappedNotifications,
      total: mappedNotifications.length,
      unread: mappedNotifications.filter((n) => !n.readAt).length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/workflow/notifications/:notificationId/read
 * Mark notification as read
 */
export const markNotificationRead: RequestHandler = async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    if (!notificationId) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'notificationId is required',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    // Mark as read via database
    await workflowDB.markNotificationRead(notificationId);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/workflow/:workflowId/cancel
 * Cancel a workflow
 */
export const cancelWorkflow: RequestHandler = async (req, res, next) => {
  try {
    const { workflowId } = req.params;
    const { reason } = req.body;

    if (!workflowId) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'workflowId is required',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    // Cancel via database
    await workflowDB.cancelWorkflow(workflowId, reason);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/workflow/:workflowId
 * Get a specific workflow instance
 */
export const getWorkflow: RequestHandler = async (req, res, next) => {
  try {
    const { workflowId } = req.params;

    if (!workflowId) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'workflowId is required',
        HTTP_STATUS.BAD_REQUEST,
        'warning'
      );
    }

    // Fetch workflow from database
    const workflow = await workflowDB.getWorkflowInstance(workflowId);

    if (!workflow) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        'Workflow not found',
        HTTP_STATUS.NOT_FOUND,
        'warning'
      );
    }

    res.json(workflow);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/workflow/content/:contentId
 * Get workflow instances for content
 */
export const getWorkflowsForContent: RequestHandler = async (req, res, next) => {
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

    // Fetch workflows from database
    const workflows = await workflowDB.getWorkflowInstancesForContent(contentId);

    res.json({
      contentId,
      workflows,
      total: workflows.length,
    });
  } catch (error) {
    next(error);
  }
};
