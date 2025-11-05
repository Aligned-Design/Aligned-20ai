/**
 * Escalation Routes
 * RESTful endpoints for managing escalation rules and events
 */

import { Router, Request, RequestHandler } from 'express';
import { z } from 'zod';
import { escalationRules, escalationEvents, postApprovals, auditLogs } from '../lib/dbClient';
import {
  EscalationRuleSchema,
  CreateEscalationRuleSchema,
  UpdateEscalationRuleSchema,
  EscalationEventSchema,
  EscalationQuerySchema,
  CreateEscalationRequestSchema,
  UpdateEscalationEventSchema,
  calculateEscalationTime,
} from '@shared/escalation';

const router = Router();

// ==================== REQUEST VALIDATION ====================

interface AuthRequest extends Request {
  headers: {
    'x-brand-id'?: string;
    'x-user-id'?: string;
    'x-user-email'?: string;
  };
}

// Middleware: Extract brand ID from headers
const requireBrandId: RequestHandler = (req: any, res: any, next: any) => {
  const brandId = req.headers['x-brand-id'];
  if (!brandId) {
    return res.status(400).json({ error: 'Missing x-brand-id header' });
  }
  req.brandId = brandId;
  next();
};

router.use(requireBrandId);

// ==================== ESCALATION RULES ROUTES ====================

/**
 * GET /api/escalations/rules
 * Get all escalation rules for a brand
 */
router.get('/rules', async (req: AuthRequest, res: any) => {
  try {
    const brandId = (req as any).brandId;

    const rules = await escalationRules.getByBrand(brandId, true);

    res.json({
      success: true,
      data: rules,
      count: rules.length,
    });
  } catch (error) {
    console.error('[Escalation Routes] GET /rules error:', error);
    res.status(500).json({
      error: 'Failed to fetch escalation rules',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/escalations/rules/:ruleId
 * Get a specific escalation rule
 */
router.get('/rules/:ruleId', async (req: AuthRequest, res: any) => {
  try {
    const { ruleId } = req.params;

    const rule = await escalationRules.getById(ruleId);
    if (!rule) {
      return res.status(404).json({ error: 'Escalation rule not found' });
    }

    res.json({
      success: true,
      data: rule,
    });
  } catch (error) {
    console.error('[Escalation Routes] GET /rules/:ruleId error:', error);
    res.status(500).json({
      error: 'Failed to fetch escalation rule',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/escalations/rules
 * Create a new escalation rule
 */
router.post('/rules', async (req: AuthRequest, res: any) => {
  try {
    const brandId = (req as any).brandId;
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;

    // Validate request
    const payload = CreateEscalationRuleSchema.parse({
      ...req.body,
      brand_id: brandId,
    });

    // Create rule
    const rule = await escalationRules.create({
      ...payload,
      brand_id: brandId,
      created_by: userId,
    } as any);

    // Audit log
    await auditLogs.create({
      brand_id: brandId,
      actor_id: userId,
      actor_email: userEmail,
      action: 'ESCALATION_RULE_CREATED',
      metadata: {
        rule_id: rule.id,
        rule_type: rule.rule_type,
        trigger_hours: rule.trigger_hours,
      },
    });

    res.status(201).json({
      success: true,
      data: rule,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
    }

    console.error('[Escalation Routes] POST /rules error:', error);
    res.status(500).json({
      error: 'Failed to create escalation rule',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PUT /api/escalations/rules/:ruleId
 * Update an escalation rule
 */
router.put('/rules/:ruleId', async (req: AuthRequest, res: any) => {
  try {
    const { ruleId } = req.params;
    const brandId = (req as any).brandId;
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;

    // Verify rule exists
    const existingRule = await escalationRules.getById(ruleId);
    if (!existingRule) {
      return res.status(404).json({ error: 'Escalation rule not found' });
    }

    // Validate request
    const updates = UpdateEscalationRuleSchema.parse(req.body);

    // Update rule
    const updatedRule = await escalationRules.update(ruleId, updates as any);

    // Audit log
    await auditLogs.create({
      brand_id: brandId,
      actor_id: userId,
      actor_email: userEmail,
      action: 'ESCALATION_RULE_UPDATED',
      metadata: {
        rule_id: ruleId,
        changes: updates,
      },
    });

    res.json({
      success: true,
      data: updatedRule,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
    }

    console.error('[Escalation Routes] PUT /rules/:ruleId error:', error);
    res.status(500).json({
      error: 'Failed to update escalation rule',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/escalations/rules/:ruleId
 * Delete an escalation rule
 */
router.delete('/rules/:ruleId', async (req: AuthRequest, res: any) => {
  try {
    const { ruleId } = req.params;
    const brandId = (req as any).brandId;
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;

    // Verify rule exists
    const existingRule = await escalationRules.getById(ruleId);
    if (!existingRule) {
      return res.status(404).json({ error: 'Escalation rule not found' });
    }

    // Delete rule
    await escalationRules.delete(ruleId);

    // Audit log
    await auditLogs.create({
      brand_id: brandId,
      actor_id: userId,
      actor_email: userEmail,
      action: 'ESCALATION_RULE_DELETED',
      metadata: {
        rule_id: ruleId,
        rule_type: existingRule.rule_type,
      },
    });

    res.json({
      success: true,
      message: 'Escalation rule deleted',
    });
  } catch (error) {
    console.error('[Escalation Routes] DELETE /rules/:ruleId error:', error);
    res.status(500).json({
      error: 'Failed to delete escalation rule',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ==================== ESCALATION EVENTS ROUTES ====================

/**
 * GET /api/escalations/events
 * Get escalation events for a brand
 */
router.get('/events', async (req: AuthRequest, res: any) => {
  try {
    const brandId = (req as any).brandId;
    const { status, level, limit = 50, offset = 0 } = req.query;

    const { events, total } = await escalationEvents.query({
      brandId,
      status: status as string | undefined,
      escalationLevel: level as string | undefined,
      limit: parseInt(limit as string) || 50,
      offset: parseInt(offset as string) || 0,
    });

    res.json({
      success: true,
      data: events,
      pagination: {
        total,
        limit: parseInt(limit as string) || 50,
        offset: parseInt(offset as string) || 0,
        hasMore: (parseInt(offset as string) || 0) + (parseInt(limit as string) || 50) < total,
      },
    });
  } catch (error) {
    console.error('[Escalation Routes] GET /events error:', error);
    res.status(500).json({
      error: 'Failed to fetch escalation events',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/escalations/events/:eventId
 * Get a specific escalation event
 */
router.get('/events/:eventId', async (req: AuthRequest, res: any) => {
  try {
    const { eventId } = req.params;

    const event = await escalationEvents.getById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Escalation event not found' });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('[Escalation Routes] GET /events/:eventId error:', error);
    res.status(500).json({
      error: 'Failed to fetch escalation event',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/escalations/events
 * Create a new escalation event
 */
router.post('/events', async (req: AuthRequest, res: any) => {
  try {
    const brandId = (req as any).brandId;
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;

    // Validate request
    const payload = CreateEscalationRequestSchema.parse(req.body);

    // Get rule for scheduling calculation
    const rule = await escalationRules.getById(payload.rule_id);
    if (!rule) {
      return res.status(404).json({ error: 'Escalation rule not found' });
    }

    // Get approval for timing reference
    const approval = await postApprovals.getById(payload.approval_id);
    if (!approval) {
      return res.status(404).json({ error: 'Approval not found' });
    }

    // Calculate scheduled send time
    const scheduledSendAt = payload.scheduled_send_at
      ? new Date(payload.scheduled_send_at)
      : calculateEscalationTime(approval.created_at, rule.trigger_hours);

    // Create event
    const event = await escalationEvents.create({
      brand_id: brandId,
      approval_id: payload.approval_id,
      rule_id: payload.rule_id,
      escalation_level: payload.escalation_level,
      escalated_to_role: rule.escalate_to_role,
      escalated_to_user_id: rule.escalate_to_user_id,
      notification_type: (rule.notify_via[0] as any) || 'email',
      triggered_at: new Date().toISOString(),
      scheduled_send_at: scheduledSendAt.toISOString(),
      status: 'pending',
      delivery_attempt_count: 0,
    } as any);

    // Audit log
    await auditLogs.create({
      brand_id: brandId,
      actor_id: userId,
      actor_email: userEmail,
      action: 'ESCALATION_CREATED',
      metadata: {
        event_id: event.id,
        escalation_level: payload.escalation_level,
        approval_id: payload.approval_id,
      },
    });

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
    }

    console.error('[Escalation Routes] POST /events error:', error);
    res.status(500).json({
      error: 'Failed to create escalation event',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PUT /api/escalations/events/:eventId
 * Update an escalation event status
 */
router.put('/events/:eventId', async (req: AuthRequest, res: any) => {
  try {
    const { eventId } = req.params;
    const brandId = (req as any).brandId;
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;

    // Verify event exists
    const existingEvent = await escalationEvents.getById(eventId);
    if (!existingEvent) {
      return res.status(404).json({ error: 'Escalation event not found' });
    }

    // Validate request
    const updates = UpdateEscalationEventSchema.parse(req.body);

    // Handle resolution
    if (updates.status === 'resolved') {
      const event = await escalationEvents.markAsResolved(
        eventId,
        updates.resolved_by || userId,
        updates.reason
      );

      // Audit log
      await auditLogs.create({
        brand_id: brandId,
        actor_id: userId,
        actor_email: userEmail,
        action: 'ESCALATION_RESOLVED',
        metadata: {
          event_id: eventId,
          reason: updates.reason,
        },
      });

      return res.json({
        success: true,
        data: event,
      });
    }

    // For other updates, we'd update the event directly
    // This is a simplified version
    res.json({
      success: true,
      data: existingEvent,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
    }

    console.error('[Escalation Routes] PUT /events/:eventId error:', error);
    res.status(500).json({
      error: 'Failed to update escalation event',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
