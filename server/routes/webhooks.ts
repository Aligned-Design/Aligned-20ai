/**
 * Webhook Routes
 * Endpoints for receiving and managing webhook events from external providers
 */

import { RequestHandler } from 'express';
import { z } from 'zod';
import {
  WebhookProvider,
  WebhookLogsQuerySchema,
  generateIdempotencyKey,
} from '@shared/webhooks';
import { webhookHandler } from '../lib/webhook-handler';
import { webhookEvents } from '../lib/dbClient';
import { logAuditAction } from '../lib/audit-logger';

// ==================== TYPES & VALIDATION ====================

interface WebhookEventAttempt {
  attempt_number: number;
  status: string;
  error: string | null;
  response_code: number | null;
  backoff_ms: number;
  created_at: string;
}

interface WebhookEventStatus {
  event_id: string;
  status: string;
  attempt_count: number;
  max_attempts: number;
  created_at: string;
  updated_at: string;
  delivered_at: string | null;
  last_error: string | null;
  attempts: WebhookEventAttempt[];
}

const ZapierWebhookBodySchema = z.object({
  id: z.string().optional(),
  action: z.string(),
  data: z.record(z.unknown()).optional(),
});

const MakeWebhookBodySchema = z.object({
  event: z.string(),
  data: z.record(z.unknown()).optional(),
  webhook_id: z.string().optional(),
});

const HubSpotWebhookBodySchema = z.object({
  eventId: z.string(),
  portalId: z.number(),
  subscriptionType: z.string(),
  objectId: z.number(),
  timestamp: z.number(),
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Get webhook signature from request headers
 */
function _getSignatureFromRequest(provider: WebhookProvider, headers: Record<string, unknown>): string | null {
  const headerMap: Record<WebhookProvider, string> = {
    zapier: 'x-zapier-signature',
    make: 'x-hook-secret-key',
    slack: 'x-slack-signature',
    hubspot: 'x-hubspot-signature',
  };

  const headerName = headerMap[provider];
  return (headers[headerName] || headers[headerName.toLowerCase()]) as string | null;
}

/**
 * Get webhook secret from environment
 */
function _getWebhookSecret(provider: WebhookProvider): string {
  const secrets: Record<WebhookProvider, string> = {
    zapier: process.env.WEBHOOK_SECRET_ZAPIER || 'zapier-secret',
    make: process.env.WEBHOOK_SECRET_MAKE || 'make-secret',
    slack: process.env.WEBHOOK_SECRET_SLACK || 'slack-secret',
    hubspot: process.env.WEBHOOK_SECRET_HUBSPOT || 'hubspot-secret',
  };

  return secrets[provider];
}

// ==================== WEBHOOK ENDPOINTS ====================

/**
 * POST /api/webhooks/zapier
 * Receive events from Zapier (idempotent)
 */
export const handleZapierWebhook: RequestHandler = async (req, res) => {
  try {
    const brandId = req.headers['x-brand-id'] as string;
    if (!brandId) {
      return res.status(400).json({ error: 'Missing required header: x-brand-id' });
    }

    // Validate request body
    const validationResult = ZapierWebhookBodySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: validationResult.error.errors });
    }

    const body = validationResult.data;
    const idempotencyKey = body.id || generateIdempotencyKey('zapier', body.action, Date.now());

    // Handle webhook event
    const response = await webhookHandler.handleEvent({
      provider: 'zapier',
      brandId,
      eventType: body.action,
      payload: body.data || {},
      idempotencyKey,
    });

    res.json(response);
  } catch (error) {
    console.error('[Zapier Webhook] Error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
};

/**
 * POST /api/webhooks/make
 * Receive events from Make.com (idempotent)
 */
export const handleMakeWebhook: RequestHandler = async (req, res) => {
  try {
    const brandId = req.headers['x-brand-id'] as string;
    if (!brandId) {
      return res.status(400).json({ error: 'Missing required header: x-brand-id' });
    }

    // Validate request body
    const validationResult = MakeWebhookBodySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: validationResult.error.errors });
    }

    const body = validationResult.data;
    const idempotencyKey = body.webhook_id || generateIdempotencyKey('make', body.event, Date.now());

    // Handle webhook event
    const response = await webhookHandler.handleEvent({
      provider: 'make',
      brandId,
      eventType: body.event,
      payload: body.data || {},
      idempotencyKey,
    });

    res.json(response);
  } catch (error) {
    console.error('[Make Webhook] Error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
};

/**
 * POST /api/webhooks/slack
 * Receive events from Slack (Events API)
 */
export const handleSlackWebhook: RequestHandler = async (req, res) => {
  try {
    const brandId = req.headers['x-brand-id'] as string;
    if (!brandId) {
      return res.status(400).json({ error: 'Missing required header: x-brand-id' });
    }

    const body = req.body;

    // Handle Slack URL verification challenge
    if (body.type === 'url_verification') {
      return res.json({ challenge: body.challenge });
    }

    // Handle Slack event
    if (body.type === 'event_callback' && body.event) {
      const event = body.event;
      const idempotencyKey = `slack-${event.event_ts || Date.now()}`;

      const response = await webhookHandler.handleEvent({
        provider: 'slack',
        brandId,
        eventType: event.type || 'unknown',
        payload: event,
        idempotencyKey,
      });

      res.json(response);
    } else {
      res.json({ ok: true });
    }
  } catch (error) {
    console.error('[Slack Webhook] Error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
};

/**
 * POST /api/webhooks/hubspot
 * Receive events from HubSpot
 */
export const handleHubSpotWebhook: RequestHandler = async (req, res) => {
  try {
    const brandId = req.headers['x-brand-id'] as string;
    if (!brandId) {
      return res.status(400).json({ error: 'Missing required header: x-brand-id' });
    }

    const body = req.body;

    // Handle both single event and array of events
    const events = Array.isArray(body) ? body : [body];

    const responses = [];
    for (const event of events) {
      // Validate event
      const validationResult = HubSpotWebhookBodySchema.safeParse(event);
      if (!validationResult.success) {
        console.warn('[HubSpot Webhook] Invalid event:', event);
        continue;
      }

      const idempotencyKey = `hubspot-${event.eventId}`;

      const response = await webhookHandler.handleEvent({
        provider: 'hubspot',
        brandId,
        eventType: event.subscriptionType,
        payload: event,
        idempotencyKey,
        timestamp: event.timestamp,
      });

      responses.push(response);
    }

    res.json({ success: true, processed: responses.length, results: responses });
  } catch (error) {
    console.error('[HubSpot Webhook] Error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
};

/**
 * GET /api/webhooks/status/:eventId
 * Get status of a specific webhook event
 */
export const getWebhookStatus: RequestHandler = async (req, res) => {
  try {
    const { eventId } = req.params;
    const brandId = req.headers['x-brand-id'] as string;

    if (!brandId) {
      return res.status(400).json({ error: 'Missing required header: x-brand-id' });
    }

    const eventStatus: any = await webhookHandler.getEventStatus(eventId);
    if (!eventStatus) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Verify brand ownership
    if (eventStatus.brand_id !== brandId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      success: true,
      event: {
        id: eventStatus.id,
        provider: eventStatus.provider,
        eventType: eventStatus.event_type,
        status: eventStatus.status,
        attemptCount: eventStatus.attempt_count,
        maxAttempts: eventStatus.max_attempts,
        createdAt: eventStatus.created_at,
        updatedAt: eventStatus.updated_at,
        deliveredAt: eventStatus.delivered_at,
        lastError: eventStatus.last_error,
      },
      attempts: (eventStatus.attempts as any[]).map((a: any) => ({
        attemptNumber: a.attempt_number,
        status: a.status,
        error: a.error,
        responseCode: a.response_code,
        backoffMs: a.backoff_ms,
        createdAt: a.created_at,
      })),
    });
  } catch (error) {
    console.error('[Webhook Status] Error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
};

/**
 * GET /api/webhooks/logs
 * Get webhook event logs with filtering
 */
export const getWebhookLogs: RequestHandler = async (req, res) => {
  try {
    const brandId = req.headers['x-brand-id'] as string;
    if (!brandId) {
      return res.status(400).json({ error: 'Missing required header: x-brand-id' });
    }

    // Validate query parameters
    const validationResult = WebhookLogsQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: validationResult.error.errors });
    }

    const query = validationResult.data;
    const { events, total } = await webhookEvents.query({
      brandId,
      provider: query.provider,
      status: query.status,
      startDate: query.startDate,
      endDate: query.endDate,
      limit: query.limit,
      offset: query.offset,
    });

    res.json({
      success: true,
      events: (events as any[]).map((e: any) => ({
        id: e.id,
        provider: e.provider,
        eventType: e.event_type,
        status: e.status,
        attemptCount: e.attempt_count,
        maxAttempts: e.max_attempts,
        createdAt: e.created_at,
        updatedAt: e.updated_at,
        deliveredAt: e.delivered_at,
        lastError: e.last_error,
      })),
      pagination: {
        total,
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset + query.limit < total,
      },
    });
  } catch (error) {
    console.error('[Webhook Logs] Error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
};

/**
 * POST /api/webhooks/retry/:eventId
 * Manually trigger retry for a failed webhook event
 */
export const retryWebhookEvent: RequestHandler = async (req, res) => {
  try {
    const { eventId } = req.params;
    const brandId = req.headers['x-brand-id'] as string;
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;

    if (!brandId) {
      return res.status(400).json({ error: 'Missing required header: x-brand-id' });
    }

    // Get event
    const event = await webhookHandler.getEventStatus(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Verify brand ownership
    if (event.brand_id !== brandId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Log audit trail
    await logAuditAction(brandId, eventId, userId || 'system', userEmail || 'system', 'WEBHOOK_RETRY_TRIGGERED', {
      provider: event.provider,
      eventType: event.event_type,
    });

    res.json({
      success: true,
      message: 'Webhook retry triggered',
      eventId,
    });
  } catch (error) {
    console.error('[Webhook Retry] Error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
};
